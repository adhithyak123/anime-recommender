import { useState } from 'react'

export default function PremiumCard({ anime, userRating, onRate, isRecommendation = false, onAddToWatchlist, isInWatchlist }) {
  const [show, setShow] = useState(false)
  const [justRated, setJustRated] = useState(false)
  const [addingToWatchlist, setAddingToWatchlist] = useState(false)
  const title = anime.title.english || anime.title.romaji

  const handleRate = async (rating) => {
    setJustRated(true)
    await onRate(anime.id, rating)
    
    setTimeout(() => {
      setJustRated(false)
    }, 1500)
  }

  const handleAddToWatchlist = async () => {
    setAddingToWatchlist(true)
    await onAddToWatchlist(anime.id)
    setTimeout(() => setAddingToWatchlist(false), 1000)
  }

  const getHiAnimeUrl = (anime) => {
    const title = anime.title.english || anime.title.romaji
    return `https://hianime.to/search?keyword=${encodeURIComponent(title)}`
  }

  const handleWatch = (e) => {
    e.stopPropagation()
    window.open(getHiAnimeUrl(anime), '_blank')
  }

  return (
    <div 
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      style={{
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#1e293b',
        transition: 'all 0.2s',
        transform: show ? 'translateY(-4px)' : 'translateY(0)',
        cursor: 'pointer'
      }}
    >
      {justRated && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          animation: 'fadeInOut 1.5s ease-in-out'
        }}>
          <div style={{
            fontSize: '48px',
            animation: 'checkmark 0.5s ease-out'
          }}>
            ✓
          </div>
        </div>
      )}

      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img 
          src={anime.coverImage.extraLarge || anime.coverImage.large}
          alt={title}
          style={{
            width: '100%',
            height: '260px',
            objectFit: 'cover',
            display: 'block'
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: show 
            ? 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, transparent 60%)' 
            : 'transparent'
        }} />
      </div>
      
      {show && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px',
          background: 'rgba(15, 23, 42, 0.98)'
        }}>
          <p style={{
            fontSize: '13px',
            fontWeight: '600',
            margin: '0 0 4px 0',
            color: '#e2e8f0',
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
                  background: '#334155',
                  borderRadius: '4px',
                  color: '#94a3b8',
                  fontWeight: '500'
                }}>
                  {genre}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={handleWatch}
            style={{
              width: '100%',
              padding: '10px',
              background: '#6366f1',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '10px',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#4f46e5'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#6366f1'
            }}
          >
            ▶ Watch Now
          </button>

          {onAddToWatchlist && !isInWatchlist && (
            <button
              onClick={handleAddToWatchlist}
              disabled={addingToWatchlist}
              style={{
                width: '100%',
                padding: '8px',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#94a3b8',
                cursor: addingToWatchlist ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                marginBottom: '10px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => !addingToWatchlist && (e.target.style.background = '#334155')}
              onMouseLeave={(e) => e.target.style.background = '#1e293b'}
            >
              {addingToWatchlist ? 'Adding...' : '+ Add to Watchlist'}
            </button>
          )}

          {isInWatchlist && (
            <div style={{
              width: '100%',
              padding: '8px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#94a3b8',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '10px',
              textAlign: 'center'
            }}>
              ✓ In Watchlist
            </div>
          )}
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '4px'
          }}>
            {[1,2,3,4,5,6,7,8,9,10].map(r => (
              <button
                key={r}
                onClick={() => handleRate(r)}
                style={{
                  padding: '6px',
                  background: userRating === r ? '#6366f1' : '#1e293b',
                  color: '#e2e8f0',
                  border: userRating === r ? 'none' : '1px solid #334155',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (userRating !== r) {
                    e.target.style.background = '#334155'
                  }
                }}
                onMouseLeave={(e) => {
                  if (userRating !== r) {
                    e.target.style.background = '#1e293b'
                  }
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {isRecommendation && !show && (
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          padding: '4px 10px',
          background: '#6366f1',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: '600',
          color: 'white',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Recommended
        </div>
      )}
      
      {anime.averageScore && !show && !isRecommendation && (
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          padding: '4px 8px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(4px)',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: '600',
          color: '#fbbf24'
        }}>
          {anime.averageScore}%
        </div>
      )}
      
      {userRating && !show && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          padding: '4px 8px',
          background: '#6366f1',
          color: 'white',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: '600'
        }}>
          ★ {userRating}
        </div>
      )}

      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        @keyframes checkmark {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}