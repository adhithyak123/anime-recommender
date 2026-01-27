import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import axios from 'axios'

export default function Dashboard({ session }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [animeList, setAnimeList] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [myRatings, setMyRatings] = useState([])
  const [ratedAnimeDetails, setRatedAnimeDetails] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [recommendationDetails, setRecommendationDetails] = useState([])
  const [loading, setLoading] = useState(false)
  const [isSearchMode, setIsSearchMode] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const { data } = await supabase
        .from('ratings')
        .select('anime_id, rating')
        .eq('user_id', session.user.id)
      setMyRatings(data || [])
      
      if (data && data.length > 0) {
        const ids = data.map(r => r.anime_id)
        await fetchRatedAnimeDetails(ids)
        await fetchRecommendations()
      }
      
      await fetchPopularAnime()
    } catch (error) {
      console.error(error)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/recommend/${session.user.id}`)
      const recIds = response.data.recommendations || []
      setRecommendations(recIds)
      
      // Fetch details for recommendations
      if (recIds.length > 0) {
        const recResponse = await axios.post('https://graphql.anilist.co', {
          query: `
            query ($ids: [Int]) {
              Page {
                media(id_in: $ids, type: ANIME) {
                  id
                  title { english romaji }
                  coverImage { large extraLarge }
                  averageScore
                  genres
                }
              }
            }
          `,
          variables: { ids: recIds }
        })
        setRecommendationDetails(recResponse.data.data.Page.media)
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    }
  }

  const fetchRatedAnimeDetails = async (animeIds) => {
    if (animeIds.length === 0) return
    
    try {
      const response = await axios.post('https://graphql.anilist.co', {
        query: `
          query ($ids: [Int]) {
            Page {
              media(id_in: $ids, type: ANIME) {
                id
                title { english romaji }
                coverImage { large extraLarge }
                averageScore
                genres
              }
            }
          }
        `,
        variables: { ids: animeIds }
      })
      setRatedAnimeDetails(response.data.data.Page.media)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchPopularAnime = async () => {
    setLoading(true)
    try {
      const response = await axios.post('https://graphql.anilist.co', {
        query: `
          query {
            Page(page: 1, perPage: 18) {
              media(type: ANIME, sort: POPULARITY_DESC) {
                id
                title { english romaji }
                coverImage { large extraLarge }
                averageScore
                genres
              }
            }
          }
        `
      })
      setAnimeList(response.data.data.Page.media)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const searchAnime = async () => {
    if (!searchTerm) return
    
    setLoading(true)
    setIsSearchMode(true)
    
    try {
      const response = await axios.post('https://graphql.anilist.co', {
        query: `
          query ($search: String) {
            Page(page: 1, perPage: 24) {
              media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
                id
                title { english romaji }
                coverImage { large extraLarge }
                averageScore
                genres
              }
            }
          }
        `,
        variables: { search: searchTerm }
      })
      setSearchResults(response.data.data.Page.media)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const goHome = () => {
    setIsSearchMode(false)
    setSearchTerm('')
    setSearchResults([])
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
        await supabase.from('ratings').update({ rating }).eq('id', existing.id)
        setMyRatings(myRatings.map(r => r.anime_id === animeId ? {...r, rating} : r))
      } else {
        await supabase.from('ratings').insert({ user_id: session.user.id, anime_id: animeId, rating })
        const newRatings = [...myRatings, { anime_id: animeId, rating }]
        setMyRatings(newRatings)
        
        if (!ratedAnimeDetails.find(a => a.id === animeId)) {
          const allIds = newRatings.map(r => r.anime_id)
          await fetchRatedAnimeDetails(allIds)
        }
      }
      
      // Refresh recommendations after rating
      await fetchRecommendations()
    } catch (error) {
      console.error(error)
    }
  }

  const getUserRating = (animeId) => {
    const r = myRatings.find(x => x.anime_id === animeId)
    return r ? r.rating : null
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #0a0e27 0%, #1a1f3a 50%, #0f1729 100%)',
      color: 'white',
      padding: '0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative'
    }}>
      
      {/* Background Blur Overlay when searching */}
      {isSearchMode && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 14, 39, 0.8)',
          backdropFilter: 'blur(10px)',
          zIndex: 50
        }} />
      )}

      {/* Premium Header */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 40px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)'
            }}>
              🎬
            </div>
            <h1 style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '32px',
              fontWeight: '800',
              margin: 0,
              letterSpacing: '-1px'
            }}>
              ANIFLIX
            </h1>
            
            {/* Home Button */}
            {isSearchMode && (
              <button
                onClick={goHome}
                style={{
                  marginLeft: '20px',
                  padding: '8px 16px',
                  background: 'rgba(102, 126, 234, 0.2)',
                  border: '1px solid rgba(102, 126, 234, 0.4)',
                  borderRadius: '8px',
                  color: '#a78bfa',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(102, 126, 234, 0.3)'
                  e.target.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(102, 126, 234, 0.2)'
                  e.target.style.transform = 'translateY(0)'
                }}
              >
                🏠 Home
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              padding: '8px 16px',
              background: 'rgba(102, 126, 234, 0.1)',
              borderRadius: '20px',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              fontSize: '14px',
              color: '#a78bfa'
            }}>
              {session.user.email}
            </div>
            <button 
              onClick={() => supabase.auth.signOut()}
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {isSearchMode && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
          width: '90%',
          maxWidth: '1400px',
          maxHeight: '80vh',
          overflowY: 'auto',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.3)',
          border: '1px solid rgba(139, 92, 246, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px'
          }}>
            <div>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                margin: '0 0 8px 0',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                🔎 Search Results
              </h2>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '16px' }}>
                Found {searchResults.length} anime for "{searchTerm}"
              </p>
            </div>
            <button
              onClick={goHome}
              style={{
                padding: '12px 20px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '12px',
                color: '#fca5a5',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.3)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
            >
              ✕ Close
            </button>
          </div>

          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#94a3b8'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔄</div>
              <p style={{ fontSize: '18px' }}>Searching anime...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '24px'
            }}>
              {searchResults.map(anime => (
                <PremiumCard key={anime.id} anime={anime} userRating={getUserRating(anime.id)} onRate={rateAnime} />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#94a3b8'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>😔</div>
              <p style={{ fontSize: '18px' }}>No results found for "{searchTerm}"</p>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px',
        filter: isSearchMode ? 'blur(8px)' : 'none',
        pointerEvents: isSearchMode ? 'none' : 'auto',
        transition: 'filter 0.3s'
      }}>
        
        {/* Premium Search Bar */}
        <div style={{
          maxWidth: '700px',
          margin: '0 auto 60px',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '8px',
            borderRadius: '16px',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '20px',
                opacity: 0.5
              }}>
                🔍
              </span>
              <input
                type="text"
                placeholder="Search thousands of anime..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchAnime()}
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 50px',
                  fontSize: '16px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  outline: 'none'
                }}
              />
            </div>
            <button 
              onClick={searchAnime}
              disabled={loading || !searchTerm}
              style={{
                padding: '16px 32px',
                background: (loading || !searchTerm) ? 'rgba(102, 126, 234, 0.3)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: (loading || !searchTerm) ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => !loading && searchTerm && (e.target.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              Search
            </button>
          </div>
        </div>

        {/* Trending Section */}
        {animeList.length > 0 && (
          <div style={{ marginBottom: '80px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '30px'
            }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                margin: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                🔥 Trending Now
              </h2>
              <div style={{
                padding: '6px 14px',
                background: 'rgba(102, 126, 234, 0.15)',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#a78bfa'
              }}>
                {animeList.length} shows
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '24px'
            }}>
              {animeList.map(anime => (
                <PremiumCard key={anime.id} anime={anime} userRating={getUserRating(anime.id)} onRate={rateAnime} />
              ))}
            </div>
          </div>
        )}

        {/* My Collection Section */}
        {myRatings.length > 0 && (
          <div style={{ marginBottom: '80px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '30px'
            }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                margin: 0,
                background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                ⭐ My Collection
              </h2>
              <div style={{
                padding: '6px 14px',
                background: 'rgba(236, 72, 153, 0.15)',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#f0abfc'
              }}>
                {myRatings.length} rated
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '24px'
            }}>
              {myRatings.slice(0, 18).map(rating => {
                const anime = ratedAnimeDetails.find(a => a.id === rating.anime_id) || animeList.find(a => a.id === rating.anime_id)
                
                if (anime) {
                  return <PremiumCard key={anime.id} anime={anime} userRating={rating.rating} onRate={rateAnime} />
                } else {
                  return (
                    <div key={rating.anime_id} style={{
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      borderRadius: '16px',
                      padding: '30px 20px',
                      textAlign: 'center',
                      minHeight: '320px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      gap: '15px',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <div style={{ fontSize: '40px', opacity: 0.6 }}>📺</div>
                      <p style={{
                        color: '#a78bfa',
                        fontWeight: '600',
                        fontSize: '15px',
                        margin: 0
                      }}>
                        Rated Anime
                      </p>
                      <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: '25px',
                        fontWeight: '700',
                        fontSize: '18px',
                        margin: '0 auto',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                      }}>
                        ⭐ {rating.rating}/10
                      </div>
                      <p style={{
                        color: '#64748b',
                        fontSize: '12px',
                        margin: 0
                      }}>
                        ID: {rating.anime_id}
                      </p>
                    </div>
                  )
                }
              })}
            </div>
          </div>
        )}

        {/* AI Recommendations Section */}
        {recommendationDetails.length > 0 && (
          <div style={{ marginBottom: '80px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '30px'
            }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                margin: 0,
                background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                🤖 AI Recommendations
              </h2>
              <div style={{
                padding: '6px 14px',
                background: 'rgba(16, 185, 129, 0.15)',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#6ee7b7'
              }}>
                Powered by your taste
              </div>
            </div>
            
            <p style={{
              color: '#94a3b8',
              fontSize: '15px',
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              Based on your ratings, we think you'll love these anime. The more you rate, the smarter our recommendations become! 🎯
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '24px'
            }}>
              {recommendationDetails.map(anime => (
                <PremiumCard 
                  key={anime.id} 
                  anime={anime} 
                  userRating={getUserRating(anime.id)} 
                  onRate={rateAnime}
                  isRecommendation={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PremiumCard({ anime, userRating, onRate, isRecommendation = false }) {
  const [show, setShow] = useState(false)
  const title = anime.title.english || anime.title.romaji

  return (
    <div 
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid ' + (show ? 'rgba(139, 92, 246, 0.5)' : 'rgba(139, 92, 246, 0.1)'),
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: show ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: show ? '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(139, 92, 246, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.2)',
        cursor: 'pointer'
      }}
    >
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img 
          src={anime.coverImage.extraLarge || anime.coverImage.large}
          alt={title}
          style={{
            width: '100%',
            height: '300px',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.3s',
            transform: show ? 'scale(1.05)' : 'scale(1)'
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: show 
            ? 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, transparent 60%)' 
            : 'linear-gradient(to top, rgba(15, 23, 42, 0.7) 0%, transparent 50%)'
        }} />
      </div>
      
      {show && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '20px 16px',
          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 0.9) 100%)',
          backdropFilter: 'blur(12px)'
        }}>
          <p style={{
            fontSize: '14px',
            fontWeight: '600',
            margin: '0 0 4px 0',
            color: 'white',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {title}
          </p>
          
          {anime.genres && anime.genres.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '6px',
              marginBottom: '12px',
              flexWrap: 'wrap'
            }}>
              {anime.genres.slice(0, 2).map(genre => (
                <span key={genre} style={{
                  fontSize: '10px',
                  padding: '3px 8px',
                  background: 'rgba(139, 92, 246, 0.2)',
                  borderRadius: '6px',
                  color: '#c4b5fd',
                  fontWeight: '500'
                }}>
                  {genre}
                </span>
              ))}
            </div>
          )}
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '6px',
            marginBottom: '8px'
          }}>
            {[1,2,3,4,5,6,7,8,9,10].map(r => (
              <button
                key={r}
                onClick={() => onRate(anime.id, r)}
                style={{
                  padding: '8px 4px',
                  background: userRating === r 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(139, 92, 246, 0.15)',
                  color: 'white',
                  border: userRating === r ? 'none' : '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: userRating === r ? '700' : '500',
                  transition: 'all 0.2s',
                  boxShadow: userRating === r ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (userRating !== r) {
                    e.target.style.background = 'rgba(139, 92, 246, 0.3)'
                    e.target.style.transform = 'scale(1.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (userRating !== r) {
                    e.target.style.background = 'rgba(139, 92, 246, 0.15)'
                    e.target.style.transform = 'scale(1)'
                  }
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Recommendation Badge */}
      {isRecommendation && !show && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          padding: '6px 12px',
          background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '700',
          color: 'white',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          🤖 AI Pick
        </div>
      )}
      
      {/* Score Badge */}
      {anime.averageScore && !show && !isRecommendation && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          padding: '6px 12px',
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '700',
          color: '#fbbf24',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          ⭐ {anime.averageScore}%
        </div>
      )}
      
      {/* User Rating Badge */}
      {userRating && !show && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          padding: '8px 14px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '700',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span>⭐</span>
          <span>{userRating}</span>
        </div>
      )}
    </div>
  )
}