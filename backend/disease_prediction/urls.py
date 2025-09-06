from django.urls import path
from disease_prediction.views import *

urlpatterns = [
    path('predict-heart-disease/',PredictHeartDisease.as_view(), name='predict-heart-disease'),#22
    path('history/',HeartDiseaseHistory.as_view(), name='heart-disease-history'),
    path('statistics/', PredictionStatistics.as_view(), name='prediction-statistics'),
    path('recommendation-statistics/', RecommendationStatistics.as_view(), name='recommndation-statistics'),
    path('analytics/', DiseaseAnalyticsView.as_view(), name='disease-analytics'),
    #  path('symptoms/',get_symptoms,name='get_symptoms'),
]
