import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Award, Target, Loader2, Sparkles, School, MapPin, ChevronRight } from 'lucide-react';

export default function RankPredictor() {
  const [formData, setFormData] = useState({
    marks: '',
    category: 'General'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const categories = ['General', 'OBC-NCL', 'SC', 'ST', 'EWS'];

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!formData.marks || loading) return;

    setLoading(true);
    setError(null);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${baseUrl}/api/predictions/rank/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          expected_marks: formData.marks,
          category: formData.category
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Prediction error:", err);
      setError(err.message || "Something went wrong. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pt-32 pb-16 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">JEE <span className="text-gradient">Rank & College Predictor</span></h1>
        <p className="text-slate-400">Predict your AIR and see eligible NITs/IIITs based on your category.</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Input Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 glass-panel p-8 rounded-3xl sticky top-32"
        >
          <form onSubmit={handlePredict} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Expected JEE Marks (out of 300)</label>
              <input 
                type="number" 
                max="300" 
                min="0"
                value={formData.marks}
                onChange={(e) => setFormData({...formData, marks: e.target.value})}
                placeholder="e.g. 180"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors text-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-900/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Predict Results</>}
            </button>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
          </form>
          
          <div className="mt-8 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <p className="text-xs text-slate-400 leading-relaxed italic">
              *Predictions are based on historical JoSAA cutoff trends and session data.
            </p>
          </div>
        </motion.div>

        {/* Results Area */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                {/* Score Stats */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="glass-panel p-6 rounded-2xl flex justify-between items-center bg-primary-900/10">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Predicted Percentile</p>
                      <p className="text-3xl font-bold text-white">{result.predicted_percentile}%</p>
                    </div>
                    <TrendingUp className="text-primary-400 w-10 h-10" />
                  </div>
                  <div className="glass-panel p-6 rounded-2xl flex justify-between items-center bg-secondary-900/10">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Estimated All India Rank</p>
                      <p className="text-3xl font-bold text-white">#{result.predicted_rank.toLocaleString()}</p>
                    </div>
                    <Award className="text-accent-gold w-10 h-10" />
                  </div>
                </div>

                {/* College Recommendations */}
                <div className="glass-panel p-8 rounded-3xl border-primary-500/20">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <School className="text-primary-400" /> Eligible Colleges & Branches
                    </h3>
                    <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-slate-400">
                      Category: {result.category}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {result.eligible_colleges && result.eligible_colleges.length > 0 ? (
                      result.eligible_colleges.map((college, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={idx}
                          className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group"
                        >
                          <div className="flex gap-4 items-start">
                            <div className="mt-1 p-2 bg-primary-500/10 rounded-lg">
                              <Target className="w-5 h-5 text-primary-400" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-lg group-hover:text-primary-400 transition-colors">{college.name}</h4>
                              <p className="text-slate-400 flex items-center gap-1 text-sm mt-1">
                                <ChevronRight className="w-4 h-4" /> {college.course}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 md:mt-0 flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Admission Chance</p>
                              <p className={`font-bold ${
                                college.chance === 'High' ? 'text-green-400' : 
                                college.chance === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {college.chance}
                              </p>
                            </div>
                            <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                              {college.match_score}%
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        No matches found for this rank/category. Try other inputs.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel p-20 rounded-3xl border-dashed border-slate-700 flex flex-col items-center justify-center text-center"
              >
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                  <School className="text-slate-600 w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-400 mb-2">Ready to see your future?</h3>
                <p className="text-slate-500 max-w-sm">
                  Enter your expected JEE marks and category to see which NITs and IIITs are within your reach.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
