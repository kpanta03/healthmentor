from django.db import models
from django.conf import settings

# Create your models here.
class HeartDiseasePrediction(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    age = models.IntegerField()
    cholesterol = models.FloatField()
    blood_pressure = models.FloatField()
    heart_rate = models.FloatField()
    exercise_hours = models.FloatField()
    stress_level = models.FloatField()
    blood_sugar = models.FloatField()
    gender = models.CharField(max_length=10)
    smoking = models.CharField(max_length=10)
    family_history = models.CharField(max_length=10)
    diabetes = models.CharField(max_length=10)
    obesity = models.CharField(max_length=10)
    exercise_induced_angina = models.CharField(max_length=10)
    chest_pain_type = models.CharField(max_length=50)
    prediction = models.IntegerField()
    probability = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.name} - Prediction:{self.prediction}"
    
    


