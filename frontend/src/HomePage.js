import { useState, useEffect } from 'react'
import axios from 'axios'
import PremiumCard from './PremiumCard'

export default function HomePage({ session, onRate, getUserRating, onAddToWatchlist, isInWatchlist }) {
  const [trendingAnime, setTrendingAnime] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTrendingAnime()
  }, [])

  const fetchTrendingAnime = async () => {
    setLoading(true)
    try {
      const response = await axios.post('https://graphql.anilist.co', {
        query: `
          query {
            Page(page: 1, perPage: 24) {
              media(type: ANIME, sort: TRENDING_DESC) {
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
      setTrendingAnime(response.data.data.Page.media)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  return (
    <div>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '600',
        marginBottom: '24px',
        color: '#e2e8f0',
        letterSpacing: '-0.5px'
      }}>
        Trending Now
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #1e293b',
            borderTop: '3px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ fontSize: '14px' }}>Loading...</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '20px'
        }}>
          {trendingAnime.map(anime => (
            <PremiumCard
              key={anime.id}
              anime={anime}
              userRating={getUserRating(anime.id)}
              onRate={onRate}
              onAddToWatchlist={onAddToWatchlist}
              isInWatchlist={isInWatchlist(anime.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}