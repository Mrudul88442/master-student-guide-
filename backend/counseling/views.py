import os
import json
import logging
import pandas as pd
from django.conf import settings
from django.db import transaction
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import StudentProfile, CollegeRecommendation, CareerPath
from .serializers import StudentProfileSerializer
from predictions.utils import predict_rank_logic, get_college_recommendations

logger = logging.getLogger(__name__)

@api_view(['POST'])
def analyze_profile(request):
    try:
        data = request.data
        
        # Safely convert inputs
        try:
            expected_marks = float(data.get('expectedMarks') or data.get('expected_marks') or 0.0)
        except (ValueError, TypeError):
            expected_marks = 0.0

        try:
            budget = int(data.get('budget') or 500000)
        except (ValueError, TypeError):
            budget = 500000
            
        category = data.get('category', 'General')
        interests = data.get('interests', [])
        
        # Wrap all database updates in an atomic transaction for consistency
        with transaction.atomic():
            # Save student profile
            profile = StudentProfile.objects.create(
                user=request.user if request.user.is_authenticated else None,
                full_name=data.get('fullName', ''),
                email=data.get('email', ''),
                expected_marks=expected_marks,
                category=category,
                budget=budget,
                interests=interests,
                stream=data.get('stream', '')
            )

            # 1. Predict Rank using shared logic
            predicted_percentile, predicted_rank = predict_rank_logic(expected_marks)

            # 2. Match Colleges using shared logic
            colleges_data = get_college_recommendations(predicted_rank, category, interests, data.get('stream'))
                    
            if not colleges_data:
                 colleges_data = [{'name': 'No exact matches found', 'course': 'Try broadening preferences', 'fee': '0', 'chance': 'Low', 'match_score': 0}]

            # Optimize using bulk_create to batch save all recommendations in a single DB query
            recommendations = [
                CollegeRecommendation(
                    student=profile,
                    name=c.get('name', 'N/A'),
                    course=c.get('course', 'N/A'),
                    fee=c.get('fee', 'As per norms'),
                    chance=c.get('chance', 'Low'),
                    match_score=c.get('match_score', 0)
                )
                for c in colleges_data
            ]
            CollegeRecommendation.objects.bulk_create(recommendations)

        # Return response
        response_data = StudentProfileSerializer(profile).data
        response_data['predicted_percentile'] = predicted_percentile
        response_data['predicted_rank'] = predicted_rank

        return Response(response_data, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.exception("Exception occurred in analyze_profile view")
        err_res = {'error': 'An internal error occurred. Please try again later.'}
        if settings.DEBUG:
            import traceback
            err_res['error'] = str(e)
            err_res['traceback'] = traceback.format_exc()
        return Response(err_res, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
