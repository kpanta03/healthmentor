from django.contrib import admin
from .models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

# 11
class UserAdmin(BaseUserAdmin):
    list_display = ('id', 'email', 'name', 'is_admin', 'is_superuser')
    list_filter = ('is_admin', 'is_superuser')
    fieldsets = (
        ('User Credentials', {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('name', 'profile_image')}),
        ('Permissions', {'fields': ('is_admin', 'is_superuser', 'is_active')}),
    )
    add_fieldsets = (
        (None, 
         {
            'classes': ('wide',),
            'fields': ('email', 'name', 'profile_image', 'password1', 'password2'),
        }),
    )
    search_fields = ('email',)
    ordering = ('email',)
    filter_horizontal = ()

admin.site.register(User, UserAdmin)

