from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from predictions.utils import predict_rank_logic, get_college_recommendations

class PredictionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.predict_url = reverse('predict_rank')

    def test_predict_rank_logic_bounds(self):
        # High score
        percentile, rank = predict_rank_logic(300)
        self.assertTrue(90 <= percentile <= 100)
        self.assertTrue(rank >= 1)
        
        # Low score
        percentile, rank = predict_rank_logic(0)
        self.assertTrue(0 <= percentile <= 10)
        self.assertTrue(rank > 100000)

    def test_get_college_recommendations_not_empty(self):
        # General category, rank 5000 should return eligible NIT recommendations
        colleges = get_college_recommendations(predicted_rank=5000, category='General', interests=['Computer Science'])
        self.assertTrue(len(colleges) > 0)
        for c in colleges:
            self.assertIn('name', c)
            self.assertIn('course', c)
            self.assertIn('chance', c)
            self.assertIn('match_score', c)

    def test_predict_rank_endpoint(self):
        post_data = {
            'expected_marks': 150,
            'category': 'General',
            'interests': ['Computer Science', 'Electrical']
        }
        response = self.client.post(self.predict_url, post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('expected_marks', response.data)
        self.assertIn('predicted_percentile', response.data)
        self.assertIn('predicted_rank', response.data)
        self.assertIn('eligible_colleges', response.data)
        self.assertTrue(len(response.data['eligible_colleges']) > 0)
