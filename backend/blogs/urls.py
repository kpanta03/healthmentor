from django.urls import path
from .views import *

urlpatterns = [
    path('blogs/', BlogListView.as_view(), name='blog-list'),  # User can read blogs
    path('blogs/create/', BlogCreateView.as_view(), name='blog-create'),  # Admin can create blog
    path('blogs/update/<int:pk>/', BlogUpdateView.as_view(), name='blog-update'),  # Admin can update blog
    path('blogs/delete/<int:pk>/', BlogDeleteView.as_view(), name='blog-delete'),  # Admin can delete blog
    path('blogs/<slug:slug>/', BlogView.as_view(), name='blog-view'),  # User can view a single blog (increment views)
    path('blogs/bookmark/<int:pk>/', BlogBookmarkView.as_view(), name='blog-bookmark'),  # User can bookmark a blog
    path('blogs/unbookmark/<int:pk>/', BlogUnbookmarkView.as_view(), name='blog-unbookmark'),
    path('users/bookmarked/', UserBookmarkedBlogsView.as_view(), name='user-bookmarked-blogs'),
     path('stats/', BlogStatsView.as_view(), name='blog-stats'),
]
