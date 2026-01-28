import { useState } from 'react'
import axios from 'axios'
import PremiumCard from './PremiumCard'

export default function SearchPage({ onRate, getUserRating, onAddToWatchlist, isInWatchlist }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)

  const searchAnime = async () => {
    if (!searchTerm) return
    
    setLoading(true)
    try {
      const response = await axios.post('https://graphql.anilist.co', {
        query: `
          query ($search: String) {
            Page(page: 1, perPage: 50) {
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

  return (
    <div>
      <h2 style={{
        fontSize: '32px',
        fontWeight: '700',
        marginBottom: '30px',
        background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        🔍 Search Anime
      </h2>

      <div style={{
        maxWidth: '700px',
        margin: '0 auto 60px',
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
            whiteSpace: 'nowrap'
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔄</div>
          <p>Searching anime...</p>
        </div>
      ) : searchResults.length > 0 ? (
        <div>
          <p style={{ color: '#94a3b8', marginBottom: '30px' }}>
            Found {searchResults.length} results for "{searchTerm}"
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '24px'
          }}>
            {searchResults.map(anime => (
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
        </div>
      ) : searchTerm && !loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>😔</div>
          <p>No results found for "{searchTerm}"</p>
        </div>
      ) : null}
    </div>
  )
}