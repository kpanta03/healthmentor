from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import pandas as pd
from math import radians, cos, sin, asin, sqrt
from sklearn.neighbors import NearestNeighbors
import requests
import os


# class NearbyMedicalFacilities(APIView):
#     """
#     API endpoint to fetch nearby hospitals and clinics using OpenStreetMap Overpass API.
#     Accepts user's latitude and longitude as query parameters.
#     Returns a list of medical facilities with detailed info.
#     """

#     def get(self, request):
#         user_lat = request.query_params.get('latitude')
#         user_lon = request.query_params.get('longitude')

#         # Validate latitude and longitude presence
#         if not user_lat or not user_lon:
#             return Response({"error": "Latitude and longitude are required."}, status=status.HTTP_400_BAD_REQUEST)

#         # Validate lat/lon format
#         try:
#             user_lat = float(user_lat)
#             user_lon = float(user_lon)
#         except ValueError:
#             return Response({"error": "Invalid latitude or longitude."}, status=status.HTTP_400_BAD_REQUEST)

#         # Overpass QL query: Search within 10km radius for hospitals or clinics
#         overpass_url = "https://overpass-api.de/api/interpreter"
#         query = f"""
#         [out:json][timeout:25];
#         (
#           node["amenity"~"hospital"](around:10000,{user_lat},{user_lon});
#           way["amenity"~"hospital"](around:10000,{user_lat},{user_lon});
#           relation["amenity"~"hospital"](around:10000,{user_lat},{user_lon});
#         );
#         out center tags qt 10;
#         """

#         try:
#             response = requests.post(overpass_url, data={'data': query}, timeout=30)
#             response.raise_for_status()
#         except requests.RequestException as e:
#             return Response({"error": "Failed to fetch data from OpenStreetMap.", "details": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

#         data = response.json()

#         facilities = []
#         for element in data.get("elements", []):
#             tags = element.get("tags", {})
#             name = tags.get("name", "Unnamed Facility")
#             facility_type = tags.get("amenity", "unknown")
#             lat = element.get("lat") or element.get("center", {}).get("lat")
#             lon = element.get("lon") or element.get("center", {}).get("lon")

#             # Collect address details from tags if available
#             address_parts = []
#             if 'addr:housenumber' in tags:
#                 address_parts.append(tags['addr:housenumber'])
#             if 'addr:street' in tags:
#                 address_parts.append(tags['addr:street'])
#             if 'addr:city' in tags:
#                 address_parts.append(tags['addr:city'])
#             if 'addr:postcode' in tags:
#                 address_parts.append(tags['addr:postcode'])
#             address = ", ".join(address_parts) if address_parts else tags.get('addr:full', '')

#             phone = tags.get('phone') or tags.get('contact:phone', '')
#             website = tags.get('website') or tags.get('contact:website', '')
#             opening_hours = tags.get('opening_hours', '')

#             facilities.append({
#                 "name": name,
#                 "type": facility_type,
#                 "latitude": lat,
#                 "longitude": lon,
#                 "address": address,
#                 "phone": phone,
#                 "website": website,
#                 "opening_hours": opening_hours
#             })

#         return Response(facilities, status=status.HTTP_200_OK)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
print("Base Directory:", BASE_DIR)
CSV_PATH = os.path.join(BASE_DIR, 'hospitals', 'ml', 'hospitals_modified.csv')

# Haversine formula to calculate distance between two coordinates
def haversine(lon1, lat1, lon2, lat2):
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371  # Radius of earth in km
    return c * r

class NearbyHospitals(APIView):
    def get(self, request):
        user_lat = request.query_params.get('lat') or request.query_params.get('latitude')
        user_lon = request.query_params.get('lon') or request.query_params.get('longitude')

        if not user_lat or not user_lon:
            return Response({"error": "Latitude and Longitude required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_lat = float(user_lat)
            user_lon = float(user_lon)
        except ValueError:
            return Response({"error": "Invalid coordinates"}, status=status.HTTP_400_BAD_REQUEST)

        df = pd.read_csv(CSV_PATH)
        relevant_cols = ['name', 'address', 'speciality', 'emergency', 'icu',
                         'operating_theatre', 'ventilator', 'x_ray', 'opening_hours', 'website', 'phone', 'lat', 'lon']
        df = df[relevant_cols]
        df = df.dropna(subset=['lat', 'lon', 'name'])
        df = df.fillna('')
        df['distance'] = df.apply(lambda row: haversine(user_lon, user_lat, row['lon'], row['lat']), axis=1)
        nearest_hospitals = df.sort_values('distance').head(50)
        nearest_hospitals = nearest_hospitals.drop(columns=['lat', 'lon', 'distance'])
        result = nearest_hospitals.to_dict(orient='records')
        return Response(result, status=status.HTTP_200_OK)
    
class SpecialityNearbyHospitals(APIView):
    def get(self, request):
        user_lat = request.query_params.get('lat') or request.query_params.get('latitude')
        user_lon = request.query_params.get('lon') or request.query_params.get('longitude')
        speciality = request.query_params.get('speciality', '').lower()
        if not user_lat or not user_lon:
            return Response({"error": "Latitude and Longitude required"}, status=status.HTTP_400_BAD_REQUEST)
        if not speciality:
            return Response({"error": "Speciality required (e.g., cardiology)"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user_lat = float(user_lat)
            user_lon = float(user_lon)
        except ValueError:
            return Response({"error": "Invalid coordinates"}, status=status.HTTP_400_BAD_REQUEST)
        df = pd.read_csv(CSV_PATH)

        # Clean columns
        relevant_cols = ['name', 'address', 'speciality', 'emergency', 'icu',
                         'operating_theatre', 'ventilator', 'x_ray', 'opening_hours', 'website', 'phone', 'lat', 'lon']
        df = df[relevant_cols].dropna(subset=['lat', 'lon', 'name']).fillna('')
        # Filter hospitals with matching speciality
        df_filtered = df[df['speciality'].str.lower().str.contains(speciality, na=False)]
        if df_filtered.empty:
            return Response({"message": f"No hospitals found with speciality '{speciality}'"}, status=status.HTTP_200_OK)
        # Prepare data for KNN
        X = df_filtered[['lat', 'lon']].values
        knn = NearestNeighbors(n_neighbors=min(6, len(df_filtered)), metric='haversine')
        knn.fit(X)
        user_location = [[radians(user_lat), radians(user_lon)]]
        distances, indices = knn.kneighbors(user_location)
        distances = distances[0] * 6371
        nearest_hospitals = df_filtered.iloc[indices[0]].copy()
        nearest_hospitals['distance_km'] = distances.round(2)
        nearest_hospitals = nearest_hospitals.drop(columns=['lat', 'lon'])

        return Response(nearest_hospitals.to_dict(orient='records'), status=status.HTTP_200_OK)