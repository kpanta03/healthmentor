# from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.serializers import *
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from accounts.permissions import *



# 13
def get_tokens_for_user(user):
    """Generate JWT tokens(refresh token and access token) for the user."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

def get_user_role(user):
    """Determine the role of the user(admin or user). checks the custom user model's is_admin field."""
    return 'admin' if user.is_admin else 'user'

# 12
class UserRegisterView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save() #call serializer's create method to create a new user.
            token = get_tokens_for_user(user)
            return Response({
                'token': token, 
                'msg': 'Registration successful',
                'role': get_user_role(user)
                }, status=status.HTTP_201_CREATED)#status confirm resource has been created successfully.
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 17
class UserLoginView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data.get('email')
            password = serializer.validated_data.get('password')
            user = authenticate(email=email, password=password)
            if user:
                token = get_tokens_for_user(user)
                return Response({
                    'token': token,
                      'msg': 'Login successful',
                       'role': get_user_role(user)
                      }, status=status.HTTP_200_OK)#request has been successfully processes by server
            else:
                return Response({'errors': {'non_field_errors': ['Invalid email or password']}}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 20
class UserMeView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        """Returns the currently logged-in user's profile using UserProfileSerializer."""
        data = UserProfileSerializer(request.user).data
        data['role'] = get_user_role(request.user)
        return Response(data)
    
# 21
class UserUpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]#supports image/file uploads
    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)#user can update only part of their info(name,image)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminOnlyView(APIView):
    permission_classes=[IsAuthenticated, IsAdmin]

    def get(self,request):
        users=User.objects.all()
        data=UserProfileSerializer(users, many=True)
        return Response(data)



# 26
# @api_view(['GET'])
# @permission_classes([IsAuthenticated, IsAdminUser])
# def admin_dashboard_view(request):
#     return Response({"msg": "Welcome to the Admin Dashboard. More admin data will go here."})

# # 27
# @api_view(['GET'])
# @permission_classes([IsAuthenticated, IsNormalUser])
# def user_dashboard_view(request):
#     return Response({"msg": "Welcome to the User Dashboard. More user-specific data will go here."})




