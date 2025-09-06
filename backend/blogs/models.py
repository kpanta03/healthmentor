from django.db import models
from django.utils import timezone
from accounts.models import User
from django.utils.text import slugify
# import bleach

class Blog(models.Model):

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blogs')
    title = models.CharField(max_length=255)
    content = models.TextField()
    featured_image = models.ImageField(upload_to='blog_images/', null=True, blank=True)
    category = models.CharField(max_length=255, null=True, blank=True)
    views_count = models.PositiveIntegerField(default=0)
    slug = models.SlugField(unique=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        # self.content=bleach.clean(self.content, strip=True)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def increment_views(self):
        """Increment view count for the blog"""
        self.views_count += 1
        self.save()

class BlogBookmark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarks')
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name='bookmarked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'blog']  # A user can bookmark a blog only once

    def __str__(self):
        return f"{self.user.email} bookmarked {self.blog.title}"




