import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage('Check your email for the confirmation link')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    } catch (error) {
      setMessage(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: '#1e293b',
        borderRadius: '12px',
        padding: '40px',
        border: '1px solid #334155'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#e2e8f0',
          marginBottom: '8px',
          letterSpacing: '-0.5px',
          textAlign: 'center'
        }}>
          MyAniBuddy
        </h1>
        
        <p style={{
          fontSize: '14px',
          color: '#64748b',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          {isSignUp ? 'Create your account' : 'Sign in to continue'}
        </p>

        <form onSubmit={handleAuth}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#94a3b8',
              marginBottom: '6px'
            }}>
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = '#334155'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#94a3b8',
              marginBottom: '6px'
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
                padding: '12px',
                fontSize: '14px',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = '#334155'}
            />
          </div>

          {message && (
            <div style={{
              padding: '12px',
              background: message.includes('Check your email') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${message.includes('Check your email') ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '13px',
              color: message.includes('Check your email') ? '#4ade80' : '#f87171',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              background: loading ? '#475569' : '#6366f1',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              marginBottom: '16px'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.background = '#4f46e5'
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.background = '#6366f1'
            }}
          >
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setMessage('')
            }}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#94a3b8',
              background: 'transparent',
              border: '1px solid #334155',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#334155'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent'
            }}
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #334155',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '12px',
            color: '#64748b',
            lineHeight: '1.6'
          }}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}