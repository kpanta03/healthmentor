from rest_framework import serializers
from .models import HeartDiseasePrediction
from accounts.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'name', 'email') 

class HeartDiseasePredictionSerializer(serializers.ModelSerializer):
    user=UserSerializer(read_only=True)
    class Meta:
        model = HeartDiseasePrediction
        fields = '__all__'
        read_only_fields = ['user', 'prediction', 'probability', 'created_at']
# serializer
