
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
from accounts.permissions import IsAdmin
from django.utils import timezone
from django.db.models import Count, Q
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import OneHotEncoder
from sklearn.neighbors import NearestNeighbors
import matplotlib.pyplot as plt
import io
import base64

# Set BASE_DIR to project root (two levels up from this file)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Load pre-trained model, encoder, and selector
model = joblib.load(os.path.join(BASE_DIR, 'disease_prediction', 'ml', 'rforest_model.pkl'))
encoder = joblib.load(os.path.join(BASE_DIR, 'disease_prediction', 'ml', 'encoder.pkl'))
selector = joblib.load(os.path.join(BASE_DIR, 'disease_prediction', 'ml', 'selector.pkl'))
recommendation_data=pd.read_csv(os.path.join(BASE_DIR,'disease_prediction','ml','HealthCare Recommendation.csv'))


# Define categorical and numerical columns (based on training)
categorical_columns = ['Gender', 'Smoking', 'Family History', 'Diabetes',
                       'Obesity', 'Exercise Induced Angina', 'Chest Pain Type']

numerical_columns = ['Age', 'Cholesterol', 'Blood Pressure', 'Heart Rate', 'Exercise Hours', 'Stress Level', 'Blood Sugar']

# recommendation ko lagi
# dataset for similarity matching
encoder_full = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
encoded_cat = encoder_full.fit_transform(recommendation_data[categorical_columns])
encoded_cat_df = pd.DataFrame(encoded_cat, columns=encoder_full.get_feature_names_out(categorical_columns))

full_feature_matrix = pd.concat([
    recommendation_data[numerical_columns].reset_index(drop=True),
    encoded_cat_df.reset_index(drop=True)
], axis=1)

recommendation_texts = recommendation_data['recommendations']

# rule based recommendation
# def get_recommendations(input_data, probability):
#     recommendations = []

#     # Probability-based recommendations
#     if probability >= 0.75:
#         recommendations.append("Your estimated risk of heart disease is HIGH (≥ 75%).")
#         recommendations.append("Seek immediate medical evaluation with a cardiologist.")
#         recommendations.append("Adopt a strict heart-healthy lifestyle — low-sodium, low-fat diet, regular exercise, and no smoking.")
#         recommendations.append("Start monitoring vitals daily: BP, heart rate, and blood sugar.")
#         recommendations.append("If you have any symptoms (e.g., chest pain, fatigue), do not ignore them — act immediately.")
#     elif probability >= 0.50:
#         recommendations.append("Your risk level is MODERATE (50%–74%).")
#         recommendations.append("You should consult a doctor for preventive screening and lifestyle adjustments.")
#         recommendations.append("Focus on daily exercise, diet modifications, and stress reduction.")
#         recommendations.append("Track your vitals regularly to detect any upward trend early.")
#     else:
#         recommendations.append("Your heart disease risk appears to be LOW (< 50%).")
#         recommendations.append("Maintain your current healthy lifestyle and avoid risk factors.")
#         recommendations.append("Continue regular checkups and monitor vital signs annually.")
#         recommendations.append("Stay active and avoid high stress, smoking, or poor dietary habits.")

#     # Input-based personalized suggestions
#     if input_data['Cholesterol'] > 240:
#         recommendations.append("High cholesterol detected. Avoid fried foods, red meat, and add more fiber to your meals.")
#     if input_data['Blood Pressure'] > 130:
#         recommendations.append("Elevated blood pressure. Reduce salt intake, avoid caffeine, and exercise regularly.")
#     if input_data['Blood Sugar'] > 126:
#         recommendations.append("High blood sugar level — watch your carbohydrate intake and consider testing for diabetes.")
#     if input_data['Stress Level'] >= 7:
#         recommendations.append(" High stress reported. Try meditation, journaling, breathing exercises, or consult a counselor.")
#     if input_data['Exercise Hours'] < 1:
#         recommendations.append("Limited physical activity. Gradually build up to 30 minutes/day, 5 times a week.")
#     if input_data['Smoking'] == "Yes":
#         recommendations.append("Smoking is a major risk factor. Seek professional support to quit immediately.")
#     if input_data['Obesity'] == "Yes":
#         recommendations.append("Obesity increases cardiovascular risk. Focus on a calorie-deficit diet and consistent movement.")
#     if input_data['Family History'] == "Yes":
#         recommendations.append("Family history noted. Even if symptoms aren't present, stay proactive with screenings.")

#     return recommendations

# consine similarity based recommendation
def get_recommendations(input_data,probalility):
    input_df=pd.DataFrame([input_data])
     # Separate and encode
    input_encoded_cat = encoder_full.transform(input_df[categorical_columns])
    input_encoded_cat_df = pd.DataFrame(input_encoded_cat, columns=encoder_full.get_feature_names_out(categorical_columns))
    input_features = pd.concat([input_df[numerical_columns].reset_index(drop=True), input_encoded_cat_df], axis=1)

     # Compute cosine similarity
    similarity_scores = cosine_similarity(input_features.values, full_feature_matrix.values)[0]

    top_indices = similarity_scores.argsort()[-3:][::-1]  # Top 3 similar profiles

    top_recommendations = recommendation_texts.iloc[top_indices].tolist()
    return top_recommendations


def analyze_similarity_scores(input_data):
    """
    Given a single input_data dict, compute cosine similarity scores with
    the full recommendation matrix and visualize the distribution.
    """
    input_df = pd.DataFrame([input_data])
    input_encoded_cat = encoder_full.transform(input_df[categorical_columns])
    input_encoded_cat_df = pd.DataFrame(input_encoded_cat, columns=encoder_full.get_feature_names_out(categorical_columns))
    input_features = pd.concat([input_df[numerical_columns].reset_index(drop=True), input_encoded_cat_df.reset_index(drop=True)], axis=1)
    similarity_scores = cosine_similarity(input_features.values, full_feature_matrix.values)[0]
    print(f"Similarity scores stats: min={similarity_scores.min():.4f}, max={similarity_scores.max():.4f}, mean={similarity_scores.mean():.4f}, median={np.median(similarity_scores):.4f}")

    plt.figure(figsize=(8, 4))
    plt.hist(similarity_scores, bins=30, color='skyblue', edgecolor='black')
    plt.title("Cosine Similarity Score Distribution")
    plt.xlabel("Cosine Similarity")
    plt.ylabel("Frequency")
    plt.tight_layout()

    # Save plot to a bytes buffer and encode as base64 string for easy embedding
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    plt.close()
    buf.seek(0)
    image_base64 = base64.b64encode(buf.read()).decode('utf-8')

    return {
        "min": float(similarity_scores.min()),
        "max": float(similarity_scores.max()),
        "mean": float(similarity_scores.mean()),
        "median": float(np.median(similarity_scores)),
        "histogram_base64": image_base64  # you can send this in API response and render as image in frontend
    }


# KNN based recommendation
# knn_model = NearestNeighbors(n_neighbors=3, metric='cosine')
# knn_model.fit(full_feature_matrix)
# def get_recommendations(input_data, probability=None):
#     """
#     Returns top 3 similar health recommendations based on KNN similarity.
#     `input_data` should be a dictionary of user input.
#     """
#     try:
#         input_df = pd.DataFrame([input_data])

#         # Encode user input
#         encoded_input_cat = encoder_full.transform(input_df[categorical_columns])
#         encoded_input_cat_df = pd.DataFrame(encoded_input_cat, columns=encoder_full.get_feature_names_out(categorical_columns))

#         # Merge with numerical
#         input_vector = pd.concat([input_df[numerical_columns].reset_index(drop=True), encoded_input_cat_df.reset_index(drop=True)], axis=1)

#         # Get most similar recommendations
#         distances, indices = knn_model.kneighbors(input_vector)
#         top_recommendations = recommendation_texts.iloc[indices[0]].tolist()

#         return top_recommendations

#     except Exception as e:
#         return [f"Error generating recommendations: {str(e)}"]



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
    

# last ma add gareko
class PredictionStatistics(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request):
        """Get statistics for disease predictions"""
        try:
            # Get all predictions
            predictions = HeartDiseasePrediction.objects.all()
            
            # Calculate statistics
            total_predictions = predictions.count()
            high_risk_count = predictions.filter(probability__gte=0.75).count()
            moderate_risk_count = predictions.filter(
                probability__gte=0.5, 
                probability__lt=0.75
            ).count()
            low_risk_count = predictions.filter(probability__lt=0.5).count()
            
            # Additional statistics
            recent_predictions = predictions.filter(
                created_at__gte=timezone.now() - timezone.timedelta(days=30)
            ).count()
            
            # Gender-based statistics
            gender_stats = predictions.values('gender').annotate(
                count=Count('id'),
                avg_probability=models.Avg('probability')
            )
            
            # Age group statistics
            age_groups = {
                'under_30': predictions.filter(age__lt=30).count(),
                '30_50': predictions.filter(age__gte=30, age__lt=50).count(),
                '50_70': predictions.filter(age__gte=50, age__lt=70).count(),
                'over_70': predictions.filter(age__gte=70).count()
            }
            
            return Response({
                'total': total_predictions,
                'highRisk': high_risk_count,
                'moderateRisk': moderate_risk_count,
                'lowRisk': low_risk_count,
                'recentPredictions': recent_predictions,
                'genderStats': list(gender_stats),
                'ageGroups': age_groups,
                'averageProbability': predictions.aggregate(
                    avg_prob=models.Avg('probability')
                )['avg_prob'] or 0
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RecommendationStatistics(APIView):
    permission_classes=[IsAuthenticated, IsAdmin]
    def get(self,request):
        try:
            data=analyze_similarity_scores(request.data)
            return Response(data)
        except Exception as e:
            return Response({'error':str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DiseaseAnalyticsView(APIView):
    def get(self, request):
        # Example: risk distribution
        predictions = HeartDiseasePrediction.objects.all()
        risk_counts = {
            'High Risk': predictions.filter(probability__gte=0.75).count(),
            'Moderate Risk': predictions.filter(probability__gte=0.5, probability__lt=0.75).count(),
            'Low Risk': predictions.filter(probability__lt=0.5).count()
        }

        # Create a pie chart
        fig, ax = plt.subplots()
        ax.pie(risk_counts.values(), labels=risk_counts.keys(), autopct='%1.1f%%', startangle=90)
        ax.set_title('Heart Disease Risk Distribution')

        # Convert to base64
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        image_base64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close(fig)

        return Response({'risk_pie_chart': image_base64, 'risk_counts': risk_counts})










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


    
