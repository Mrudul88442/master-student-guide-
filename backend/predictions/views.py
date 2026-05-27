import logging
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .utils import predict_rank_logic, get_college_recommendations

logger = logging.getLogger(__name__)

@api_view(['POST'])
def predict_rank(request):
    try:
        data = request.data
        try:
            expected_marks = float(data.get('expected_marks') or data.get('expectedMarks') or 0.0)
        except (ValueError, TypeError):
            expected_marks = 0.0

        category = data.get('category', 'General')
        interests = data.get('interests', [])

        percentile, rank = predict_rank_logic(expected_marks)
        
        # Get colleges based on predicted rank and category
        colleges = get_college_recommendations(rank, category, interests)

        return Response({
            'expected_marks': expected_marks,
            'predicted_percentile': percentile,
            'predicted_rank': rank,
            'category': category,
            'eligible_colleges': colleges
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.exception("Exception occurred in predict_rank view")
        err_res = {'error': 'An internal error occurred. Please try again later.'}
        if settings.DEBUG:
            import traceback
            err_res['error'] = str(e)
            err_res['traceback'] = traceback.format_exc()
        return Response(err_res, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
