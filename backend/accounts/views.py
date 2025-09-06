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
from django.db.models import Q
from django.shortcuts import get_object_or_404

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

        search = request.query_params.get('search', '')
        role_filter = request.query_params.get('role', 'all')
        status_filter = request.query_params.get('status', 'all')

        users=User.objects.all()
        if search:
            users=users.filter(Q(name__icontains=search) | Q(email__icontains=search))
        if role_filter in ['admin','user']:
            is_admin = True if role_filter == 'admin' else False
            users=users.filter(is_admin=is_admin)
        if status_filter in ['active','inactive']:
            is_active = True if status_filter == 'active' else False
            users=users.filter(is_active=is_active)
        
        serializer = AdminUserSerializer(users, many=True)
        return Response(serializer.data)

class AdminUpdateUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def put(self, request, email):
        """Update a user's name, role, and active status."""
        user = get_object_or_404(User, email=email)
        data = request.data

        if 'name' not in data:
                return Response({'error': 'Name is required'}, status=status.HTTP_400_BAD_REQUEST)

        user.name = data.get('name', user.name)
        user.is_admin = data.get('is_admin', user.is_admin)
        user.is_active = data.get('is_active', user.is_active)
        user.save()

        return Response({'msg': 'User updated successfully'})

# last ko
@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdmin])
def toggle_user_status(request, email):
    try:
        user = User.objects.get(email=email)
        user.is_active = not user.is_active
        user.save()
        return Response({"msg": "User status updated", "is_active": user.is_active})
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

# Delete user
@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def delete_user(request, email):
    try:
        user = User.objects.get(email=email)
        user.delete()
        return Response({"msg": "User deleted"})
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def get_user_stats(request):
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    inactive_users = User.objects.filter(is_active=False).count()
    admin_users = User.objects.filter(is_admin=True).count()

    return Response({
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": inactive_users,
        "admin_users": admin_users
    })

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




