from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from counseling.models import StudentProfile, CollegeRecommendation
from django.contrib.auth.models import User

class CounselingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.analyze_url = reverse('analyze_profile')
        self.post_data = {
            'fullName': 'Jane Doe',
            'email': 'jane@example.com',
            'expectedMarks': 180,
            'category': 'General',
            'interests': ['Computer Science', 'Data Science'],
            'budget': 600000
        }

    def test_analyze_profile_anonymous_user(self):
        response = self.client.post(self.analyze_url, self.post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('predicted_percentile', response.data)
        self.assertIn('predicted_rank', response.data)
        self.assertEqual(response.data['full_name'], 'Jane Doe')
        
        # Verify db creation
        profile = StudentProfile.objects.get(email='jane@example.com')
        self.assertEqual(profile.expected_marks, 180.0)
        self.assertEqual(profile.budget, 600000)
        
        # Verify recommendations are bulk created in DB
        recs_count = CollegeRecommendation.objects.filter(student=profile).count()
        self.assertTrue(recs_count > 0)
        self.assertEqual(len(response.data['recommended_colleges']), recs_count)

    def test_analyze_profile_authenticated_user(self):
        # Create and authenticate user
        user = User.objects.create_user(username='authuser', password='Password123')
        self.client.force_authenticate(user=user)
        
        response = self.client.post(self.analyze_url, self.post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check relation
        profile = StudentProfile.objects.get(email='jane@example.com')
        self.assertEqual(profile.user, user)

    def test_analyze_profile_invalid_marks_graceful(self):
        bad_data = self.post_data.copy()
        bad_data['expectedMarks'] = 'not-a-number'
        response = self.client.post(self.analyze_url, bad_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['expected_marks'], 0.0)
