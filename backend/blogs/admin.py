from django.contrib import admin
from .models import Blog, BlogBookmark

# Customizing the Blog admin interface
class BlogAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'created_at', 'updated_at', 'is_active', 'views_count')
    list_filter = ('is_active', 'category', 'author')  # Allow filtering by is_active, category, and author
    search_fields = ('title', 'content', 'author__email')  # Allow search by title, content, and author's email
    prepopulated_fields = {'slug': ('title',)}  # Auto-generate slug from the title
    ordering = ('-created_at',)  # Order blogs by creation date, descending
    actions = ['make_active', 'make_inactive']  # Custom admin actions

    def make_active(self, request, queryset):
        queryset.update(is_active=True)
    make_active.short_description = "Mark selected blogs as active"

    def make_inactive(self, request, queryset):
        queryset.update(is_active=False)
    make_inactive.short_description = "Mark selected blogs as inactive"

# Registering the Blog model with the customized BlogAdmin
admin.site.register(Blog, BlogAdmin)

# Register BlogBookmark model (you can customize this if needed, but it's simple here)
class BlogBookmarkAdmin(admin.ModelAdmin):
    list_display = ('user', 'blog', 'created_at')
    search_fields = ('user__email', 'blog__title')

admin.site.register(BlogBookmark, BlogBookmarkAdmin)
