from rest_framework import serializers
from blogs.models import *
from accounts.models import User
import bleach

class BlogSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.email')
    views_count = serializers.ReadOnlyField()

    class Meta:
        model = Blog
        fields = ['id', 'title', 'content', 'author', 'featured_image', 'category', 'slug', 'views_count', 'created_at', 'updated_at', 'is_active']
        read_only_fields = ['author', 'created_at', 'updated_at', 'views_count']

class BlogCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blog
        fields = ['id', 'title', 'content', 'featured_image', 'category', 'is_active']

    def validate_content(self,value):
        allowed_tags = ['strong', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'b', 'i']
        return bleach.clean(value, tags=allowed_tags, strip=True)


class BlogBookmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogBookmark
        fields = ['user', 'blog', 'created_at']
