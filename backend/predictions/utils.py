import os
import pandas as pd
import json
import pickle
from sklearn.ensemble import RandomForestRegressor
from django.conf import settings

_rf_model = None
_df_cutoffs = None

def get_rf_model():
    global _rf_model
    if _rf_model is not None:
        return _rf_model
    
    pickle_path = os.path.join(settings.BASE_DIR, 'predictions', 'jee_rf_model.pkl')
    csv_path = os.path.join(settings.BASE_DIR, '..', 'dataset', 'jee_marks_percentile_rank_2009_2026.csv')
    
    # Try loading from pre-trained pickled model first (Fast path: ~1-2ms)
    if os.path.exists(pickle_path):
        try:
            with open(pickle_path, 'rb') as f:
                _rf_model = pickle.load(f)
            return _rf_model
        except Exception:
            # Fall back to training if pickle is corrupted
            pass
            
    # Training fallback path (Slow path: ~100ms, only runs once to generate pickle)
    if os.path.exists(csv_path):
        try:
            df = pd.read_csv(csv_path)
            df = df.dropna(subset=['Marks', 'Percentile'])
            X = df[['Marks']].values
            y = df['Percentile'].values
            model = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42)
            model.fit(X, y)
            _rf_model = model
            
            # Serialize for future fast loads
            os.makedirs(os.path.dirname(pickle_path), exist_ok=True)
            with open(pickle_path, 'wb') as f:
                pickle.dump(model, f)
        except Exception:
            pass
            
    return _rf_model

def get_cutoffs_df():
    global _df_cutoffs
    if _df_cutoffs is not None:
        return _df_cutoffs
    
    cutoff_path = os.path.join(settings.BASE_DIR, '..', 'dataset', 'jee_college_cutoffs_nits.csv')
    if os.path.exists(cutoff_path):
        try:
            _df_cutoffs = pd.read_csv(cutoff_path)
        except Exception:
            _df_cutoffs = pd.DataFrame()
    else:
        _df_cutoffs = pd.DataFrame()
    return _df_cutoffs

def predict_rank_logic(expected_marks):
    model = get_rf_model()
    predicted_percentile = 0.0
    if model:
        predicted_percentile = model.predict([[expected_marks]])[0]
        predicted_percentile = max(0.0, min(100.0, predicted_percentile))
        
    TOTAL_JEE_CANDIDATES = 1200000
    predicted_rank = int((100 - predicted_percentile) * TOTAL_JEE_CANDIDATES / 100)
    if predicted_rank == 0:
        predicted_rank = 1
    
    return round(predicted_percentile, 2), predicted_rank

def get_college_recommendations(predicted_rank, category, interests=None, stream=None):
    df_cutoffs = get_cutoffs_df()
    if df_cutoffs.empty:
        return []

    # Filter by stream if provided (column name is 'stream' in CSV)
    if stream:
        if 'stream' in df_cutoffs.columns:
            df_cutoffs = df_cutoffs[df_cutoffs['stream'].str.lower() == stream.lower()]
        else:
            # No stream column in cutoffs data; skip stream filtering
            pass

    # Map category to CSV column values
    cat_map = {
        'General': 'General',
        'OBC': 'OBC-NCL',
        'OBC-NCL': 'OBC-NCL',
        'SC': 'SC',
        'ST': 'ST',
        'EWS': 'EWS'
    }
    mapped_cat = cat_map.get(category, 'General')
    # Filter by category
    category_df = df_cutoffs[df_cutoffs['Category'] == mapped_cat]
    if category_df.empty:
        category_df = df_cutoffs[df_cutoffs['Category'] == 'General']

    # Filter by rank - first try to find strictly eligible colleges
    eligible_df = category_df[category_df['Closing_Rank'] >= predicted_rank]
    if eligible_df.empty:
        # If none strictly eligible, use top 10 closest
        eligible_df = category_df.sort_values(by='Closing_Rank', ascending=False).head(10)

    # Match by interests if provided
    if interests:
        if isinstance(interests, str):
            try:
                interests = json.loads(interests)
            except:
                interests = [interests]
        interest_words = [i.lower() for i in interests]
        def match_interest(branch):
            branch_lower = str(branch).lower()
            return any(w in branch_lower for w in interest_words)
        mask = eligible_df['Branch'].apply(match_interest)
        if mask.any():
            eligible_df = eligible_df[mask]

    # Use most recent year if available
    if not eligible_df.empty and 'Year' in eligible_df.columns:
        max_year = eligible_df['Year'].max()
        eligible_df = eligible_df[eligible_df['Year'] == max_year]

    # Sort by closeness of closing rank to predicted rank
    eligible_df['rank_diff'] = (eligible_df['Closing_Rank'] - predicted_rank).abs()
    top_recs = eligible_df.sort_values(by='rank_diff').head(10)

    colleges_data = []
    for _, row in top_recs.iterrows():
        rank_diff = row['Closing_Rank'] - predicted_rank
        # Simple match_score calculation
        match_score = max(20, min(100, int(100 - (abs(rank_diff) / row['Closing_Rank']) * 50)))
        chance = 'High' if rank_diff >= 0 and match_score > 80 else 'Medium' if rank_diff >= 0 and match_score > 60 else 'Low'
        colleges_data.append({
            'name': str(row.get('Institute', 'N/A')),
            'course': str(row.get('Branch', 'N/A')),
            'fee': 'As per norms',
            'chance': chance,
            'match_score': match_score
        })
    return colleges_data
