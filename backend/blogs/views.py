from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework import status
from .models import Blog, BlogBookmark
from .serializers import BlogSerializer, BlogCreateUpdateSerializer, BlogBookmarkSerializer
from accounts.permissions import IsAdmin
from django.db import models
from rest_framework_simplejwt.authentication import JWTAuthentication

# Admin-only view to create a blog
class BlogCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = BlogCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)  # Set the logged-in user as the author
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Admin-only view to update a blog
class BlogUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def put(self, request, pk):
        try:
            blog = Blog.objects.get(pk=pk)
        except Blog.DoesNotExist:
            return Response({'error': 'Blog not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = BlogCreateUpdateSerializer(blog, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Admin-only view to delete a blog
class BlogDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, pk):
        try:
            blog = Blog.objects.get(pk=pk)
        except Blog.DoesNotExist:
            return Response({'error': 'Blog not found'}, status=status.HTTP_404_NOT_FOUND)

        blog.delete()
        return Response({'msg': 'Blog deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

# Public view for users to read blogs
class BlogListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        blogs = Blog.objects.filter(is_active=True)
        serializer = BlogSerializer(blogs, many=True)
        return Response(serializer.data)

# View to increment view count of the blog
class BlogView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        try:
            blog = Blog.objects.get(slug=slug)
        except Blog.DoesNotExist:
            return Response({'error': 'Blog not found'}, status=status.HTTP_404_NOT_FOUND)

        user = None
        jwt_authenticator = JWTAuthentication()
        try:
            auth_result = jwt_authenticator.authenticate(request)
            if auth_result is not None:
                user, token = auth_result
        except Exception as e:
            user = None  # Token invalid or not provided
            
        # Only increment views if user is not admin
        if not user or user.role != 'admin':
            blog.increment_views()

        serializer = BlogSerializer(blog)
        return Response(serializer.data)

# View to bookmark a blog (User only)
class BlogBookmarkView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        try:
            blog = Blog.objects.get(pk=pk)
        except Blog.DoesNotExist:
            return Response({'error': 'Blog not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check if user already bookmarked the blog
        if BlogBookmark.objects.filter(user=request.user, blog=blog).exists():
            return Response({'error': 'Blog already bookmarked'}, status=status.HTTP_400_BAD_REQUEST)
        # Create bookmark
        bookmark = BlogBookmark.objects.create(user=request.user, blog=blog)
        bookmark_serializer = BlogBookmarkSerializer(bookmark)
        return Response(bookmark_serializer.data, status=status.HTTP_201_CREATED)
    
# view to unbookmark a blog (User only)
class BlogUnbookmarkView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            blog = Blog.objects.get(pk=pk)
        except Blog.DoesNotExist:
            return Response({'error': 'Blog not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check if the user has already bookmarked the blog
        try:
            bookmark = BlogBookmark.objects.get(user=request.user, blog=blog)
            bookmark.delete()  # Remove the bookmark
            return Response({'msg': 'Blog removed from bookmarks'}, status=status.HTTP_204_NO_CONTENT)
        except BlogBookmark.DoesNotExist:
            return Response({'error': 'Blog not bookmarked yet'}, status=status.HTTP_400_BAD_REQUEST)

class UserBookmarkedBlogsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Get all bookmarks for the logged-in user
        bookmarks = BlogBookmark.objects.filter(user=request.user)
        print(bookmarks)
        if not bookmarks:
            return Response({'message': 'No bookmarked blogs found'}, status=status.HTTP_200_OK)

        # Get the corresponding blog for each bookmark
        blogs = [bookmark.blog for bookmark in bookmarks]

        # Serialize the blog data
        serializer = BlogSerializer(blogs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class BlogStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        total_blogs = Blog.objects.count()
        total_views = Blog.objects.aggregate(total=models.Sum('views_count'))['total'] or 0
        total_bookmarks = BlogBookmark.objects.count()

        return Response({
            'total_blogs': total_blogs,
            'total_views': total_views,
            'total_bookmarks': total_bookmarks
        })
    