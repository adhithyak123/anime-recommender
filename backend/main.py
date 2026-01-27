from fastapi import FastAPI
from supabase import create_client
from dotenv import load_dotenv
import os
from recommender import get_recommendations  # ← Add this import

load_dotenv()

app = FastAPI()

# Initialize Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.get("/")
def root():
    return {"message": "Anime Recommender API"}

@app.get("/recommend/{user_id}")
def get_recommendations_endpoint(user_id: str):
    # Get user's ratings from database
    response = supabase.table("ratings").select("anime_id, rating").eq("user_id", user_id).execute()
    user_ratings = response.data
    
    # Get recommendations using our algorithm
    recommendations = get_recommendations(user_ratings, None)
    
    return {
        "user_ratings": user_ratings,
        "recommendations": recommendations
    }