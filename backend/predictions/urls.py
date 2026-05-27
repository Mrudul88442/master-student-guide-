from django.urls import path
from .views import predict_rank

urlpatterns = [
    path('rank/', predict_rank, name='predict_rank'),
]
