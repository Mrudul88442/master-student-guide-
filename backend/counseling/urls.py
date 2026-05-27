from django.urls import path
from .views import analyze_profile

urlpatterns = [
    path('analyze/', analyze_profile, name='analyze_profile'),
]
