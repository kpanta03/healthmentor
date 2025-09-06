from django.urls import path
from .views import *

urlpatterns = [
    path('register/', UserRegisterView.as_view(), name='register'),#16
    path('login/', UserLoginView.as_view(), name='login'),#19
    path('current-user/', UserMeView.as_view(), name='user-me'),#23
    path('update-profile/', UserUpdateProfileView.as_view(), name='user-update-profile'),#24
    path('admin-dashboard/',AdminOnlyView.as_view(),name='admin-only'),

    path('admin-dashboard/toggle/<str:email>/', toggle_user_status, name='toggle-user'),
    path('admin-dashboard/delete/<str:email>/', delete_user, name='delete-user'),
     path('admin-dashboard/update/<str:email>/', AdminUpdateUserView.as_view(), name='admin-update-user'),
     path('admin-dashboard/stats/', get_user_stats, name='user-stats'),


]

