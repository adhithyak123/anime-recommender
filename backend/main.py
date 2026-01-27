from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from recommender import get_recommendations
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# ✨ ADD CORS MIDDLEWARE - This allows frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

@app.get("/")
def read_root():
    return {"message": "Anime Recommender API"}

@app.get("/recommend/{user_id}")
def recommend(user_id: str):
    """
    Get anime recommendations for a user
    """
    # Fetch user's ratings from Supabase
    response = supabase.table("ratings").select("anime_id, rating").eq("user_id", user_id).execute()
    
    user_ratings = response.data
    
    # Get recommendations
    recommendations = get_recommendations(user_ratings)
    
    return {
        "user_id": user_id,
        "total_ratings": len(user_ratings),
        "recommendations": recommendations
    }