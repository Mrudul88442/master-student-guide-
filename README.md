# Smart Guide - Intelligent College Counseling

## Overview
**Smart Guide** is a web application that helps students discover the best college and career recommendations based on their JEE expected marks, reservation category, budget, interests, and selected academic stream (Engineering, Medical, Management, etc.).

- **Zero UI changes** – the sleek existing UI remains untouched.
- **Dynamic onboarding** – a new step (field selection) captures the student's stream.
- **Backend intelligence** – recommendations are filtered by stream using `counseling_dataset.csv`.
- **Production‑ready** – includes migrations, error handling, and performance optimizations.

## Features
- Multi‑step assessment form with smooth framer‑motion transitions.
- Automated rank prediction via a pre‑trained RandomForest model.
- Stream‑aware college recommendation logic (`get_college_recommendations`).
- Bulk creation of `CollegeRecommendation` entries for fast DB writes.
- Secure token‑based API (`/api/counseling/analyze/`).

## Tech Stack
- **Frontend:** React, Tailwind‑styled components, framer‑motion.
- **Backend:** Django REST Framework, SQLite/PostgreSQL, Pandas for CSV handling.
- **ML Model:** Scikit‑learn RandomForest (pickled for fast loading).

## Getting Started
### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### Installation
```bash
# Clone the repo
git clone <repo-url>
cd "smart guide"

# Backend setup
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r backend/requirements.txt
python manage.py makemigrations counseling
python manage.py migrate
python manage.py runserver

# Frontend setup
cd frontend
npm install
npm run dev
```

### Environment Variables
Create a `.env` file in the backend root:
```
DEBUG=True
SECRET_KEY=your-secret-key
BASE_DIR=.
```
(Adjust as needed for production.)

## Usage
1. Open the frontend at `http://localhost:5173`.
2. Complete the onboarding flow – choose your **Field** (Engineering / Medical / Management).
3. Fill personal, academic, and preference details.
4. Submit – the API predicts your percentile/rank and returns a list of up to 10 college recommendations.

## API Reference
`POST /api/counseling/analyze/`
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "expectedMarks": 150,
  "category": "General",
  "budget": 500000,
  "interests": ["Computer Science"],
  "stream": "Engineering"
}
```
Response includes `predicted_percentile`, `predicted_rank`, and `recommended_colleges`.

## Development
- Run tests with `python manage.py test`.
- Lint with `ruff .` (or your preferred linter).
- Add new streams by extending `counseling_dataset.csv` and updating `utils.get_college_recommendations` if needed.

## Contributing
Feel free to open issues or submit pull requests. Follow the standard Git workflow:
```bash
git checkout -b feature/<name>
# make changes
git commit -m "Add feature"
git push origin feature/<name>
```

## License
MIT License – see `LICENSE` file.

---
*Created with Antigravity AI assistant*
