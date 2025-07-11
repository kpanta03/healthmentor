
from django.contrib import admin
from .models import HeartDiseasePrediction

@admin.register(HeartDiseasePrediction)
class HeartDiseasePredictionAdmin(admin.ModelAdmin):
    list_display = ('user', 'prediction', 'probability', 'created_at')
    list_filter = ('prediction', 'created_at', 'gender', 'smoking')
    search_fields = ('user__email', 'gender', 'chest_pain_type')
    readonly_fields = ('prediction', 'probability', 'created_at')
