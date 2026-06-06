// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const navigate        = useNavigate();
  const { loginDirect } = useAuth();
  const [selected, setSelected] = useState<'egypt' | 'libya' | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleLogin = async () => {
    if (!selected) { setError('Please select a branch.'); return; }
    setLoading(true); setError(null);
    try {
      await loginDirect(selected);
      navigate('/dashboard');
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: '🏗️', text: 'Construction & Road Project Management' },
    { icon: '📊', text: 'Real-time Reports & Interactive Dashboard' },
    { icon: '💰', text: 'Budget Tracking & Spending Control' },
    { icon: '👥', text: 'Employee & Payroll Management' },
  ];

  return (
    /* Force LTR and fill exact viewport — no scroll */
    <div
      dir="ltr"
      className="flex flex-row w-screen h-screen overflow-hidden"
      style={{ fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: '#f1f5f9' }}
    >
      {/* ═══════════════════════════════════════════════
          LEFT BRANDING PANEL  (md and up)
      ═══════════════════════════════════════════════ */}
      <div
        className="hidden md:flex flex-col justify-between flex-shrink-0 overflow-hidden relative"
        style={{
          width: '50%',
          minWidth: 380,
          padding: '48px 52px',
          background: 'linear-gradient(145deg,#0d1424 0%,#111827 45%,#0a1020 100%)',
        }}
      >
        {/* blobs */}
        <div style={{ position:'absolute',top:-100,right:-80,width:480,height:480,borderRadius:'50%',background:'radial-gradient(circle,rgba(249,115,22,.18) 0%,transparent 65%)',pointerEvents:'none' }} />
        <div style={{ position:'absolute',bottom:-80,left:-80,width:380,height:380,borderRadius:'50%',background:'radial-gradient(circle,rgba(59,130,246,.13) 0%,transparent 65%)',pointerEvents:'none' }} />
        <div style={{ position:'absolute',inset:0,pointerEvents:'none',opacity:.035,backgroundImage:'radial-gradient(rgba(255,255,255,1) 1px,transparent 1px)',backgroundSize:'28px 28px' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div style={{ width:44,height:44,borderRadius:12,flexShrink:0,background:'linear-gradient(135deg,#f97316,#fb923c)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 28px rgba(249,115,22,.5)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <span className="block text-lg font-black text-white" style={{ letterSpacing:'-0.3px' }}>Helaly ERP</span>
            <span className="block text-[10px] text-slate-500 uppercase tracking-[.18em]">Construction Platform</span>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10">
          <h1 className="font-black text-white" style={{ fontSize:'clamp(2.2rem,3.5vw,3.4rem)',lineHeight:1.05,letterSpacing:'-1px',margin:0 }}>
            Manage Projects
            <br />
            <span style={{ background:'linear-gradient(135deg,#f97316,#fb923c,#fbbf24)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>
              With Precision
            </span>
          </h1>
          <p className="mt-5 text-slate-400 leading-relaxed" style={{ fontSize:15,maxWidth:340 }}>
            An integrated ERP platform for construction &amp; road projects — from planning to handover.
          </p>

          <div className="mt-9 flex flex-col gap-3.5">
            {features.map((f,i) => (
              <div key={i} className="flex items-center gap-3.5">
                <div style={{ width:38,height:38,borderRadius:10,flexShrink:0,background:'rgba(249,115,22,.10)',border:'1px solid rgba(249,115,22,.18)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>
                  {f.icon}
                </div>
                <span className="text-sm font-medium text-slate-300">{f.text}</span>
                <span className="ml-auto text-emerald-500 font-bold text-sm">✓</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10">
          <div className="flex gap-2.5 flex-wrap mb-4">
            {[{v:'+18',l:'Active Projects'},{v:'94%',l:'Satisfaction'},{v:'5',l:'Branches'}].map((c,i) => (
              <div key={i} className="flex items-center gap-2 px-3.5 py-2 rounded-full" style={{ background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.09)' }}>
                <span className="text-sm font-black text-white">{c.v}</span>
                <span className="text-xs text-slate-500">{c.l}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600">© 2026 Helaly Construction Group · All rights reserved</p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          RIGHT FORM PANEL
      ═══════════════════════════════════════════════ */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-5 py-10 min-w-0">

        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-3 mb-8">
          <div style={{ width:40,height:40,borderRadius:10,background:'linear-gradient(135deg,#f97316,#fb923c)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 18px rgba(249,115,22,.4)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <span className="block text-base font-black text-slate-800">Helaly ERP</span>
            <span className="block text-[10px] text-slate-400 uppercase tracking-[.12em]">Construction</span>
          </div>
        </div>

        {/* Card */}
        <div className="w-full" style={{ maxWidth:400 }}>
          <div className="rounded-3xl bg-white px-9 py-10" style={{ boxShadow:'0 8px 40px -4px rgba(0,0,0,.12),0 2px 8px -2px rgba(0,0,0,.06),0 0 0 1px rgba(226,232,240,.8)' }}>

            <div className="mb-7">
              <h2 className="text-2xl font-extrabold text-slate-900" style={{ letterSpacing:'-0.4px' }}>Welcome back 👋</h2>
              <p className="mt-1.5 text-sm text-slate-400">Select your branch to access the system</p>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm text-red-600" style={{ background:'#fef2f2',border:'1px solid #fecaca' }}>
                <span>⚠</span><span>{error}</span>
              </div>
            )}

            {/* Branch buttons */}
            <div className="flex flex-col gap-3 mb-6">
              {([
                { key:'egypt', flag:'🇪🇬', name:'Egypt',  sub:'Cairo Branch' },
                { key:'libya', flag:'🇱🇾', name:'Libya',  sub:'Tripoli Branch' },
              ] as const).map(({ key, flag, name, sub }) => {
                const active = selected === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelected(key)}
                    className="flex items-center gap-4 w-full rounded-2xl px-4 py-3.5 text-left transition-all duration-150 outline-none cursor-pointer"
                    style={{
                      border: active ? '2px solid #f97316' : '2px solid #e2e8f0',
                      background: active ? 'linear-gradient(135deg,rgba(249,115,22,.06),rgba(251,146,60,.03))' : '#fafafa',
                      boxShadow: active ? '0 0 0 4px rgba(249,115,22,.10)' : '0 1px 3px rgba(0,0,0,.04)',
                      transform: active ? 'translateY(-1px)' : 'none',
                    }}
                  >
                    <span style={{ fontSize:36,lineHeight:1,flexShrink:0 }}>{flag}</span>
                    <div className="flex-1 text-left">
                      <p className="text-base font-bold text-slate-900" style={{ letterSpacing:'-0.2px' }}>{name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                    </div>
                    <div className="flex items-center justify-center shrink-0" style={{ width:22,height:22,borderRadius:'50%',background:active?'#f97316':'#fff',border:active?'none':'2px solid #cbd5e1',boxShadow:active?'0 0 0 3px rgba(249,115,22,.18)':'none',transition:'all .15s' }}>
                      {active && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={!selected || loading}
              className="w-full rounded-2xl text-sm font-bold transition-all duration-150 flex items-center justify-center gap-2.5"
              style={{
                height:50,border:'none',cursor:selected&&!loading?'pointer':'not-allowed',
                ...(selected&&!loading
                  ? { background:'linear-gradient(135deg,#f97316,#fb923c)',color:'#fff',boxShadow:'0 4px 18px rgba(249,115,22,.38),inset 0 1px 0 rgba(255,255,255,.18)' }
                  : { background:'#f1f5f9',color:'#94a3b8' })
              }}
            >
              {loading ? (
                <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /><span>Signing in...</span></>
              ) : (
                <><span>Enter System</span><span className="text-lg">→</span></>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-5">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200" style={{ boxShadow:'0 1px 3px rgba(0,0,0,.04)' }}>
              <span className="text-sm">🔒</span>
              <span className="text-xs text-slate-400 font-medium">Secure &amp; Encrypted · Helaly ERP v2.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
