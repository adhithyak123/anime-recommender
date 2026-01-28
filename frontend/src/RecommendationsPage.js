import { useState } from 'react'
import PremiumCard from './PremiumCard'

export default function RecommendationsPage({ recommendationDetails, onRate, getUserRating, getCategoryEmoji, onAddToWatchlist, isInWatchlist }) {
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
        marginBottom: '30px'
      }}>
        <h2 style={{
          fontSize: '32px',
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
          {Object.keys(recommendationDetails).length} categories
        </div>
      </div>

      <p style={{
        color: '#94a3b8',
        fontSize: '15px',
        marginBottom: '50px',
        lineHeight: '1.6'
      }}>
        Personalized recommendations based on your taste, powered by Anilist's community data. 🎯
      </p>

      {Object.keys(recommendationDetails).length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'rgba(16, 185, 129, 0.05)',
          borderRadius: '20px',
          border: '1px solid rgba(16, 185, 129, 0.1)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🤖</div>
          <h3 style={{ color: '#6ee7b7', fontSize: '24px', marginBottom: '12px' }}>
            No Recommendations Yet
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '16px' }}>
            Rate at least 3-5 anime to get personalized recommendations!
          </p>
        </div>
      ) : (
        Object.entries(recommendationDetails).map(([category, animeList], categoryIndex) => {
          const sectionKey = `rec-${category}`
          const isExpanded = isSectionExpanded(sectionKey)
          const displayList = isExpanded ? animeList : animeList.slice(0, 12)
          
          if (animeList.length === 0) return null
          
          return (
            <div key={category} style={{ marginBottom: '60px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  margin: 0,
                  color: '#e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span>{getCategoryEmoji(category)}</span>
                  <span>{category}</span>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#64748b',
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '4px 12px',
                    borderRadius: '12px'
                  }}>
                    {animeList.length} picks
                  </span>
                </h3>
                
                {animeList.length > 12 && (
                  <button
                    onClick={() => toggleSection(sectionKey)}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      color: '#6ee7b7',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(16, 185, 129, 0.3)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(16, 185, 129, 0.2)'}
                  >
                    {isExpanded ? '▲ Show Less' : `▼ Show All (${animeList.length})`}
                  </button>
                )}
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '24px'
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