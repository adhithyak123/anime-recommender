import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from './supabaseClient'
import axios from 'axios'
import HomePage from './HomePage'
import CollectionPage from './CollectionPage'
import RecommendationsPage from './RecommendationsPage'
import SearchPage from './SearchPage'
import WatchlistPage from './WatchlistPage'

// Global styles
const globalStyles = `
  * {
    scroll-behavior: smooth;
  }
  
  body {
    overflow-x: hidden;
  }
  
  ::-webkit-scrollbar {
    width: 12px;
  }
  
  ::-webkit-scrollbar-track {
    background: #0f1729;
  }
  
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
    border: 2px solid #0f1729;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  }
`

export default function Dashboard({ session }) {
  const [currentPage, setCurrentPage] = useState('home')
  const [animeList, setAnimeList] = useState([])
  const [myRatings, setMyRatings] = useState([])
  const [ratedAnimeDetails, setRatedAnimeDetails] = useState([])
  const [watchlist, setWatchlist] = useState([])
  const [watchlistDetails, setWatchlistDetails] = useState([])
  const [recommendationDetails, setRecommendationDetails] = useState({})
  const [showScrollTop, setShowScrollTop] = useState(false)
  
  // Loading states
  const [loadingRatings, setLoadingRatings] = useState(false)
  const [loadingWatchlist, setLoadingWatchlist] = useState(false)
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)

  // Add global styles
  useEffect(() => {
    const styleTag = document.createElement('style')
    styleTag.innerHTML = globalStyles
    document.head.appendChild(styleTag)
    
    return () => {
      document.head.removeChild(styleTag)
    }
  }, [])

  // Detect scroll for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      // Load everything in parallel for speed
      const [ratingsResult, watchlistResult] = await Promise.all([
        supabase.from('ratings').select('anime_id, rating').eq('user_id', session.user.id),
        supabase.from('watchlist').select('anime_id').eq('user_id', session.user.id)
      ])

      setMyRatings(ratingsResult.data || [])
      setWatchlist(watchlistResult.data || [])
      
      // Fetch details in parallel
      const fetchPromises = []
      
      if (ratingsResult.data && ratingsResult.data.length > 0) {
        const ratingIds = ratingsResult.data.map(r => r.anime_id)
        fetchPromises.push(fetchRatedAnimeDetails(ratingIds))
        fetchPromises.push(fetchRecommendations())
      }

      if (watchlistResult.data && watchlistResult.data.length > 0) {
        const watchlistIds = watchlistResult.data.map(w => w.anime_id)
        fetchPromises.push(fetchWatchlistDetails(watchlistIds))
      }

      await Promise.all(fetchPromises)
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
  }

  // Memoize this to prevent unnecessary re-fetches
  const fetchRecommendations = useCallback(async () => {
    if (loadingRecommendations) return // Prevent duplicate requests
    
    setLoadingRecommendations(true)
    try {
      console.log('🔍 Fetching recommendations...')
      
      const response = await axios.get(
        `http://localhost:8000/recommend/${session.user.id}`,
        { timeout: 15000 } // 15 second timeout
      )
      
      const recsByCategory = response.data.recommendations || {}
      const allIds = Object.values(recsByCategory).flat()
      
      if (allIds.length > 0) {
        // Fetch anime details with timeout
        const recResponse = await axios.post(
          'https://graphql.anilist.co',
          {
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
            variables: { ids: allIds }
          },
          { timeout: 10000 }
        )
        
        const animeDetails = recResponse.data.data.Page.media
        
        const detailsByCategory = {}
        for (const [category, ids] of Object.entries(recsByCategory)) {
          detailsByCategory[category] = ids
            .map(id => animeDetails.find(a => a.id === id))
            .filter(Boolean)
        }
        
        setRecommendationDetails(detailsByCategory)
        console.log('✅ Recommendations loaded')
      }
    } catch (error) {
      console.error('❌ Error fetching recommendations:', error)
      if (error.code === 'ECONNABORTED') {
        alert('Recommendations are taking too long to load. Please try again.')
      }
    } finally {
      setLoadingRecommendations(false)
    }
  }, [session.user.id, loadingRecommendations])

  const fetchRatedAnimeDetails = async (animeIds) => {
    if (animeIds.length === 0) return
    
    setLoadingRatings(true)
    try {
      // Split into chunks of 50 to avoid overwhelming the API
      const chunkSize = 50
      const chunks = []
      for (let i = 0; i < animeIds.length; i += chunkSize) {
        chunks.push(animeIds.slice(i, i + chunkSize))
      }

      const allDetails = []
      for (const chunk of chunks) {
        const response = await axios.post(
          'https://graphql.anilist.co',
          {
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
            variables: { ids: chunk }
          },
          { timeout: 10000 }
        )
        allDetails.push(...response.data.data.Page.media)
      }

      setRatedAnimeDetails(allDetails)
    } catch (error) {
      console.error('Error fetching rated anime:', error)
    } finally {
      setLoadingRatings(false)
    }
  }

  const fetchWatchlistDetails = async (animeIds) => {
    if (animeIds.length === 0) return
    
    setLoadingWatchlist(true)
    try {
      // Split into chunks
      const chunkSize = 50
      const chunks = []
      for (let i = 0; i < animeIds.length; i += chunkSize) {
        chunks.push(animeIds.slice(i, i + chunkSize))
      }

      const allDetails = []
      for (const chunk of chunks) {
        const response = await axios.post(
          'https://graphql.anilist.co',
          {
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
            variables: { ids: chunk }
          },
          { timeout: 10000 }
        )
        allDetails.push(...response.data.data.Page.media)
      }

      setWatchlistDetails(allDetails)
    } catch (error) {
      console.error('Error fetching watchlist:', error)
    } finally {
      setLoadingWatchlist(false)
    }
  }

  const addToWatchlist = async (animeId) => {
    try {
      console.log('📝 Adding to watchlist:', animeId)
      
      const { error } = await supabase
        .from('watchlist')
        .insert({ user_id: session.user.id, anime_id: animeId })
      
      if (error) throw error
      
      const newWatchlist = [...watchlist, { anime_id: animeId }]
      setWatchlist(newWatchlist)
      
      // Fetch details for just the new anime (not all)
      const response = await axios.post('https://graphql.anilist.co', {
        query: `
          query ($id: Int) {
            Media(id: $id, type: ANIME) {
              id
              title { english romaji }
              coverImage { large extraLarge }
              averageScore
              genres
            }
          }
        `,
        variables: { id: animeId }
      })
      
      const newAnime = response.data.data.Media
      if (newAnime) {
        setWatchlistDetails([...watchlistDetails, newAnime])
      }
      
      console.log('✅ Added to watchlist!')
    } catch (error) {
      console.error('❌ Error adding to watchlist:', error)
      if (error.code === '23505') {
        alert('Already in watchlist!')
      } else {
        alert('Failed to add to watchlist: ' + error.message)
      }
    }
  }

  const removeFromWatchlist = async (animeId) => {
    try {
      console.log('🗑️ Removing from watchlist:', animeId)
      
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', session.user.id)
        .eq('anime_id', animeId)
      
      if (error) throw error
      
      setWatchlist(watchlist.filter(w => w.anime_id !== animeId))
      setWatchlistDetails(watchlistDetails.filter(a => a.id !== animeId))
      
      console.log('✅ Removed from watchlist!')
    } catch (error) {
      console.error('❌ Error removing from watchlist:', error)
      alert('Failed to remove from watchlist: ' + error.message)
    }
  }

  const rateAnime = async (animeId, rating) => {
    try {
      console.log('⭐ Rating anime:', animeId, 'with rating:', rating)
      
      const { data: existing, error: selectError } = await supabase
        .from('ratings')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('anime_id', animeId)
        .maybeSingle()

      if (selectError) throw selectError

      if (existing) {
        const { error: updateError } = await supabase
          .from('ratings')
          .update({ rating })
          .eq('id', existing.id)
        
        if (updateError) throw updateError
        
        setMyRatings(myRatings.map(r => r.anime_id === animeId ? {...r, rating} : r))
      } else {
        const { error: insertError } = await supabase
          .from('ratings')
          .insert({ user_id: session.user.id, anime_id: animeId, rating })
        
        if (insertError) throw insertError
        
        const newRatings = [...myRatings, { anime_id: animeId, rating }]
        setMyRatings(newRatings)
        
        // Only fetch details for the new anime if not already loaded
        if (!ratedAnimeDetails.find(a => a.id === animeId)) {
          const response = await axios.post('https://graphql.anilist.co', {
            query: `
              query ($id: Int) {
                Media(id: $id, type: ANIME) {
                  id
                  title { english romaji }
                  coverImage { large extraLarge }
                  averageScore
                  genres
                }
              }
            `,
            variables: { id: animeId }
          })
          
          const newAnime = response.data.data.Media
          if (newAnime) {
            setRatedAnimeDetails([...ratedAnimeDetails, newAnime])
          }
        }
      }
      
      console.log('✅ Rating saved!')
      
      // Debounce recommendation refresh (don't spam the backend)
      if (!loadingRecommendations) {
        setTimeout(() => fetchRecommendations(), 1000)
      }
    } catch (error) {
      console.error('💥 Rating error:', error)
      alert('Failed to save rating: ' + error.message)
    }
  }

  const getUserRating = useCallback((animeId) => {
    const r = myRatings.find(x => x.anime_id === animeId)
    return r ? r.rating : null
  }, [myRatings])

  const isInWatchlist = useCallback((animeId) => {
    return watchlist.some(w => w.anime_id === animeId)
  }, [watchlist])

  const getCategoryEmoji = (category) => {
    const emojiMap = {
      "⭐ Top Picks For You": "⭐",
      "Action": "⚔️",
      "Adventure": "🗺️",
      "Comedy": "😂",
      "Drama": "🎭",
      "Fantasy": "🔮",
      "Horror": "👻",
      "Mystery": "🔍",
      "Psychological": "🧠",
      "Romance": "💕",
      "Sci-Fi": "🚀",
      "Slice of Life": "☕",
      "Sports": "🏆",
      "Supernatural": "✨",
      "Thriller": "😱",
      "Mecha": "🤖",
      "Music": "🎵",
      "Ecchi": "😳",
      "Mahou Shoujo": "🪄",
      "Historical": "📜",
      "Military": "🎖️",
      "School": "🎒",
      "Shoujo": "🌸",
      "Shounen": "⚡",
      "Seinen": "🗡️",
      "Josei": "🌹",
      "Kids": "👶",
      "Other": "📺"
    }
    return emojiMap[category] || "✨"
  }

  // Show loading overlay on initial page load
  const isInitialLoading = loadingRatings && loadingWatchlist && Object.keys(recommendationDetails).length === 0

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #0a0e27 0%, #1a1f3a 50%, #0f1729 100%)',
      color: 'white',
      padding: '0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflowY: 'auto',
      overflowX: 'hidden',
      scrollBehavior: 'smooth'
    }}>
      
      {/* Loading Overlay */}
      {isInitialLoading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 14, 39, 0.95)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(102, 126, 234, 0.2)',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{
            fontSize: '18px',
            color: '#a78bfa',
            fontWeight: '600'
          }}>
            Loading your anime collection...
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      
      {/* Header with Navigation */}
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
          padding: '20px 40px'
        }}>
          {/* Logo and Title */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
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

          {/* Navigation Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '2px solid rgba(139, 92, 246, 0.1)',
            paddingBottom: '0'
          }}>
            {[
              { id: 'home', label: 'Home', icon: '🏠' },
              { id: 'watchlist', label: 'Watchlist', icon: '📝', badge: watchlist.length },
              { id: 'collection', label: 'My Collection', icon: '⭐', badge: myRatings.length },
              { id: 'recommendations', label: 'AI Picks', icon: '🤖', badge: Object.keys(recommendationDetails).length },
              { id: 'search', label: 'Search', icon: '🔍' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentPage(tab.id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                style={{
                  padding: '12px 24px',
                  background: currentPage === tab.id 
                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)'
                    : 'transparent',
                  border: 'none',
                  borderBottom: currentPage === tab.id 
                    ? '3px solid #667eea'
                    : '3px solid transparent',
                  color: currentPage === tab.id ? '#a78bfa' : '#64748b',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '8px 8px 0 0'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== tab.id) {
                    e.target.style.background = 'rgba(102, 126, 234, 0.1)'
                    e.target.style.color = '#94a3b8'
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== tab.id) {
                    e.target.style.background = 'transparent'
                    e.target.style.color = '#64748b'
                  }
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span style={{
                    background: currentPage === tab.id 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(102, 126, 234, 0.3)',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px'
      }}>
        {currentPage === 'home' && (
          <HomePage 
            session={session}
            onRate={rateAnime}
            getUserRating={getUserRating}
            onAddToWatchlist={addToWatchlist}
            isInWatchlist={isInWatchlist}
          />
        )}

        {currentPage === 'watchlist' && (
          <WatchlistPage
            watchlist={watchlist}
            watchlistDetails={watchlistDetails}
            onRate={rateAnime}
            getUserRating={getUserRating}
            onRemoveFromWatchlist={removeFromWatchlist}
          />
        )}

        {currentPage === 'collection' && (
          <CollectionPage
            myRatings={myRatings}
            ratedAnimeDetails={ratedAnimeDetails}
            allAnime={animeList}
            onRate={rateAnime}
            getUserRating={getUserRating}
          />
        )}

        {currentPage === 'recommendations' && (
          <>
            {loadingRecommendations && Object.keys(recommendationDetails).length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  border: '4px solid rgba(16, 185, 129, 0.2)',
                  borderTop: '4px solid #10b981',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 20px'
                }} />
                <p style={{ color: '#6ee7b7', fontSize: '18px', fontWeight: '600' }}>
                  Generating personalized recommendations...
                </p>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '10px' }}>
                  This may take 5-10 seconds
                </p>
              </div>
            ) : (
              <RecommendationsPage
                recommendationDetails={recommendationDetails}
                onRate={rateAnime}
                getUserRating={getUserRating}
                getCategoryEmoji={getCategoryEmoji}
                onAddToWatchlist={addToWatchlist}
                isInWatchlist={isInWatchlist}
              />
            )}
          </>
        )}

        {currentPage === 'search' && (
          <SearchPage
            onRate={rateAnime}
            getUserRating={getUserRating}
            onAddToWatchlist={addToWatchlist}
            isInWatchlist={isInWatchlist}
          />
        )}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.5)',
            zIndex: 1000,
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)'
            e.target.style.boxShadow = '0 6px 30px rgba(102, 126, 234, 0.7)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.5)'
          }}
        >
          ↑
        </button>
      )}
    </div>
  )
}