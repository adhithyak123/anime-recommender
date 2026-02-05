import { useState } from 'react'
import PremiumCard from './PremiumCard'

export default function CollectionPage({ myRatings, ratedAnimeDetails, allAnime, onRate, getUserRating }) {
  const [expandedSections, setExpandedSections] = useState({})

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const isExpanded = expandedSections['collection'] || false
  const displayList = isExpanded ? myRatings : myRatings.slice(0, 24)

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            margin: 0,
            color: '#e2e8f0',
            letterSpacing: '-0.5px'
          }}>
            My List
          </h2>
          <div style={{
            padding: '4px 10px',
            background: '#1e293b',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
            color: '#94a3b8'
          }}>
            {myRatings.length}
          </div>
        </div>

        {myRatings.length > 24 && (
          <button
            onClick={() => toggleSection('collection')}
            style={{
              padding: '8px 16px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#334155'}
            onMouseLeave={(e) => e.target.style.background = '#1e293b'}
          >
            {isExpanded ? 'Show Less' : `Show All (${myRatings.length})`}
          </button>
        )}
      </div>

      {myRatings.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155'
        }}>
          <h3 style={{ color: '#e2e8f0', fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>
            Your list is empty
          </h3>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Rate shows to track what you've watched and get personalized recommendations.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '20px'
        }}>
          {displayList.map(rating => {
            const anime = ratedAnimeDetails.find(a => a.id === rating.anime_id) || allAnime.find(a => a.id === rating.anime_id)
            
            if (anime) {
              return <PremiumCard key={anime.id} anime={anime} userRating={rating.rating} onRate={onRate} />
            }
            return null
          })}
        </div>
      )}
    </div>
  )
}