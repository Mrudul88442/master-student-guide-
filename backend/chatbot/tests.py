from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from unittest.mock import patch, MagicMock

class ChatbotTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.chat_url = reverse('chat')

    @patch('google.generativeai.GenerativeModel')
    def test_chatbot_successful_reply(self, mock_model_class):
        # Setup mock behavior
        mock_model_instance = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "Hello! I am Smart Guide. How can I help you?"
        mock_model_instance.generate_content.return_value = mock_response
        mock_model_class.return_value = mock_model_instance
        
        post_data = {
            'message': 'Hello Guide, what should I study?',
            'context': 'CS interest'
        }
        
        response = self.client.post(self.chat_url, post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['reply'], "Hello! I am Smart Guide. How can I help you?")
        
        # Verify mocked model was called
        mock_model_class.assert_called_once_with('gemini-flash-latest')
        mock_model_instance.generate_content.assert_called_once()

    def test_chatbot_missing_message(self):
        post_data = {
            'context': 'No message here'
        }
        response = self.client.post(self.chat_url, post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    @patch('google.generativeai.GenerativeModel')
    def test_chatbot_exception_graceful(self, mock_model_class):
        # Simulate an exception in generative model execution
        mock_model_instance = MagicMock()
        mock_model_instance.generate_content.side_effect = Exception("API connection timed out")
        mock_model_class.return_value = mock_model_instance
        
        post_data = {
            'message': 'Trigger failure'
        }
        response = self.client.post(self.chat_url, post_data, format='json')
        # View is configured to return HTTP 200 with polite apology
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("I apologize, but I am unable to connect to the Gemini service right now.", response.data['reply'])
