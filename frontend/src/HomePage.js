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
            Page(page: 1, perPage: 75) {
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
        fontSize: '32px',
        fontWeight: '700',
        marginBottom: '30px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        🔥 Trending Now
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔄</div>
          <p>Loading trending anime...</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '24px'
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