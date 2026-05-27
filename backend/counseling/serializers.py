from rest_framework import serializers
from .models import StudentProfile, CollegeRecommendation, CareerPath

class CollegeRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollegeRecommendation
        fields = ['name', 'course', 'fee', 'chance', 'match_score']

class CareerPathSerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerPath
        fields = ['title', 'desc', 'growth']

class StudentProfileSerializer(serializers.ModelSerializer):
    recommended_colleges = CollegeRecommendationSerializer(many=True, read_only=True)
    career_paths = CareerPathSerializer(many=True, read_only=True)

    class Meta:
        model = StudentProfile
        fields = '__all__'
