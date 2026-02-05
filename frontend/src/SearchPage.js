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
        fontSize: '24px',
        fontWeight: '600',
        marginBottom: '24px',
        color: '#e2e8f0',
        letterSpacing: '-0.5px'
      }}>
        Search
      </h2>

      <div style={{
        maxWidth: '600px',
        margin: '0 0 40px 0',
        display: 'flex',
        gap: '10px'
      }}>
        <input
          type="text"
          placeholder="Search anime..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchAnime()}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: '14px',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#e2e8f0',
            outline: 'none'
          }}
        />
        <button 
          onClick={searchAnime}
          disabled={loading || !searchTerm}
          style={{
            padding: '12px 24px',
            background: (!loading && searchTerm) ? '#6366f1' : '#1e293b',
            color: '#e2e8f0',
            border: 'none',
            borderRadius: '8px',
            cursor: (loading || !searchTerm) ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

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
          <p style={{ fontSize: '14px' }}>Searching...</p>
        </div>
      ) : searchResults.length > 0 ? (
        <div>
          <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
            Found {searchResults.length} results for "{searchTerm}"
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '20px'
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
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          <p style={{ fontSize: '14px' }}>No results found for "{searchTerm}"</p>
        </div>
      ) : null}
    </div>
  )
}