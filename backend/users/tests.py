from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from users.models import UserProfile
from rest_framework.authtoken.models import Token

class UserTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.logout_url = reverse('logout')
        self.profile_url = reverse('profile')
        
        self.user_data = {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'password': 'StrongPassword123'
        }

    def test_user_registration_creates_profile(self):
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], 'testuser')
        
        # Verify User and UserProfile exist in DB
        user = User.objects.get(username='testuser')
        self.assertTrue(UserProfile.objects.filter(user=user).exists())

    def test_user_login(self):
        # Register first
        self.client.post(self.register_url, self.user_data, format='json')
        
        # Attempt login
        login_data = {
            'username': 'testuser',
            'password': 'StrongPassword123'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_user_login_invalid_credentials(self):
        login_data = {
            'username': 'nonexistent',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_retrieval_and_patch(self):
        # Register and authenticate
        reg_response = self.client.post(self.register_url, self.user_data, format='json')
        token = reg_response.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        
        # Get Profile
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('preferences', response.data)
        
        # Patch Profile
        patch_data = {
            'bio': 'New bio test',
            'preferences': {'stream': 'Science'},
            'timestamp': '2026-05-27 12:00:00'
        }
        response = self.client.patch(self.profile_url, patch_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['bio'], 'New bio test')
        self.assertEqual(response.data['preferences']['stream'], 'Science')
        self.assertIn("Profile updated at 2026-05-27 12:00:00", response.data['activity_log'][-1])

    def test_profile_access_denied_unauthenticated(self):
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_logout_invalidates_token(self):
        # Register and authenticate
        reg_response = self.client.post(self.register_url, self.user_data, format='json')
        token = reg_response.data['token']
        user = User.objects.get(username='testuser')
        
        self.assertTrue(Token.objects.filter(user=user, key=token).exists())
        
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        
        # Perform Logout
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify token is deleted in DB
        self.assertFalse(Token.objects.filter(user=user, key=token).exists())
