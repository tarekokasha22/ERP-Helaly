// @ts-nocheck
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'react-toastify';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const avatarGradients = [
  'from-orange-400 to-rose-500',
  'from-violet-500 to-purple-600',
  'from-cyan-400 to-blue-500',
  'from-emerald-400 to-teal-500',
];
const getAvatarGradient = (name: string) => {
  const i = name ? name.charCodeAt(0) % avatarGradients.length : 0;
  return avatarGradients[i];
};

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name:     user?.name     || '',
    email:    user?.email    || '',
    phone:    '555-123-4567',
    position: 'Project Manager',
  });

  const avatarGrad   = getAvatarGradient(user?.name || '');
  const initials     = user?.name ? user.name.slice(0, 2).toUpperCase() : 'US';
  const roleLabel    = user?.role === 'admin'
    ? t('profile', 'administrator')
    : t('profile', 'worker');
  const countryLabel = user?.country === 'egypt' ? '🇪🇬 Egypt' : '🇱🇾 Libya';

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t('profile', 'profileUpdated'));
    setIsEditingProfile(false);
  };

  const InfoRow: React.FC<{ icon: React.FC<any>; label: string; value: React.ReactNode }> = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-3.5" style={{ borderBottom: '1px solid rgb(241 245 249)' }}>
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Hero card ─────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)',
          padding: '40px 32px',
        }}
      >
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(249,115,22,.18) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,.15) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03, backgroundImage: 'radial-gradient(rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div
            className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-white text-2xl font-black shrink-0`}
            style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-start">
            <h1 className="text-2xl font-black text-white tracking-tight mb-1">
              {profileData.name || 'User'}
            </h1>
            <p className="text-sm text-slate-400 mb-3">{profileData.position}</p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(249,115,22,0.15)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.25)' }}
              >
                <ShieldCheckIcon className="h-3 w-3" />
                {roleLabel}
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.10)' }}
              >
                {countryLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Account Information card ──────────── */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">{t('profile', 'accountInformation')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{t('profile', 'yourPersonalDetails')}</p>
          </div>
          {!isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="btn btn-sm flex items-center gap-1.5"
              style={{ background: 'rgb(241 245 249)', color: 'var(--text-secondary)', border: '1px solid rgb(226 232 240)' }}
            >
              <PencilIcon className="h-3.5 w-3.5" />
              {t('profile', 'editProfile')}
            </button>
          )}
        </div>

        <div className="card-content pt-2">
          {!isEditingProfile ? (
            <div>
              <InfoRow icon={UserIcon}      label={t('profile', 'fullName')}     value={profileData.name || '—'} />
              <InfoRow icon={EnvelopeIcon}  label={t('profile', 'emailAddress')} value={profileData.email || '—'} />
              <InfoRow icon={PhoneIcon}     label={t('profile', 'phoneNumber')}  value={profileData.phone || '—'} />
              <InfoRow icon={BriefcaseIcon} label={t('profile', 'position')}     value={profileData.position || '—'} />
              <InfoRow
                icon={ShieldCheckIcon}
                label={t('profile', 'role')}
                value={
                  <span className={`badge ${user?.role === 'admin' ? 'badge-brand' : 'badge-muted'}`}>
                    {roleLabel}
                  </span>
                }
              />
              <InfoRow icon={GlobeAltIcon} label={t('profile', 'branch')} value={countryLabel} />
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t('profile', 'fullName')}</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={e => setProfileData(p => ({ ...p, name: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t('profile', 'emailAddress')}</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={e => setProfileData(p => ({ ...p, email: e.target.value }))}
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t('profile', 'phoneNumber')}</label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))}
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t('profile', 'position')}</label>
                <input
                  type="text"
                  value={profileData.position}
                  onChange={e => setProfileData(p => ({ ...p, position: e.target.value }))}
                  className="form-input"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn btn-primary flex items-center gap-1.5" style={{ flex: 1 }}>
                  <CheckIcon className="h-4 w-4" /> {t('profile', 'saveChanges')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="btn flex items-center gap-1.5"
                  style={{ background: 'rgb(241 245 249)', color: 'var(--text-secondary)', border: '1px solid rgb(226 232 240)' }}
                >
                  <XMarkIcon className="h-4 w-4" /> {t('profile', 'cancel')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ── Account meta strip ────────────────────── */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{t('profile', 'accountId')}</p>
              <code className="text-sm font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                {user?.id || 'N/A'}
              </code>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{t('profile', 'username')}</p>
              <p className="text-sm font-semibold text-slate-700">{user?.username || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{t('profile', 'systemAccess')}</p>
              <span className="badge badge-success">Active</span>
            </div>
            <div className="text-xs text-slate-400">
              Helaly ERP v2.0 · {user?.country === 'egypt' ? 'Egypt Branch' : 'Libya Branch'}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Profile;
