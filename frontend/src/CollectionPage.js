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
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{
            fontSize: '32px',
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

        {myRatings.length > 24 && (
          <button
            onClick={() => toggleSection('collection')}
            style={{
              padding: '10px 20px',
              background: 'rgba(236, 72, 153, 0.2)',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              borderRadius: '10px',
              color: '#f0abfc',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(236, 72, 153, 0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(236, 72, 153, 0.2)'}
          >
            {isExpanded ? '▲ Show Less' : `▼ Show All (${myRatings.length})`}
          </button>
        )}
      </div>

      {myRatings.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'rgba(102, 126, 234, 0.05)',
          borderRadius: '20px',
          border: '1px solid rgba(102, 126, 234, 0.1)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>⭐</div>
          <h3 style={{ color: '#a78bfa', fontSize: '24px', marginBottom: '12px' }}>
            Start Your Collection
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '16px' }}>
            Go to Home and rate some anime to build your personalized collection!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '24px'
        }}>
          {displayList.map(rating => {
            const anime = ratedAnimeDetails.find(a => a.id === rating.anime_id) || allAnime.find(a => a.id === rating.anime_id)
            
            if (anime) {
              return <PremiumCard key={anime.id} anime={anime} userRating={rating.rating} onRate={onRate} />
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
                  gap: '15px'
                }}>
                  <div style={{ fontSize: '40px', opacity: 0.6 }}>📺</div>
                  <p style={{ color: '#a78bfa', fontWeight: '600', fontSize: '15px', margin: 0 }}>
                    Rated Anime
                  </p>
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '25px',
                    fontWeight: '700',
                    fontSize: '18px',
                    margin: '0 auto'
                  }}>
                    ⭐ {rating.rating}/10
                  </div>
                </div>
              )
            }
          })}
        </div>
      )}
    </div>
  )
}