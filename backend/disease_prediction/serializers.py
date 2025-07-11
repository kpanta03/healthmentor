from rest_framework import serializers
from .models import HeartDiseasePrediction

class HeartDiseasePredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeartDiseasePrediction
        fields = '__all__'
        read_only_fields = ['user', 'prediction', 'probability', 'created_at']
