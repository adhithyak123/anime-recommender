import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def get_recommendations(user_ratings, all_ratings_data, top_n=5):
    """
    Generate anime recommendations based on user ratings
    
    Args:
        user_ratings: List of dicts [{"anime_id": 5114, "rating": 10}, ...]
        all_ratings_data: All user ratings from database (we'll add this later)
        top_n: Number of recommendations to return
    
    Returns:
        List of recommended anime_ids
    """
    
    # For now, let's start with a simple content-based approach
    # We'll recommend anime similar to the user's highest-rated ones
    
    if not user_ratings:
        return []
    
    # Extract anime IDs the user has rated highly (8+)
    highly_rated = [r["anime_id"] for r in user_ratings if r["rating"] >= 8]
    
    if not highly_rated:
        highly_rated = [r["anime_id"] for r in user_ratings]
    
    # TODO: For now, return some popular anime IDs as placeholders
    # We'll make this smarter in the next step
    popular_anime = [
        11061,  # Hunter x Hunter (2011)
        20958,  # Gintama°
        38524,  # Attack on Titan Season 3 Part 2
        9969,   # Gintama'
        28977,  # Gintama°
    ]
    
    # Filter out anime the user has already rated
    user_anime_ids = [r["anime_id"] for r in user_ratings]
    recommendations = [a for a in popular_anime if a not in user_anime_ids]
    
    return recommendations[:top_n]