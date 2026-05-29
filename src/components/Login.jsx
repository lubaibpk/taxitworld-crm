import { useState } from 'react'
import { loginUser } from '../supabase.js'
import { LOGO_URI } from '../assets/logoBase64.js'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const user = await loginUser(username.trim(), password)
    setLoading(false)
    if (user) {
      onLogin(user)
    } else {
      setError('Invalid username or password')
    }
  }

  const inp = {
    width:'100%', boxSizing:'border-box', padding:'12px 14px',
    border:'1.5px solid #e2e8f0', borderRadius:'10px',
    fontSize:'15px', outline:'none',
    transition:'border-color 0.2s, box-shadow 0.2s',
    fontFamily:'inherit', background:'#fff',
  }

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg, #1A2B6B 0%, #0d1a42 60%, #1a1a2e 100%)',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:"'Segoe UI', Arial, sans-serif", padding:'20px',
    }}>
      {/* Background dot pattern */}
      <div style={{
        position:'fixed', inset:0, opacity:0.04,
        backgroundImage:'radial-gradient(circle, #F5C518 1px, transparent 1px)',
        backgroundSize:'40px 40px', pointerEvents:'none',
      }}/>

      <div style={{
        background:'#fff', borderRadius:'20px',
        padding:'48px 44px', width:'100%', maxWidth:'440px',
        boxShadow:'0 32px 72px rgba(0,0,0,0.45)', position:'relative',
      }}>
        {/* Gold top bar */}
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:'5px',
          background:'linear-gradient(90deg, #F5C518, #e6b800, #F5C518)',
          borderRadius:'20px 20px 0 0',
        }}/>

        {/* Logo */}
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', marginBottom:'32px', gap:'12px'}}>
          <img
            src={LOGO_URI}
            alt="TaxitWorld"
            style={{
              height: '72px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <div style={{
            height:'1px', width:'100%',
            background:'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
          }}/>
        </div>

        <h2 style={{
          textAlign:'center', margin:'0 0 4px',
          fontSize:'22px', fontWeight:800, color:'#1A2B6B',
        }}>Welcome Back</h2>
        <p style={{
          textAlign:'center', margin:'0 0 32px',
          fontSize:'13px', color:'#94a3b8',
        }}>Sign in to your CRM workspace</p>

        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:'18px'}}>
            <label style={{display:'block',fontSize:'12px',fontWeight:700,color:'#475569',marginBottom:'7px',textTransform:'uppercase',letterSpacing:'0.05em'}}>
              Username
            </label>
            <input type="text" value={username} onChange={e=>setUsername(e.target.value)}
              placeholder="Enter your username" required style={inp}
              onFocus={e=>{e.target.style.borderColor='#1A2B6B';e.target.style.boxShadow='0 0 0 3px rgba(26,43,107,0.1)'}}
              onBlur={e=>{e.target.style.borderColor='#e2e8f0';e.target.style.boxShadow='none'}}/>
          </div>
          <div style={{marginBottom:'26px'}}>
            <label style={{display:'block',fontSize:'12px',fontWeight:700,color:'#475569',marginBottom:'7px',textTransform:'uppercase',letterSpacing:'0.05em'}}>
              Password
            </label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
              placeholder="Enter your password" required style={inp}
              onFocus={e=>{e.target.style.borderColor='#1A2B6B';e.target.style.boxShadow='0 0 0 3px rgba(26,43,107,0.1)'}}
              onBlur={e=>{e.target.style.borderColor='#e2e8f0';e.target.style.boxShadow='none'}}/>
          </div>

          {error && (
            <div style={{
              background:'#fff3f3', border:'1px solid #fecaca',
              color:'#dc2626', padding:'10px 14px',
              borderRadius:'10px', fontSize:'13px',
              marginBottom:'18px', textAlign:'center', fontWeight:500,
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width:'100%', padding:'14px',
            background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1A2B6B, #2a3d8f)',
            color:'#fff', border:'none', borderRadius:'12px',
            fontSize:'15px', fontWeight:700,
            cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing:'0.3px',
            boxShadow: loading ? 'none' : '0 4px 16px rgba(26,43,107,0.35)',
            transition:'all 0.2s', fontFamily:'inherit',
          }}
          onMouseEnter={e=>{if(!loading)e.target.style.transform='translateY(-1px)'}}
          onMouseLeave={e=>{e.target.style.transform='none'}}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <p style={{textAlign:'center',marginTop:'28px',marginBottom:0,fontSize:'12px',color:'#cbd5e1'}}>
          © 2026 TaxitWorld Business Consultancy · KSA
        </p>
      </div>
    </div>
  )
}
