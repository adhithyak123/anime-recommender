import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('✅ Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (error) {
      alert('❌ ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #2d1b69 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 20s infinite ease-in-out'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 25s infinite ease-in-out reverse'
      }} />

      {/* Main Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        maxWidth: '1200px',
        width: '100%',
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.2)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        position: 'relative',
        zIndex: 1
      }}>
        
        {/* Left Side - Branding */}
        <div style={{
          padding: '60px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            opacity: 0.3
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              marginBottom: '30px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}>
              🎬
            </div>
            
            <h1 style={{
              fontSize: '48px',
              fontWeight: '800',
              margin: '0 0 16px 0',
              letterSpacing: '-2px'
            }}>
              ANIFLIX
            </h1>
            
            <p style={{
              fontSize: '20px',
              opacity: 0.9,
              lineHeight: '1.6',
              margin: '0 0 40px 0'
            }}>
              Your personal anime recommendation platform powered by AI
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Feature icon="✨" text="Smart AI-powered recommendations" />
              <Feature icon="⭐" text="Rate and track your favorite anime" />
              <Feature icon="🔍" text="Search thousands of anime instantly" />
              <Feature icon="📊" text="Personalized collection dashboard" />
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div style={{
          padding: '60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'rgba(15, 23, 42, 0.8)'
        }}>
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              margin: '0 0 12px 0',
              color: 'white'
            }}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#94a3b8',
              margin: 0
            }}>
              {isSignUp 
                ? 'Join thousands of anime fans today' 
                : 'Sign in to continue to your dashboard'
              }
            </p>
          </div>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#e2e8f0'
              }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  outline: 'none',
                  transition: 'border 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.border = '2px solid rgba(139, 92, 246, 0.6)'}
                onBlur={(e) => e.target.style.border = '2px solid rgba(139, 92, 246, 0.3)'}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#e2e8f0'
              }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  outline: 'none',
                  transition: 'border 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.border = '2px solid rgba(139, 92, 246, 0.6)'}
                onBlur={(e) => e.target.style.border = '2px solid rgba(139, 92, 246, 0.3)'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '700',
                background: loading 
                  ? 'rgba(102, 126, 234, 0.5)' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.2s',
                marginTop: '10px'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {loading ? (
                <span>⏳ Processing...</span>
              ) : (
                <span>{isSignUp ? '🚀 Create Account' : '🔓 Sign In'}</span>
              )}
            </button>
          </form>

          <div style={{
            marginTop: '30px',
            textAlign: 'center',
            padding: '20px 0',
            borderTop: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <p style={{ color: '#94a3b8', margin: '0 0 12px 0', fontSize: '14px' }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              style={{
                background: 'none',
                border: 'none',
                color: '#a78bfa',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(139, 92, 246, 0.1)'}
              onMouseLeave={(e) => e.target.style.background = 'none'}
            >
              {isSignUp ? 'Sign In Instead →' : 'Create Account →'}
            </button>
          </div>
        </div>
      </div>

      {/* Add keyframes for animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
      `}</style>
    </div>
  )
}

function Feature({ icon, text }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <span style={{ fontSize: '24px' }}>{icon}</span>
      <span style={{ fontSize: '15px', fontWeight: '500' }}>{text}</span>
    </div>
  )
}