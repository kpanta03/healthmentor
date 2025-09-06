# hospital/urls.py
from django.urls import path
from hospitals.views import *

urlpatterns = [
    path('nearby/', NearbyHospitals.as_view(), name='nearby-hospitals'),
    path('speciality_nearby/',SpecialityNearbyHospitals.as_view(), name='nearby-hospitals'),
]
