import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface LoginPageProps {
  onLogin: (username: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [showSecurity, setShowSecurity] = useState(false);
  const [securityAnswerInput, setSecurityAnswerInput] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [recoveredInfo, setRecoveredInfo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfo('');
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.');
      return;
    }
    setError('');

    const { data, error: dbError } = await supabase
      .from('settings')
      .select('*')
      .eq('admin_name', username)
      .eq('admin_password', password)
      .single();

    if (dbError || !data) {
      setError('Invalid username or password.');
      return;
    }

    onLogin(username);
  };

  const handleForgotPassword = async () => {
    setError('');
    setRecoveredInfo('');
    setSecurityAnswerInput('');
    if (!username.trim()) {
      setError('Enter your username to recover password.');
      return;
    }
    const { data, error: dbError } = await supabase
      .from('settings')
      .select('security_question')
      .eq('admin_name', username)
      .single();
    if (dbError || !data) {
      setError('Username not found.');
    } else {
      setSecurityQuestion(data.security_question);
      setShowSecurity(true);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRecoveredInfo('');
    if (!securityAnswerInput.trim()) {
      setError('Please answer the security question.');
      return;
    }
    const { data, error: dbError } = await supabase
      .from('settings')
      .select('admin_name, admin_password')
      .eq('admin_name', username)
      .eq('security_question', securityQuestion)
      .eq('security_answer', securityAnswerInput)
      .single();
    if (dbError || !data) {
      setError('Incorrect answer.');
    } else {
      setRecoveredInfo(`Admin Name: ${data.admin_name}\nPassword: ${data.admin_password}`);
      setShowSecurity(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      boxSizing: 'border-box',
      // background image from public/SLSU.jpg with subtle dark overlay for readability
      backgroundImage: "linear-gradient(rgba(15,23,42,0.25), rgba(15,23,42,0.25)), url('/SLSU.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <style>{`
        /* Card: increased transparency + backdrop blur so background shows through */
        .lg-card {
          width: 920px;
          max-width: 100%;
          display: flex;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(2,6,23,0.35);
          background: rgba(255,255,255,0.62); /* semi-transparent white */
          backdrop-filter: blur(10px) saturate(120%);
          -webkit-backdrop-filter: blur(10px) saturate(120%);
          border: 1px solid rgba(255,255,255,0.18);
        }

        /* Left panel: translucent gradient */
        .lg-left {
          flex: 1;
          padding: 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
          background: linear-gradient(135deg, rgba(238,242,255,0.42) 0%, rgba(240,249,255,0.30) 100%);
          text-align: center;
          color: #071033;
        }

        /* Right panel: slightly more opaque to improve contrast for inputs */
        .lg-right {
          flex: 1;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 12px;
          background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));
        }

        .shield {
          width: 110px;
          height: 110px;
          border-radius: 18px;
          display:flex;
          align-items:center;
          justify-content:center;
          background: radial-gradient(circle at 30% 30%, rgba(99,102,241,0.18), transparent 30%), linear-gradient(180deg,#6366f1 0%, #10b981 100%);
          box-shadow: 0 8px 30px rgba(59,130,246,0.12);
          transform: translateY(0);
          animation: float 3s ease-in-out infinite;
        }
        .shield svg { filter: drop-shadow(0 6px 18px rgba(16,185,129,0.18)); }
        @keyframes float { 0% { transform: translateY(0); } 50% { transform: translateY(-8px) rotate(-2deg); } 100% { transform: translateY(0); } }

        .title { font-size: 28px; font-weight: 700; color: #071033; letter-spacing: 0.4px; display:flex; align-items:center; gap:10px; justify-content:center; }
        .subtitle { color: rgba(7,16,51,0.78); max-width: 260px; font-size:14px; }
        .input { width:100%; padding:12px 14px; border-radius:10px; border:1px solid rgba(8,16,48,0.08); font-size:15px; outline:none; box-sizing:border-box; background: rgba(255,255,255,0.85); }
        .input::placeholder { color: #94a3b8; }
        .btn { width:100%; padding:12px 14px; border-radius:10px; background: #071033; color:#fff; border:none; font-weight:700; cursor:pointer; }
        .ghost { background: transparent; color:#071033; border: 1px solid rgba(8,16,48,0.06); }
        .links { display:flex; justify-content:center; gap:12px; font-size:13px; color:#2563eb; cursor:pointer; }

        @media (max-width: 820px) { .lg-card { flex-direction: column; } .lg-left { padding: 28px 20px } .lg-right { padding: 24px 20px } }
      `}</style>

      <div className="lg-card" role="main" aria-label="FaceGuard Login">
        <div className="lg-left" aria-hidden>
          <div className="shield" title="FaceGuard">
            {/* simple shield + face icon */}
            <svg viewBox="0 0 64 64" width="60" height="60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M32 4s16 6 24 10v12c0 18-24 26-24 26S8 44 8 26V14C16 10 32 4 32 4z" fill="rgba(255,255,255,0.18)"/>
              <path d="M32 6s14 5 21 9v11c0 16-21 24-21 24S11 42 11 26V15C18 11 32 6 32 6z" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" fill="none"/>
              <circle cx="32" cy="28" r="6" fill="rgba(255,255,255,0.92)"/>
              <path d="M22 44c3-3 9-4 10-4s7 1 10 4" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>

          <div className="title">FaceGuard</div>
          <div className="subtitle">Secure face recognition management. Sign in to manage members and review detection history.</div>
        </div>

        <div className="lg-right">
          <h2 style={{ margin: 0, fontSize: 20, color: '#071033', textAlign: 'left' }}>Sign in</h2>
          <p style={{ marginTop: 6, marginBottom: 8, color: 'rgba(7,16,51,0.7)', fontSize: 13 }}>Use your admin credentials to access the dashboard.</p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
            <input
              className="input"
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={showSecurity}
            />
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={showSecurity}
            />

            {error && <div style={{ color: '#ef4444', textAlign: 'left', fontSize: 13 }}>{error}</div>}
            {info && <div style={{ color: '#16a34a', textAlign: 'left', fontSize: 13 }}>{info}</div>}
            {recoveredInfo && <div style={{ color: '#16a34a', whiteSpace: 'pre-line', fontSize: 13 }}>{recoveredInfo}</div>}

            <button className="btn" type="submit" disabled={showSecurity}>Login</button>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={handleForgotPassword} className="input ghost" style={{ flex: 1 }}>Forgot Password</button>
              <button type="button" onClick={() => { setUsername(''); setPassword(''); setError(''); setInfo(''); }} className="input ghost" style={{ flex: 1 }}>Clear</button>
            </div>
          </form>

          {showSecurity && (
            <div style={{ marginTop: 12 }}>
              <form onSubmit={handleSecuritySubmit} style={{ display: 'grid', gap: 8 }}>
                <div style={{ fontWeight: 600, color: '#071033' }}>{securityQuestion}</div>
                <input
                  className="input"
                  type="text"
                  placeholder="Your answer"
                  value={securityAnswerInput}
                  onChange={e => setSecurityAnswerInput(e.target.value)}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="btn" style={{ flex: 1 }}>Submit Answer</button>
                  <button type="button" onClick={() => setShowSecurity(false)} className="input ghost" style={{ flex: 1 }}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;