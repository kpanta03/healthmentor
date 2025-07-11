from django.urls import path
from disease_prediction.views import *

urlpatterns = [
    path('predict-heart-disease/',PredictHeartDisease.as_view(), name='predict-heart-disease'),#22
    path('history/',HeartDiseaseHistory.as_view(), name='heart-disease-history'),
    #  path('symptoms/',get_symptoms,name='get_symptoms'),
]
