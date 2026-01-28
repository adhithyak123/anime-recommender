import { useState } from 'react'

export default function WatchlistPage({ watchlist, watchlistDetails, onRate, getUserRating, onRemoveFromWatchlist }) {
  const [expandedSections, setExpandedSections] = useState({})

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const isExpanded = expandedSections['watchlist'] || false
  const displayList = isExpanded ? watchlistDetails : watchlistDetails.slice(0, 24)

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
            background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            📝 My Watchlist
          </h2>
          <div style={{
            padding: '6px 14px',
            background: 'rgba(245, 158, 11, 0.15)',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#fbbf24'
          }}>
            {watchlist.length} to watch
          </div>
        </div>

        {watchlistDetails.length > 24 && (
          <button
            onClick={() => toggleSection('watchlist')}
            style={{
              padding: '10px 20px',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '10px',
              color: '#fbbf24',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(245, 158, 11, 0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(245, 158, 11, 0.2)'}
          >
            {isExpanded ? '▲ Show Less' : `▼ Show All (${watchlistDetails.length})`}
          </button>
        )}
      </div>

      {watchlist.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'rgba(245, 158, 11, 0.05)',
          borderRadius: '20px',
          border: '1px solid rgba(245, 158, 11, 0.1)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📝</div>
          <h3 style={{ color: '#fbbf24', fontSize: '24px', marginBottom: '12px' }}>
            Your Watchlist is Empty
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '16px' }}>
            Browse anime and add shows you want to watch later!
          </p>
        </div>
      ) : (
        <div>
          <p style={{
            color: '#94a3b8',
            fontSize: '15px',
            marginBottom: '30px',
            lineHeight: '1.6'
          }}>
            Anime you've saved to watch later. Rate them once you finish watching! 🎬
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '24px'
          }}>
            {displayList.map(anime => (
              <WatchlistCard
                key={anime.id}
                anime={anime}
                userRating={getUserRating(anime.id)}
                onRate={onRate}
                onRemove={onRemoveFromWatchlist}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function WatchlistCard({ anime, userRating, onRate, onRemove }) {
  const [show, setShow] = useState(false)
  const [justRated, setJustRated] = useState(false)
  const [removing, setRemoving] = useState(false)
  const title = anime.title.english || anime.title.romaji

  const handleRate = async (rating) => {
    setJustRated(true)
    await onRate(anime.id, rating)
    
    setTimeout(() => {
      setJustRated(false)
    }, 2000)
  }

  const handleRemove = async () => {
    setRemoving(true)
    await onRemove(anime.id)
  }

  return (
    <div 
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid ' + (show ? 'rgba(245, 158, 11, 0.5)' : 'rgba(139, 92, 246, 0.1)'),
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: show ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: show ? '0 20px 40px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.2)',
        cursor: 'pointer',
        opacity: removing ? 0.5 : 1
      }}
    >
      {justRated && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '12px',
          zIndex: 100,
          animation: 'fadeInOut 2s ease-in-out',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{ fontSize: '64px', animation: 'scaleUp 0.5s ease-out' }}>⭐</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'white', animation: 'slideUp 0.5s ease-out' }}>
            Rated!
          </div>
        </div>
      )}

      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img 
          src={anime.coverImage.extraLarge || anime.coverImage.large}
          alt={title}
          style={{
            width: '100%',
            height: '300px',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.3s',
            transform: show ? 'scale(1.05)' : 'scale(1)'
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: show 
            ? 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, transparent 60%)' 
            : 'linear-gradient(to top, rgba(15, 23, 42, 0.7) 0%, transparent 50%)'
        }} />
      </div>
      
      {show && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '20px 16px',
          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 0.9) 100%)',
          backdropFilter: 'blur(12px)'
        }}>
          <p style={{
            fontSize: '14px',
            fontWeight: '600',
            margin: '0 0 4px 0',
            color: 'white',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {title}
          </p>
          
          {anime.genres && anime.genres.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {anime.genres.slice(0, 2).map(genre => (
                <span key={genre} style={{
                  fontSize: '10px',
                  padding: '3px 8px',
                  background: 'rgba(139, 92, 246, 0.2)',
                  borderRadius: '6px',
                  color: '#c4b5fd',
                  fontWeight: '500'
                }}>
                  {genre}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={handleRemove}
            disabled={removing}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              color: '#fca5a5',
              cursor: removing ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '12px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => !removing && (e.target.style.background = 'rgba(239, 68, 68, 0.3)')}
            onMouseLeave={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
          >
            {removing ? '⏳ Removing...' : '✕ Remove from Watchlist'}
          </button>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '6px',
            marginBottom: '8px'
          }}>
            {[1,2,3,4,5,6,7,8,9,10].map(r => (
              <button
                key={r}
                onClick={() => handleRate(r)}
                style={{
                  padding: '8px 4px',
                  background: userRating === r 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(139, 92, 246, 0.15)',
                  color: 'white',
                  border: userRating === r ? 'none' : '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: userRating === r ? '700' : '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (userRating !== r) {
                    e.target.style.background = 'rgba(139, 92, 246, 0.3)'
                    e.target.style.transform = 'scale(1.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (userRating !== r) {
                    e.target.style.background = 'rgba(139, 92, 246, 0.15)'
                    e.target.style.transform = 'scale(1)'
                  }
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {!show && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          padding: '6px 12px',
          background: 'rgba(245, 158, 11, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '700',
          color: 'white',
          boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
        }}>
          📝 Watchlist
        </div>
      )}
      
      {userRating && !show && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          padding: '8px 14px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '700',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.5)'
        }}>
          ⭐ {userRating}
        </div>
      )}

      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        @keyframes scaleUp {
          0% { transform: scale(0) rotate(0deg); }
          50% { transform: scale(1.2) rotate(180deg); }
          100% { transform: scale(1) rotate(360deg); }
        }
        
        @keyframes slideUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}