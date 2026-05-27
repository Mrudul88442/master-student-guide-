import os
import logging
import google.generativeai as genai
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)

# Initialize Gemini API
genai.configure(api_key=getattr(settings, 'GEMINI_API_KEY', ''))

@api_view(['POST'])
def chat(request):
    try:
        data = request.data
        user_message = data.get('message', '')
        context = data.get('context', '')
        
        if not user_message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        system_prompt = "You are a helpful and expert career counselor named Smart Guide. "
        if context:
            system_prompt += f"The user has the following profile context: {context}. "
            
        system_prompt += "Provide career and college advice to the user based on their message."

        # Configure model
        model = genai.GenerativeModel('gemini-flash-latest') 
        
        # Combine prompt
        full_prompt = f"{system_prompt}\n\nUser: {user_message}\nSmart Guide:"
        
        response = model.generate_content(full_prompt)
        reply = response.text
        
        return Response({'reply': reply}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.exception("Exception occurred in chat view during Gemini generation")
        error_msg = "I apologize, but I am unable to connect to the Gemini service right now."
        if settings.DEBUG:
            error_msg += f" Error: {str(e)}"
        return Response({'reply': error_msg}, status=status.HTTP_200_OK)
