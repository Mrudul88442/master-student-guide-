import os
import django
from django.conf import settings

# Setup django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edu_guide.settings')
django.setup()

import google.generativeai as genai

genai.configure(api_key=settings.GEMINI_API_KEY)

print("Listing available models...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error listing models: {e}")
