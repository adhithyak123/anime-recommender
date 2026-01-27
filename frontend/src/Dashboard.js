import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import axios from 'axios'

export default function Dashboard({ session }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [animeList, setAnimeList] = useState([])
  const [myRatings, setMyRatings] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch popular anime on load
  useEffect(() => {
    fetchMyRatings()
    fetchRecommendations()
    fetchPopularAnime()
  }, [])

  const fetchMyRatings = async () => {
    const { data } = await supabase
      .from('ratings')
      .select('anime_id, rating')
      .eq('user_id', session.user.id)
    setMyRatings(data || [])
  }

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/recommend/${session.user.id}`)
      setRecommendations(response.data.recommendations || [])
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    }
  }

  const fetchPopularAnime = async () => {
    setLoading(true)
    const query = `
      query {
        Page(page: 1, perPage: 20) {
          media(type: ANIME, sort: POPULARITY_DESC) {
            id
            title {
              english
              romaji
            }
            coverImage {
              large
            }
            averageScore
          }
        }
      }
    `
    
    try {
      const response = await axios.post('https://graphql.anilist.co', { query })
      setAnimeList(response.data.data.Page.media)
    } catch (error) {
      console.error('Error fetching popular anime:', error)
    }
    setLoading(false)
  }

  const searchAnime = async () => {
    if (!searchTerm) {
      fetchPopularAnime()
      return
    }
    setLoading(true)
    
    const query = `
      query ($search: String) {
        Page(page: 1, perPage: 20) {
          media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
            id
            title {
              english
              romaji
            }
            coverImage {
              large
            }
            averageScore
          }
        }
      }
    `
    
    try {
      const response = await axios.post('https://graphql.anilist.co', {
        query,
        variables: { search: searchTerm }
      })
      setAnimeList(response.data.data.Page.media)
    } catch (error) {
      console.error('Error searching anime:', error)
    }
    setLoading(false)
  }

  const rateAnime = async (animeId, rating) => {
    try {
      const { data: existing } = await supabase
        .from('ratings')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('anime_id', animeId)
        .single()

      if (existing) {
        await supabase
          .from('ratings')
          .update({ rating })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('ratings')
          .insert({ user_id: session.user.id, anime_id: animeId, rating })
      }

      fetchMyRatings()
      fetchRecommendations()
      alert('Rating saved! ⭐')
    } catch (error) {
      console.error('Error saving rating:', error)
    }
  }

  const getUserRating = (animeId) => {
    const rating = myRatings.find(r => r.anime_id === animeId)
    return rating ? rating.rating : null
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '20px',
        background: 'rgba(106, 17, 203, 0.1)',
        borderRadius: '10px',
        border: '1px solid rgba(106, 17, 203, 0.3)'
      }}>
        <h1 style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '36px', 
          margin: 0,
          fontWeight: 'bold'
        }}>
          🎬 ANIFLIX
        </h1>
        <button 
          onClick={() => supabase.auth.signOut()}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          Sign Out
        </button>
      </div>

      {/* Search Bar */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto 40px',
        display: 'flex',
        gap: '10px'
      }}>
        <input
          type="text"
          placeholder="Search for anime..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchAnime()}
          style={{
            flex: 1,
            padding: '15px',
            fontSize: '16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '2px solid rgba(106, 17, 203, 0.3)',
            borderRadius: '10px',
            color: 'white',
            outline: 'none'
          }}
        />
        <button 
          onClick={searchAnime}
          disabled={loading}
          style={{
            padding: '15px 30px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          {loading ? '🔄' : '🔍 Search'}
        </button>
      </div>

      {/* Anime Grid */}
      {animeList.length > 0 && (
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ 
            paddingLeft: '20px', 
            marginBottom: '20px',
            fontSize: '24px',
            color: '#667eea'
          }}>
            {searchTerm ? 'Search Results' : '🔥 Popular Anime'}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '20px',
            padding: '0 20px'
          }}>
            {animeList.map(anime => (
              <AnimeCard 
                key={anime.id}
                anime={anime}
                userRating={getUserRating(anime.id)}
                onRate={rateAnime}
              />
            ))}
          </div>
        </div>
      )}

      {/* My Ratings Section */}
{myRatings.length > 0 && (
  <div style={{ marginBottom: '60px' }}>
    <h2 style={{ 
      paddingLeft: '20px', 
      marginBottom: '20px',
      fontSize: '24px',
      color: '#764ba2'
    }}>
      ⭐ My Ratings ({myRatings.length})
    </h2>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '20px',
      padding: '0 20px'
    }}>
      {myRatings.map(rating => {
        // Find the anime details from animeList if available
        const animeDetails = animeList.find(a => a.id === rating.anime_id)
        
        if (animeDetails) {
          return (
            <AnimeCard 
              key={rating.anime_id}
              anime={animeDetails}
              userRating={rating.rating}
              onRate={rateAnime}
            />
          )
        } else {
          // Placeholder for rated anime not in current view
          return (
            <div 
              key={rating.anime_id}
              style={{
                background: 'rgba(106, 17, 203, 0.1)',
                border: '1px solid rgba(106, 17, 203, 0.3)',
                borderRadius: '10px',
                padding: '20px',
                textAlign: 'center',
                minHeight: '300px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <p style={{ color: '#667eea', fontWeight: 'bold', marginBottom: '10px' }}>
                Anime ID: {rating.anime_id}
              </p>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '10px',
                borderRadius: '20px',
                fontWeight: 'bold',
                display: 'inline-block',
                margin: '0 auto'
              }}>
                ⭐ Your Rating: {rating.rating}/10
              </div>
              <p style={{ color: '#aaa', fontSize: '12px', marginTop: '10px' }}>
                (Search to see full details)
              </p>
            </div>
          )
        }
      })}
    </div>
  </div>
)}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h2 style={{ 
            paddingLeft: '20px', 
            marginBottom: '10px',
            fontSize: '24px',
            color: '#667eea'
          }}>
            ✨ Recommended For You
          </h2>
          <p style={{ paddingLeft: '20px', color: '#aaa', marginBottom: '20px' }}>
            Based on your ratings
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '20px',
            padding: '0 20px'
          }}>
            {recommendations.map(animeId => (
              <div key={animeId} style={{
                background: 'rgba(106, 17, 203, 0.1)',
                border: '1px solid rgba(106, 17, 203, 0.3)',
                borderRadius: '10px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#667eea', fontWeight: 'bold' }}>Anime ID: {animeId}</p>
                <p style={{ color: '#aaa', fontSize: '12px' }}>
                  (Fetching details...)
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Anime Card Component
function AnimeCard({ anime, userRating, onRate }) {
  const [showRating, setShowRating] = useState(false)
  const title = anime.title.english || anime.title.romaji

  return (
    <div 
      style={{
        position: 'relative',
        borderRadius: '10px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s',
        border: '2px solid rgba(106, 17, 203, 0.2)',
        background: 'rgba(0, 0, 0, 0.3)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)'
        e.currentTarget.style.border = '2px solid rgba(106, 17, 203, 0.8)'
        setShowRating(true)
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.border = '2px solid rgba(106, 17, 203, 0.2)'
        setShowRating(false)
      }}
    >
      <img 
        src={anime.coverImage.large}
        alt={title}
        style={{
          width: '100%',
          height: '300px',
          objectFit: 'cover'
        }}
      />
      
      {/* Overlay */}
      {showRating && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(22, 33, 62, 0.98), rgba(22, 33, 62, 0.8))',
          padding: '15px',
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{ 
            fontSize: '14px', 
            fontWeight: 'bold',
            marginBottom: '10px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: '#667eea'
          }}>
            {title}
          </p>
          <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '10px' }}>
            Score: {anime.averageScore ? `${anime.averageScore}/100` : 'N/A'}
          </p>
          
          {/* Rating Buttons */}
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {[1,2,3,4,5,6,7,8,9,10].map(rating => (
              <button
                key={rating}
                onClick={() => onRate(anime.id, rating)}
                style={{
                  padding: '5px 10px',
                  background: userRating === rating 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'rgba(106, 17, 203, 0.2)',
                  color: 'white',
                  border: userRating === rating ? 'none' : '1px solid rgba(106, 17, 203, 0.5)',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: userRating === rating ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (userRating !== rating) {
                    e.target.style.background = 'rgba(106, 17, 203, 0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (userRating !== rating) {
                    e.target.style.background = 'rgba(106, 17, 203, 0.2)'
                  }
                }}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Current Rating Badge */}
      {userRating && !showRating && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '20px',
          fontWeight: 'bold',
          fontSize: '14px',
          boxShadow: '0 4px 15px rgba(106, 17, 203, 0.4)'
        }}>
          ⭐ {userRating}
        </div>
      )}
    </div>
  )
}