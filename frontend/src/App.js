import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!session) {
    return <Auth />
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#667eea', margin: 0 }}>🎬 Your Anime Dashboard</h1>
          <button 
            onClick={() => supabase.auth.signOut()}
            style={{
              padding: '10px 20px',
              background: '#ff4757',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Sign Out
          </button>
        </div>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          📧 Logged in as: <strong>{session.user.email}</strong>
        </p>
        <div style={{
          padding: '40px',
          background: '#f8f9fa',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#667eea' }}>✅ You're all set!</h2>
          <p style={{ color: '#666', fontSize: '18px' }}>
            Next we'll build the anime rating and recommendation interface! 🎉
          </p>
        </div>
      </div>
    </div>
  )
}

export default App