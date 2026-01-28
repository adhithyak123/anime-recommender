import numpy as np
from collections import defaultdict

def get_recommendations(user_ratings, all_ratings_data=None, top_n_per_category=12):
    """
    Generate categorized anime recommendations based on user ratings
    
    Args:
        user_ratings: List of dicts [{"anime_id": 5114, "rating": 10}, ...]
        all_ratings_data: All user ratings (unused for now, for future collaborative filtering)
        top_n_per_category: Number of recommendations per category (increased to 12)
    
    Returns:
        Dict of categories with recommended anime_ids
    """
    
    if not user_ratings or len(user_ratings) < 1:
        return get_default_recommendations()
    
    # Calculate user preferences
    preferences = analyze_user_preferences(user_ratings)
    
    # Get recommendations for each category
    recommendations = {}
    
    for category, score in preferences.items():
        if score > 0:  # Only recommend categories user might like
            category_recs = get_category_recommendations(
                category, 
                user_ratings, 
                top_n_per_category
            )
            if category_recs:
                recommendations[category] = category_recs
    
    # Always add diverse sections
    hidden_gems = get_hidden_gems(user_ratings, 12)
    if hidden_gems:
        recommendations["Hidden Gems"] = hidden_gems
    
    # Add "Because You Liked" section for top-rated anime
    top_anime = get_similar_to_favorites(user_ratings, 12)
    if top_anime:
        recommendations["Because You Rated Highly"] = top_anime
    
    # Add "Trending This Season"
    trending = get_trending_anime(user_ratings, 12)
    if trending:
        recommendations["Trending Now"] = trending
    
    # Add "Classic Must-Watch"
    classics = get_classics(user_ratings, 12)
    if classics:
        recommendations["Timeless Classics"] = classics
    
    return recommendations


def analyze_user_preferences(user_ratings):
    """
    Analyze which genres/categories the user prefers based on ratings
    """
    anime_categories = get_anime_database()
    
    category_scores = defaultdict(float)
    category_counts = defaultdict(int)
    
    for rating in user_ratings:
        anime_id = rating["anime_id"]
        user_rating = rating["rating"]
        
        for category, anime_list in anime_categories.items():
            if anime_id in anime_list:
                if user_rating >= 8:
                    category_scores[category] += 2.0
                elif user_rating >= 6:
                    category_scores[category] += 1.0
                elif user_rating <= 4:
                    category_scores[category] -= 0.5
                
                category_counts[category] += 1
    
    normalized_scores = {}
    for category in category_scores:
        if category_counts[category] > 0:
            normalized_scores[category] = category_scores[category] / category_counts[category]
    
    return normalized_scores


def get_category_recommendations(category, user_ratings, n=12):
    """
    Get recommendations for a specific category
    """
    anime_db = get_anime_database()
    
    if category not in anime_db:
        return []
    
    category_anime = anime_db[category]
    rated_ids = [r["anime_id"] for r in user_ratings]
    available = [anime_id for anime_id in category_anime if anime_id not in rated_ids]
    
    return available[:n]


def get_similar_to_favorites(user_ratings, n=12):
    """
    Recommend anime similar to user's top-rated shows
    """
    favorites = [r["anime_id"] for r in user_ratings if r["rating"] >= 9]
    
    if not favorites:
        favorites = [r["anime_id"] for r in user_ratings if r["rating"] >= 8]
    
    if not favorites:
        return []
    
    similarity_map = get_similarity_database()
    recommendations = []
    
    for fav in favorites[:5]:
        if fav in similarity_map:
            recommendations.extend(similarity_map[fav])
    
    rated_ids = [r["anime_id"] for r in user_ratings]
    seen = set()
    unique_recs = []
    
    for anime_id in recommendations:
        if anime_id not in rated_ids and anime_id not in seen:
            seen.add(anime_id)
            unique_recs.append(anime_id)
    
    return unique_recs[:n]


def get_hidden_gems(user_ratings, n=12):
    """
    Recommend lesser-known but highly-rated anime
    """
    hidden_gems = [
        52034,  # Oshi no Ko
        48736,  # Sono Bisque Doll
        40059,  # Golden Kamuy
        39535,  # Mushoku Tensei
        41025,  # Odd Taxi
        50739,  # Bocchi the Rock!
        40456,  # Ranking of Kings
        48561,  # Made in Abyss S2
        52701,  # Heavenly Delusion
        51179,  # Dr. Stone S3
        48569,  # 86 Part 2
        43608,  # Kaguya-sama S3
        50602,  # Lycoris Recoil
        48926,  # Sono Bisque Doll
        51009,  # Jujutsu Kaisen 2
        21087,  # Akame ga Kill!
        31043,  # Boku dake ga Inai Machi (Erased)
        33050,  # Fate/stay night: Heaven's Feel
        37987,  # Violet Evergarden Movie
        41084,  # Made in Abyss: Dawn of the Deep Soul
    ]
    
    rated_ids = [r["anime_id"] for r in user_ratings]
    available = [anime_id for anime_id in hidden_gems if anime_id not in rated_ids]
    
    return available[:n]


def get_trending_anime(user_ratings, n=12):
    """
    Recent popular anime (2020+)
    """
    trending = [
        54595,  # Sousou no Frieren
        52991,  # Frieren
        52701,  # Heavenly Delusion
        52034,  # Oshi no Ko
        51009,  # Jujutsu Kaisen 2
        50602,  # Lycoris Recoil
        50709,  # Blue Lock
        49596,  # Spy x Family
        48561,  # Made in Abyss S2
        51535,  # Attack on Titan Final
        50265,  # Spy x Family S2
        38691,  # Chainsaw Man
        52299,  # Bocchi the Rock!
        48736,  # Sono Bisque Doll
        50739,  # Bocchi the Rock!
        51009,  # JJK S2
        41457,  # Komi Can't Communicate
        48549,  # Spy x Family Part 2
        52742,  # Zom 100
    ]
    
    rated_ids = [r["anime_id"] for r in user_ratings]
    available = [anime_id for anime_id in trending if anime_id not in rated_ids]
    
    return available[:n]


def get_classics(user_ratings, n=12):
    """
    Timeless classics everyone should watch
    """
    classics = [
        5114,   # Fullmetal Alchemist: Brotherhood
        1535,   # Death Note
        9253,   # Steins;Gate
        11061,  # Hunter x Hunter (2011)
        820,    # Ginga Eiyuu Densetsu (Legend of the Galactic Heroes)
        28977,  # Gintama°
        9969,   # Gintama'
        20958,  # Gintama°
        11757,  # Sword Art Online
        1735,   # Naruto: Shippuuden
        28851,  # Koe no Katachi
        32281,  # Kimi no Na wa
        16498,  # Attack on Titan
        30276,  # One Punch Man
        11757,  # Sword Art Online
        199,    # Sen to Chihiro no Kamikakushi (Spirited Away)
        164,    # Mononoke Hime (Princess Mononoke)
        431,    # Howl no Ugoku Shiro (Howl's Moving Castle)
    ]
    
    rated_ids = [r["anime_id"] for r in user_ratings]
    available = [anime_id for anime_id in classics if anime_id not in rated_ids]
    
    return available[:n]


def get_default_recommendations():
    """
    Default recommendations for new users
    """
    return {
        "Popular Starters": [5114, 16498, 11061, 1535, 9253, 30276, 38000, 40748, 28851, 32281, 21, 34566],
        "Action & Adventure": [16498, 11061, 30276, 40748, 38000, 31964, 41467, 34566, 21, 20, 38691, 51009],
        "Must-Watch Classics": [5114, 1535, 9253, 28851, 32281, 820, 199, 164, 431, 11757],
        "Trending Now": [54595, 52034, 51009, 50602, 49596, 48736, 52701, 50709, 38691, 52299],
    }


def get_anime_database():
    """
    MASSIVE database of 200+ anime organized by category
    """
    return {
        "Shonen Action & Battle": [
            16498,  # Attack on Titan
            11061,  # Hunter x Hunter (2011)
            20,     # Naruto
            1735,   # Naruto Shippuden
            21,     # One Piece
            30276,  # One Punch Man
            38000,  # Demon Slayer
            40748,  # Jujutsu Kaisen
            51009,  # Jujutsu Kaisen S2
            38691,  # Chainsaw Man
            34566,  # My Hero Academia
            31964,  # My Hero Academia S2
            36456,  # My Hero Academia S3
            41467,  # Bleach: Thousand-Year Blood War
            269,    # Bleach
            11757,  # Sword Art Online
            21939,  # Musaigen no Phantom World
            28223,  # Nanatsu no Taizai (Seven Deadly Sins)
            23273,  # Shigatsu wa Kimi no Uso
            21087,  # Akame ga Kill!
            22535,  # Tokyo Ghoul
            25777,  # Shokugeki no Souma
            31240,  # Re:Zero
            37991,  # JoJo Part 5: Golden Wind
            48561,  # Jujutsu Kaisen 0 Movie
            50709,  # Blue Lock
            40060,  # Vinland Saga
            42897,  # Horimiya
            31043,  # Erased (Boku dake ga Inai Machi)
        ],
        
        "Psychological & Thriller": [
            1535,   # Death Note
            9253,   # Steins;Gate
            5114,   # Fullmetal Alchemist: Brotherhood
            31240,  # Re:Zero
            37510,  # Mob Psycho 100 II
            51535,  # Attack on Titan Final Season
            41025,  # Odd Taxi
            52701,  # Heavenly Delusion
            31043,  # Erased
            22199,  # Tokyo Ghoul
            28735,  # Shokugeki no Souma
            11061,  # Hunter x Hunter
            199,    # Spirited Away
            37450,  # Bunny Girl Senpai
            820,    # Legend of the Galactic Heroes
            2904,   # Code Geass R2
            1575,   # Code Geass
            13601,  # Psycho-Pass
            10087,  # Fate/Zero
            17074,  # Monogatari Series Second Season
            48561,  # Made in Abyss S2
            19815,  # No Game No Life
            30831,  # Kaguya-sama
        ],
        
        "Romance & Slice of Life": [
            37450,  # Bunny Girl Senpai
            28851,  # Koe no Katachi (A Silent Voice)
            32281,  # Kimi no Na wa (Your Name)
            33352,  # Violet Evergarden
            37987,  # Violet Evergarden Movie
            30831,  # Kaguya-sama: Love is War
            37976,  # Kaguya-sama S2
            43608,  # Kaguya-sama S3
            39486,  # Gotoubun no Hanayome (Quintessential Quintuplets)
            48736,  # Sono Bisque Doll wa Koi wo Suru
            49596,  # Spy x Family
            50265,  # Spy x Family S2
            52034,  # Oshi no Ko
            42897,  # Horimiya
            23273,  # Shigatsu wa Kimi no Uso (Your Lie in April)
            14813,  # Yahari Ore no Seishun
            34599,  # Made in Abyss
            41025,  # Odd Taxi
            40357,  # Vanitas no Karte
            50739,  # Bocchi the Rock!
            52299,  # Bocchi the Rock!
            48926,  # Dress-Up Darling
            31758,  # Kimi no Na wa
            28297,  # Ore Monogatari!!
            18897,  # Nisekoi
            21405,  # Nisekoi:
            24415,  # Gekkan Shoujo Nozaki-kun
            14741,  # Chuunibyou demo Koi ga Shitai!
            14813,  # Oregairu
            23847,  # Oregairu Zoku
        ],
        
        "Fantasy & Adventure": [
            52991,  # Sousou no Frieren
            54595,  # Frieren
            40060,  # Vinland Saga
            48316,  # Vinland Saga S2
            25537,  # Fate/stay night: UBW
            10087,  # Fate/Zero
            33050,  # Fate/stay night: Heaven's Feel
            39535,  # Mushoku Tensei
            40456,  # Ranking of Kings
            34599,  # Made in Abyss
            48561,  # Made in Abyss S2
            51179,  # Dr. Stone S3
            35247,  # Dr. Stone
            40591,  # Dr. Stone S2
            11061,  # Hunter x Hunter
            21,     # One Piece
            5114,   # Fullmetal Alchemist: Brotherhood
            37430,  # Dororo
            38000,  # Demon Slayer
            31240,  # Re:Zero
            28223,  # Seven Deadly Sins
            31043,  # Erased
            19815,  # No Game No Life
            28977,  # Gintama
            11757,  # Sword Art Online
            21939,  # SAO II
            31765,  # SAO Movie
            38524,  # Attack on Titan S3 P2
        ],
        
        "Comedy & Parody": [
            30831,  # Kaguya-sama
            37976,  # Kaguya-sama S2
            43608,  # Kaguya-sama S3
            30276,  # One Punch Man
            34096,  # One Punch Man S2
            37510,  # Mob Psycho 100 II
            37510,  # Mob Psycho 100
            33352,  # Gintama
            28977,  # Gintama°
            52299,  # Bocchi the Rock!
            50739,  # Bocchi the Rock!
            48736,  # Sono Bisque Doll
            49596,  # Spy x Family
            50265,  # Spy x Family S2
            41457,  # Komi Can't Communicate
            48736,  # Dress-Up Darling
            19815,  # No Game No Life
            25099,  # Assassination Classroom
            24833,  # Assassination Classroom S2
            32281,  # Kimi no Na wa
            42897,  # Horimiya
            28297,  # Ore Monogatari!!
            14741,  # Chuunibyou
            24415,  # Gekkan Shoujo Nozaki-kun
        ],
        
        "Dark Fantasy & Horror": [
            38691,  # Chainsaw Man
            16498,  # Attack on Titan
            51535,  # Attack on Titan Final
            38524,  # Attack on Titan S3 P2
            37430,  # Dororo
            40748,  # Jujutsu Kaisen
            51009,  # Jujutsu Kaisen S2
            52701,  # Heavenly Delusion
            34599,  # Made in Abyss
            48561,  # Made in Abyss S2
            22535,  # Tokyo Ghoul
            21087,  # Akame ga Kill!
            31240,  # Re:Zero
            13601,  # Psycho-Pass
            22319,  # Tokyo Ghoul Root A
            27899,  # Parasyte
            30276,  # One Punch Man
            40456,  # Ranking of Kings
        ],
        
        "Sports & Competition": [
            20583,  # Haikyuu!!
            22199,  # Haikyuu!! S2
            34564,  # Haikyuu!! S3
            36896,  # Haikyuu!! S4
            50709,  # Blue Lock
            11771,  # Kuroko no Basket
            22765,  # Kuroko no Basket S2
            24415,  # Kuroko no Basket S3
            10271,  # Free!
            18245,  # Free! S2
            31043,  # Yuri!!! on Ice
            28891,  # Haikyuu!! S2
            22789,  # Ping Pong the Animation
            28223,  # Baby Steps
            31964,  # Days (TV)
            40456,  # Ranking of Kings
            23273,  # Your Lie in April
        ],
        
        "Drama & Emotional": [
            33352,  # Violet Evergarden
            37987,  # Violet Evergarden Movie
            28851,  # Koe no Katachi
            32281,  # Kimi no Na wa
            37450,  # Bunny Girl Senpai
            9253,   # Steins;Gate
            52034,  # Oshi no Ko
            40060,  # Vinland Saga
            48316,  # Vinland Saga S2
            5114,   # Fullmetal Alchemist: Brotherhood
            23273,  # Your Lie in April
            31043,  # Erased
            42897,  # Horimiya
            31240,  # Re:Zero
            820,    # Legend of the Galactic Heroes
            199,    # Spirited Away
            164,    # Princess Mononoke
            431,    # Howl's Moving Castle
            523,    # Grave of the Fireflies
            1482,   # D.Gray-man
            2904,   # Code Geass R2
            52701,  # Heavenly Delusion
        ],
        
        "Sci-Fi & Mecha": [
            9253,   # Steins;Gate
            1575,   # Code Geass
            2904,   # Code Geass R2
            13601,  # Psycho-Pass
            820,    # Legend of the Galactic Heroes
            30,     # Neon Genesis Evangelion
            32,     # Neon Genesis Evangelion: The End of Evangelion
            5114,   # Fullmetal Alchemist: Brotherhood
            48561,  # 86 Part 2
            48569,  # 86 Part 2
            11757,  # Sword Art Online
            52701,  # Heavenly Delusion
            19815,  # No Game No Life
            50160,  # Trigun Stampede
        ],
        
        "Mystery & Detective": [
            1535,   # Death Note
            31043,  # Erased
            41025,  # Odd Taxi
            13601,  # Psycho-Pass
            820,    # Legend of the Galactic Heroes
            199,    # Spirited Away
            37450,  # Bunny Girl Senpai
            9253,   # Steins;Gate
            17074,  # Monogatari Series
            22789,  # Ping Pong
            52034,  # Oshi no Ko
        ],
    }


def get_similarity_database():
    """
    Expanded similarity map
    """
    return {
        # Attack on Titan
        16498: [51535, 38691, 40748, 1535, 37430, 38524, 22535, 31240],
        
        # Demon Slayer
        38000: [40748, 16498, 11061, 30276, 34566, 51009, 38691, 31964],
        
        # Death Note
        1535: [9253, 37510, 31240, 41025, 52701, 13601, 31043, 1575],
        
        # Steins;Gate
        9253: [1535, 31240, 37450, 37510, 40060, 31043, 13601, 41025],
        
        # FMA:B
        5114: [11061, 16498, 40060, 52991, 39535, 31240, 21, 37430],
        
        # Hunter x Hunter
        11061: [5114, 16498, 30276, 21, 40748, 38000, 31964, 28223],
        
        # One Punch Man
        30276: [37510, 30831, 49596, 11061, 34566, 34096, 40748, 52299],
        
        # Jujutsu Kaisen
        40748: [38000, 51009, 38691, 16498, 34566, 31964, 11061, 30276],
        
        # Your Name
        32281: [28851, 33352, 37450, 52034, 48736, 42897, 23273, 37987],
        
        # Kaguya-sama
        30831: [37976, 43608, 39486, 48736, 49596, 37450, 42897, 52299],
        
        # Spy x Family
        49596: [50265, 30831, 52034, 48736, 41457, 42897, 30276, 37976],
        
        # Frieren
        52991: [54595, 40060, 48316, 5114, 39535, 40456, 33352, 31240],
        
        # Chainsaw Man
        38691: [40748, 51009, 16498, 38000, 37430, 22535, 21087, 51535],
        
        # Violet Evergarden
        33352: [37987, 28851, 32281, 37450, 52034, 23273, 42897, 52991],
        
        # Bocchi the Rock
        52299: [50739, 30831, 49596, 48736, 41457, 37976, 52034, 42897],
    }