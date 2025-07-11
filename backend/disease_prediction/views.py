
import os
import pandas as pd
import numpy as np
import joblib
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from disease_prediction.serializers import *
from disease_prediction.models import *

# Set BASE_DIR to project root (two levels up from this file)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Load pre-trained model, encoder, and selector
model = joblib.load(os.path.join(BASE_DIR, 'disease_prediction', 'ml', 'rforest_model.pkl'))
encoder = joblib.load(os.path.join(BASE_DIR, 'disease_prediction', 'ml', 'encoder.pkl'))
selector = joblib.load(os.path.join(BASE_DIR, 'disease_prediction', 'ml', 'selector.pkl'))

# Define categorical and numerical columns (based on training)
categorical_columns = ['Gender', 'Smoking', 'Family History', 'Diabetes',
                       'Obesity', 'Exercise Induced Angina', 'Chest Pain Type']

numerical_columns = ['Age', 'Cholesterol', 'Blood Pressure', 'Heart Rate', 'Exercise Hours', 'Stress Level', 'Blood Sugar']

def get_recommendations(input_data, probability):
    recommendations = []

    # Probability-based recommendations
    if probability >= 0.75:
        recommendations.append("Your estimated risk of heart disease is HIGH (≥ 75%).")
        recommendations.append("Seek immediate medical evaluation with a cardiologist.")
        recommendations.append("Adopt a strict heart-healthy lifestyle — low-sodium, low-fat diet, regular exercise, and no smoking.")
        recommendations.append("Start monitoring vitals daily: BP, heart rate, and blood sugar.")
        recommendations.append("If you have any symptoms (e.g., chest pain, fatigue), do not ignore them — act immediately.")
    elif probability >= 0.50:
        recommendations.append("Your risk level is MODERATE (50%–74%).")
        recommendations.append("You should consult a doctor for preventive screening and lifestyle adjustments.")
        recommendations.append("Focus on daily exercise, diet modifications, and stress reduction.")
        recommendations.append("Track your vitals regularly to detect any upward trend early.")
    else:
        recommendations.append("Your heart disease risk appears to be LOW (< 50%).")
        recommendations.append("Maintain your current healthy lifestyle and avoid risk factors.")
        recommendations.append("Continue regular checkups and monitor vital signs annually.")
        recommendations.append("Stay active and avoid high stress, smoking, or poor dietary habits.")

    # Input-based personalized suggestions
    if input_data['Cholesterol'] > 240:
        recommendations.append("High cholesterol detected. Avoid fried foods, red meat, and add more fiber to your meals.")
    if input_data['Blood Pressure'] > 130:
        recommendations.append("Elevated blood pressure. Reduce salt intake, avoid caffeine, and exercise regularly.")
    if input_data['Blood Sugar'] > 126:
        recommendations.append("High blood sugar level — watch your carbohydrate intake and consider testing for diabetes.")
    if input_data['Stress Level'] >= 7:
        recommendations.append(" High stress reported. Try meditation, journaling, breathing exercises, or consult a counselor.")
    if input_data['Exercise Hours'] < 1:
        recommendations.append("Limited physical activity. Gradually build up to 30 minutes/day, 5 times a week.")
    if input_data['Smoking'] == "Yes":
        recommendations.append("Smoking is a major risk factor. Seek professional support to quit immediately.")
    if input_data['Obesity'] == "Yes":
        recommendations.append("Obesity increases cardiovascular risk. Focus on a calorie-deficit diet and consistent movement.")
    if input_data['Family History'] == "Yes":
        recommendations.append("Family history noted. Even if symptoms aren't present, stay proactive with screenings.")

    return recommendations

class PredictHeartDisease(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        try:
            input_data = request.data  # dictionary

            # Convert input to DataFrame
            input_df = pd.DataFrame([input_data])

            # Separate numerical and categorical
            X_num = input_df[numerical_columns]
            X_cat = input_df[categorical_columns]

            # One-hot encode using pre-fitted encoder
            X_cat_encoded = encoder.transform(X_cat).astype(int)
            X_cat_encoded_df = pd.DataFrame(X_cat_encoded, columns=encoder.get_feature_names_out(categorical_columns))

            # Combine numerical and encoded categorical features
            X_final = pd.concat([X_num.reset_index(drop=True), X_cat_encoded_df.reset_index(drop=True)], axis=1)

            # Apply variance threshold
            X_selected = pd.DataFrame(selector.transform(X_final), columns=selector.get_feature_names_out())

            # Predict
            prediction = model.predict(X_selected.values)[0]
            probability = model.predict_proba(X_selected.values)[0][1]

            if request.user.is_authenticated:
                HeartDiseasePrediction.objects.create(
                    user=request.user,
                    age=input_data['Age'],
                    cholesterol=input_data['Cholesterol'],
                    blood_pressure=input_data['Blood Pressure'],
                    heart_rate=input_data['Heart Rate'],
                    exercise_hours=input_data['Exercise Hours'],
                    stress_level=input_data['Stress Level'],
                    blood_sugar=input_data['Blood Sugar'],
                    gender=input_data['Gender'],
                    smoking=input_data['Smoking'],
                    family_history=input_data['Family History'],
                    diabetes=input_data['Diabetes'],
                    obesity=input_data['Obesity'],
                    exercise_induced_angina=input_data['Exercise Induced Angina'],
                    chest_pain_type=input_data['Chest Pain Type'],
                    prediction=int(prediction),
                    probability=round(float(probability), 4)
                )

            recommendations = get_recommendations(input_data, probability)

            print(int(prediction))
            print(round(float(probability), 4))
            print(recommendations)
            return Response({
                "prediction": int(prediction),
                "probability": round(float(probability), 4),
                "recommendations":recommendations
            })

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)  
          
        
class HeartDiseaseHistory(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if request.user.is_admin:
            histories = HeartDiseasePrediction.objects.select_related('user').all().order_by('-created_at')
        else:
            histories = HeartDiseasePrediction.objects.filter(user=request.user).order_by('-created_at')
        serializer = HeartDiseasePredictionSerializer(histories, many=True)
        return Response(serializer.data)
    

# class UserHeartHistoryView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         records = HeartDiseasePrediction.objects.filter(user=request.user).order_by('-created_at')
#         serializer = HeartDiseasePredictionSerializer(records, many=True)
#         return Response(serializer.data)

# class AdminHeartHistoryView(APIView):
#     permission_classes = [IsAuthenticated, IsAdmin]

#     def get(self, request):
#         records = HeartDiseasePrediction.objects.all().order_by('-created_at')
#         serializer = HeartDiseasePredictionSerializer(records, many=True)
#         return Response(serializer.data)








    
