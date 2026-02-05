import { useState } from 'react'
import PremiumCard from './PremiumCard'

export default function RecommendationsPage({ recommendationDetails, onRate, getUserRating, onAddToWatchlist, isInWatchlist }) {
  const [expandedSections, setExpandedSections] = useState({})

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }

  const isSectionExpanded = (sectionKey) => {
    return expandedSections[sectionKey] || false
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          margin: 0,
          color: '#e2e8f0',
          letterSpacing: '-0.5px'
        }}>
          Recommended For You
        </h2>
        <div style={{
          padding: '4px 10px',
          background: '#1e293b',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500',
          color: '#94a3b8'
        }}>
          {Object.keys(recommendationDetails).length}
        </div>
      </div>

      <p style={{
        color: '#64748b',
        fontSize: '14px',
        marginBottom: '40px',
        lineHeight: '1.6'
      }}>
        Personalized picks based on what you've watched and rated.
      </p>

      {Object.keys(recommendationDetails).length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155'
        }}>
          <h3 style={{ color: '#e2e8f0', fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>
            No recommendations yet
          </h3>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Rate at least 5 shows to get personalized recommendations.
          </p>
        </div>
      ) : (
        Object.entries(recommendationDetails).map(([category, animeList], categoryIndex) => {
          const sectionKey = `rec-${category}`
          const isExpanded = isSectionExpanded(sectionKey)
          const displayList = isExpanded ? animeList : animeList.slice(0, 12)
          
          if (animeList.length === 0) return null
          
          return (
            <div key={category} style={{ marginBottom: '50px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  margin: 0,
                  color: '#e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  letterSpacing: '-0.3px'
                }}>
                  <span>{category}</span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#64748b',
                    background: '#1e293b',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    {animeList.length}
                  </span>
                </h3>
                
                {animeList.length > 12 && (
                  <button
                    onClick={() => toggleSection(sectionKey)}
                    style={{
                      padding: '6px 12px',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#334155'}
                    onMouseLeave={(e) => e.target.style.background = '#1e293b'}
                  >
                    {isExpanded ? 'Show Less' : `Show All (${animeList.length})`}
                  </button>
                )}
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '20px'
              }}>
                {displayList.map((anime, index) => (
                  <PremiumCard 
                    key={`${anime.id}-${categoryIndex}-${index}`}
                    anime={anime} 
                    userRating={getUserRating(anime.id)} 
                    onRate={onRate}
                    isRecommendation={true}
                    onAddToWatchlist={onAddToWatchlist}
                    isInWatchlist={isInWatchlist(anime.id)}
                  />
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}