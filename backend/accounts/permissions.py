# # 25
from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin

# class IsNormalUser(BasePermission):
#     def has_permission(self, request, view):
#         return request.user and request.user.is_authenticated and not request.user.is_admin
