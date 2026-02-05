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
            Watchlist
          </h2>
          <div style={{
            padding: '4px 10px',
            background: '#1e293b',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
            color: '#94a3b8'
          }}>
            {watchlist.length}
          </div>
        </div>

        {watchlistDetails.length > 24 && (
          <button
            onClick={() => toggleSection('watchlist')}
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
            {isExpanded ? 'Show Less' : `Show All (${watchlistDetails.length})`}
          </button>
        )}
      </div>

      {watchlist.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155'
        }}>
          <h3 style={{ color: '#e2e8f0', fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>
            Your watchlist is empty
          </h3>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Add shows you want to watch later.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '20px'
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
    setTimeout(() => setJustRated(false), 1500)
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
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#1e293b',
        transition: 'all 0.2s',
        transform: show ? 'translateY(-4px)' : 'translateY(0)',
        cursor: 'pointer',
        opacity: removing ? 0.5 : 1
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
          <div style={{ fontSize: '48px' }}>✓</div>
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
          background: show ? 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, transparent 60%)' : 'transparent'
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
            margin: '0 0 12px 0',
            color: '#e2e8f0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {title}
          </p>

          <button
            onClick={handleRemove}
            disabled={removing}
            style={{
              width: '100%',
              padding: '8px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#94a3b8',
              cursor: removing ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '10px',
              transition: 'all 0.2s'
            }}
          >
            {removing ? 'Removing...' : 'Remove'}
          </button>
          
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
              >
                {r}
              </button>
            ))}
          </div>
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
      `}</style>
    </div>
  )
}