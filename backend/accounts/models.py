from django.db import models

from django.contrib.auth.models import BaseUserManager, AbstractBaseUser#7

# 9 custom user manager.override create_user and create_superuser methods
class UserManager(BaseUserManager):
    def create_user(self, email, name,password=None, profile_image=None):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, profile_image=profile_image)
        user.set_password(password) #password securely set garxa
        user.save(using=self._db) #user saved to database
        return user

    def create_superuser(self, email, name,password=None):
        user = self.create_user(email, name, password)#create a basis user
        user.is_admin = True
        user.is_superuser = True
        user.save(using=self._db)
        return user
    
# email=kritika9849@gmail.com
# password=kritika123
    
# 8
class User(AbstractBaseUser):
    email = models.EmailField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']#super user ko lagi name required huncha

    def __str__(self):
        """ Returns the string representation of the user."""
        return self.email

    def has_perm(self, perm, obj=None):
        """ Returns True if the user has a specific permission."""
        return self.is_admin ## Allows specific permission if admin
    
   
    def has_module_perms(self, app_label):
        """ Returns True if the user has permission to view the app's models. """
        return True

    @property
    def is_staff(self):
        """ Used by Django admin to check if the user can access the admin interface."""
        return self.is_admin



