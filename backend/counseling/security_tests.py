from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from unittest.mock import patch

class SecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.profile_url = reverse('profile')
        self.logout_url = reverse('logout')
        self.analyze_url = reverse('analyze_profile')

    def test_unauthenticated_requests_blocked(self):
        # GET profile without token
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # POST logout without token
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @override_settings(DEBUG=False)
    def test_production_error_sanitization(self):
        bad_data = {
            'fullName': 'Jane Doe',
            'email': 'jane@example.com',
            'expectedMarks': 180,
            'category': 'General',
            'interests': ['Computer Science'],
            'budget': 600000
        }
        
        # Force an exception by mock-patching get_college_recommendations
        with patch('counseling.views.get_college_recommendations') as mock_recs:
            mock_recs.side_effect = Exception("Critical Database connection lost")
            response = self.client.post(self.analyze_url, bad_data, format='json')
            
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'An internal error occurred. Please try again later.')
        self.assertNotIn('traceback', response.data)

    @override_settings(DEBUG=True)
    def test_development_error_traceback_included(self):
        bad_data = {
            'fullName': 'Jane Doe',
            'email': 'jane@example.com',
            'expectedMarks': 180,
            'category': 'General',
            'interests': ['Computer Science'],
            'budget': 600000
        }
        
        # Force an exception by mock-patching get_college_recommendations
        with patch('counseling.views.get_college_recommendations') as mock_recs:
            mock_recs.side_effect = Exception("Critical Database connection lost")
            response = self.client.post(self.analyze_url, bad_data, format='json')
            
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Critical Database connection lost')
        self.assertIn('traceback', response.data)
