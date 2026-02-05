import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'
import axios from 'axios'
import HomePage from './HomePage'
import CollectionPage from './CollectionPage'
import RecommendationsPage from './RecommendationsPage'
import SearchPage from './SearchPage'
import WatchlistPage from './WatchlistPage'

const globalStyles = `
  * {
    scroll-behavior: smooth;
  }
  
  body {
    overflow-x: hidden;
    margin: 0;
    padding: 0;
  }
  
  ::-webkit-scrollbar {
    width: 10px;
  }
  
  ::-webkit-scrollbar-track {
    background: #0f172a;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #475569;
    border-radius: 5px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #64748b;
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
  const [loadingRatings, setLoadingRatings] = useState(false)
  const [loadingWatchlist, setLoadingWatchlist] = useState(false)
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)

  useEffect(() => {
    const styleTag = document.createElement('style')
    styleTag.innerHTML = globalStyles
    document.head.appendChild(styleTag)
    
    return () => {
      document.head.removeChild(styleTag)
    }
  }, [])

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
      const [ratingsResult, watchlistResult] = await Promise.all([
        supabase.from('ratings').select('anime_id, rating').eq('user_id', session.user.id),
        supabase.from('watchlist').select('anime_id').eq('user_id', session.user.id)
      ])

      setMyRatings(ratingsResult.data || [])
      setWatchlist(watchlistResult.data || [])
      
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

  const fetchRecommendations = useCallback(async () => {
    if (loadingRecommendations) return
    
    setLoadingRecommendations(true)
    try {
      // USE ENVIRONMENT VARIABLE HERE
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000'
      
      const response = await axios.get(
        `${API_URL}/recommend/${session.user.id}`,
        { timeout: 15000 }
      )
      
      const recsByCategory = response.data.recommendations || {}
      const allIds = Object.values(recsByCategory).flat()
      
      if (allIds.length > 0) {
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
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoadingRecommendations(false)
    }
  }, [session.user.id, loadingRecommendations])

  const fetchRatedAnimeDetails = async (animeIds) => {
    if (animeIds.length === 0) return
    
    setLoadingRatings(true)
    try {
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
      const { error } = await supabase
        .from('watchlist')
        .insert({ user_id: session.user.id, anime_id: animeId })
      
      if (error) throw error
      
      const newWatchlist = [...watchlist, { anime_id: animeId }]
      setWatchlist(newWatchlist)
      
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
    } catch (error) {
      console.error('Error adding to watchlist:', error)
      if (error.code === '23505') {
        alert('Already in watchlist')
      }
    }
  }

  const removeFromWatchlist = async (animeId) => {
    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', session.user.id)
        .eq('anime_id', animeId)
      
      if (error) throw error
      
      setWatchlist(watchlist.filter(w => w.anime_id !== animeId))
      setWatchlistDetails(watchlistDetails.filter(a => a.id !== animeId))
    } catch (error) {
      console.error('Error removing from watchlist:', error)
    }
  }

  const rateAnime = async (animeId, rating) => {
    try {
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
      
      if (!loadingRecommendations) {
        setTimeout(() => fetchRecommendations(), 1000)
      }
    } catch (error) {
      console.error('Rating error:', error)
    }
  }

  const getUserRating = useCallback((animeId) => {
    const r = myRatings.find(x => x.anime_id === animeId)
    return r ? r.rating : null
  }, [myRatings])

  const isInWatchlist = useCallback((animeId) => {
    return watchlist.some(w => w.anime_id === animeId)
  }, [watchlist])

  const isInitialLoading = loadingRatings && loadingWatchlist && Object.keys(recommendationDetails).length === 0

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      color: '#e2e8f0',
      padding: '0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      position: 'relative',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      
      {isInitialLoading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #1e293b',
            borderTop: '3px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{
            fontSize: '15px',
            color: '#64748b',
            fontWeight: '500'
          }}>
            Loading...
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #1e293b',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '16px 40px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{
                color: '#e2e8f0',
                fontSize: '24px',
                fontWeight: '700',
                margin: 0,
                letterSpacing: '-0.5px'
              }}>
                MyAniBuddy
              </h1>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                padding: '6px 14px',
                background: '#1e293b',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#94a3b8'
              }}>
                {session.user.email}
              </div>
              <button 
                onClick={() => supabase.auth.signOut()}
                style={{
                  padding: '8px 16px',
                  background: '#1e293b',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#334155'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#1e293b'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '4px'
          }}>
            {[
              { id: 'home', label: 'Browse' },
              { id: 'watchlist', label: 'Watchlist', badge: watchlist.length },
              { id: 'collection', label: 'My List', badge: myRatings.length },
              { id: 'recommendations', label: 'For You', badge: Object.keys(recommendationDetails).length },
              { id: 'search', label: 'Search' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentPage(tab.id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                style={{
                  padding: '10px 20px',
                  background: currentPage === tab.id ? '#1e293b' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: currentPage === tab.id ? '#e2e8f0' : '#64748b',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== tab.id) {
                    e.target.style.color = '#94a3b8'
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== tab.id) {
                    e.target.style.color = '#64748b'
                  }
                }}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span style={{
                    background: currentPage === tab.id ? '#475569' : '#1e293b',
                    color: '#e2e8f0',
                    padding: '2px 7px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: '600',
                    minWidth: '18px',
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
            session={session}
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
                  width: '50px',
                  height: '50px',
                  border: '3px solid #1e293b',
                  borderTop: '3px solid #6366f1',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 20px'
                }} />
                <p style={{ color: '#64748b', fontSize: '15px', fontWeight: '500' }}>
                  Loading recommendations...
                </p>
              </div>
            ) : (
              <RecommendationsPage
                session={session}
                recommendationDetails={recommendationDetails}
                onRate={rateAnime}
                getUserRating={getUserRating}
                onAddToWatchlist={addToWatchlist}
                isInWatchlist={isInWatchlist}
              />
            )}
          </>
        )}

        {currentPage === 'search' && (
          <SearchPage
            session={session}
            onRate={rateAnime}
            getUserRating={getUserRating}
            onAddToWatchlist={addToWatchlist}
            isInWatchlist={isInWatchlist}
          />
        )}
      </div>

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: '#1e293b',
            border: '1px solid #334155',
            color: '#e2e8f0',
            fontSize: '18px',
            cursor: 'pointer',
            zIndex: 1000,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#334155'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#1e293b'
          }}
        >
          ↑
        </button>
      )}
    </div>
  )
}