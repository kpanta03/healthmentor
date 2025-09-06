from rest_framework import serializers
from accounts.models import *

# 14
class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True) #not shown in response

    class Meta:
        model = User
        fields = ['email', 'name', 'password', 'password2','profile_image']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password2'):
            raise serializers.ValidationError("Passwords didn't match.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        return User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
            profile_image=validated_data.get('profile_image')
        )
# 18
class UserLoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    class Meta:
        model=User
        fields=['email','password']

        
# 22
class UserProfileSerializer(serializers.ModelSerializer):
    """only profile image updated"""
    class Meta:
        model = User
        fields = ['email', 'name', 'profile_image']
        read_only_fields = ['email', 'name']
# 23
class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'name', 'profile_image', 'is_admin', 'is_active', 'created_at']
