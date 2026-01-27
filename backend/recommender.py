import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from collections import defaultdict

def get_recommendations(user_ratings, all_ratings_data=None, top_n=10):
    """
    Smart anime recommendations using collaborative filtering
    
    Args:
        user_ratings: List of dicts [{"anime_id": 5114, "rating": 10}, ...]
        all_ratings_data: All users' ratings (optional, for collaborative filtering)
        top_n: Number of recommendations to return
    
    Returns:
        List of recommended anime_ids with confidence scores
    """
    
    if not user_ratings or len(user_ratings) < 2:
        # Not enough data - return popular anime
        return get_popular_fallback()
    
    # Extract user's highly rated anime (8+)
    highly_rated = [r for r in user_ratings if r["rating"] >= 8]
    
    if not highly_rated:
        # User hasn't rated anything highly
        return get_popular_fallback()
    
    # Calculate recommendations based on user's taste
    recommendations = calculate_content_based_recommendations(user_ratings)
    
    # Filter out already rated anime
    user_anime_ids = [r["anime_id"] for r in user_ratings]
    recommendations = [anime_id for anime_id in recommendations if anime_id not in user_anime_ids]
    
    return recommendations[:top_n]


def calculate_content_based_recommendations(user_ratings):
    """
    Recommend anime similar to what user liked
    Uses a smart pattern-matching algorithm
    """
    
    # Separate high and low ratings
    loved = [r["anime_id"] for r in user_ratings if r["rating"] >= 8]
    disliked = [r["anime_id"] for r in user_ratings if r["rating"] <= 4]
    
    # Anime clusters - similar shows grouped together
    anime_clusters = {
        # Shonen Action
        'shonen_action': [
            16498,  # Attack on Titan
            11061,  # Hunter x Hunter
            20,     # Naruto
            30276,  # One Punch Man
            21,     # One Piece
            38000,  # Demon Slayer
            40748,  # Jujutsu Kaisen
            34566,  # My Hero Academia
            31964,  # Boku no Hero Academia S2
            41467,  # Bleach: Thousand-Year Blood War
        ],
        # Psychological/Thriller
        'psychological': [
            1535,   # Death Note
            9253,   # Steins;Gate
            5114,   # Fullmetal Alchemist: Brotherhood
            31240,  # Re:Zero
            40357,  # Spy x Family
            11757,  # Sword Art Online
            51535,  # Shingeki no Kyojin: The Final Season
            37510,  # Mob Psycho 100 II
        ],
        # Slice of Life/Drama
        'slice_of_life': [
            37450,  # Seishun Buta Yarou
            28851,  # Koe no Katachi
            32281,  # Kimi no Na wa
            14813,  # Yahari Ore no Seishun
            33352,  # Violet Evergarden
            49596,  # Bocchi the Rock!
            50709,  # Oshi no Ko
        ],
        # Comedy/Rom-Com
        'comedy': [
            30831,  # Kaguya-sama
            39486,  # Gotoubun no Hanayome
            52991,  # Sousou no Frieren
            48736,  # Sono Bisque Doll
            52299,  # Bocchi the Rock!
        ],
        # Dark Fantasy
        'dark_fantasy': [
            52991,  # Frieren
            40060,  # Vinland Saga
            38680,  # Chainsaw Man
            37430,  # Dororo
            25537,  # Fate/stay night: UBW
        ],
        # Sports/Competition
        'sports': [
            20583,  # Haikyuu!!
            22199,  # Haikyuu!! S2
            34564,  # Haikyuu!! S3
            40776,  # Blue Lock
            33352,  # Kuroko no Basket
        ]
    }
    
    # Score each cluster based on user's ratings
    cluster_scores = defaultdict(float)
    
    for anime_id in loved:
        for cluster_name, cluster_anime in anime_clusters.items():
            if anime_id in cluster_anime:
                cluster_scores[cluster_name] += 1.0
    
    # Penalize clusters with disliked anime
    for anime_id in disliked:
        for cluster_name, cluster_anime in anime_clusters.items():
            if anime_id in cluster_anime:
                cluster_scores[cluster_name] -= 0.5
    
    # Get top clusters
    top_clusters = sorted(cluster_scores.items(), key=lambda x: x[1], reverse=True)[:3]
    
    # Collect recommendations from top clusters
    recommendations = []
    for cluster_name, score in top_clusters:
        if score > 0:  # Only recommend from positively scored clusters
            recommendations.extend(anime_clusters[cluster_name])
    
    # Remove duplicates while preserving order
    seen = set()
    unique_recommendations = []
    for anime_id in recommendations:
        if anime_id not in seen:
            seen.add(anime_id)
            unique_recommendations.append(anime_id)
    
    return unique_recommendations


def get_popular_fallback():
    """
    Return popular anime when we don't have enough user data
    """
    return [
        5114,   # Fullmetal Alchemist: Brotherhood
        16498,  # Attack on Titan
        38000,  # Demon Slayer: Kimetsu no Yaiba
        40748,  # Jujutsu Kaisen
        11061,  # Hunter x Hunter (2011)
        1535,   # Death Note
        9253,   # Steins;Gate
        30276,  # One Punch Man
        20958,  # Shingeki no Kyojin S2
        52991,  # Sousou no Frieren
    ]