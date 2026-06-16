'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { api, endpoints } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Settings, User, Lock, Bell, Moon, Sun, Save, Loader2,
  CheckCircle, Eye, EyeOff, Shield
} from 'lucide-react';

type Section = 'profile' | 'password' | 'notifications';

export default function SettingsPage() {
  const { user } = useAuth();
  const [section, setSection] = useState<Section>('profile');
  const [darkMode, setDarkMode] = useState(false);

  // Profile form
  const [profile, setProfile] = useState({ first_name: '', last_name: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password form
  const [passwords, setPasswords] = useState({ current: '', new1: '', new2: '' });
  const [showPw, setShowPw] = useState({ current: false, new1: false, new2: false });
  const [savingPw, setSavingPw] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (user) {
      setProfile({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: (user as any).phone || '',
      });
    }
    const saved = localStorage.getItem('darkMode') === 'true';
    setDarkMode(saved);
    if (saved) document.documentElement.classList.add('dark');
  }, [user]);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('darkMode', String(next));
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const saveProfile = async () => {
    setSavingProfile(true); setProfileError(''); setProfileSuccess('');
    try {
      await api.patch(endpoints.auth.profile, profile);
      setProfileSuccess('Profil mis à jour avec succès.');
    } catch (e: any) {
      setProfileError(e.response?.data?.detail || 'Erreur lors de la mise à jour.');
    } finally { setSavingProfile(false); }
  };

  const savePassword = async () => {
    if (passwords.new1 !== passwords.new2) {
      setPwError('Les nouveaux mots de passe ne correspondent pas.'); return;
    }
    if (passwords.new1.length < 8) {
      setPwError('Le mot de passe doit contenir au moins 8 caractères.'); return;
    }
    setSavingPw(true); setPwError(''); setPwSuccess('');
    try {
      await api.post('/auth/change-password/', {
        old_password: passwords.current,
        new_password: passwords.new1,
      });
      setPwSuccess('Mot de passe modifié avec succès.');
      setPasswords({ current: '', new1: '', new2: '' });
    } catch (e: any) {
      setPwError(e.response?.data?.detail || 'Mot de passe actuel incorrect.');
    } finally { setSavingPw(false); }
  };

  const sections = [
    { key: 'profile' as Section, label: 'Profil', icon: User },
    { key: 'password' as Section, label: 'Mot de passe', icon: Lock },
    { key: 'notifications' as Section, label: 'Préférences', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md">
            <Settings size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-gray-900">Paramètres</h1>
            <p className="text-xs text-gray-400">Gérez votre compte et vos préférences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {sections.map(s => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.key}
                    onClick={() => setSection(s.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold transition-all ${
                      section === s.key
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                  >
                    <Icon size={16} />
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Account Info */}
            <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <p className="text-center text-sm font-bold text-gray-900">{user?.first_name} {user?.last_name}</p>
              <p className="text-center text-xs text-blue-500 capitalize mt-0.5">{user?.role?.replace('_', ' ')}</p>
              <p className="text-center text-xs text-gray-400 mt-1 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3 space-y-4">

            {/* Profile */}
            {section === 'profile' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-lg text-gray-900 mb-5">Informations personnelles</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Prénom</label>
                      <input
                        type="text"
                        value={profile.first_name}
                        onChange={e => setProfile(p => ({ ...p, first_name: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nom</label>
                      <input
                        type="text"
                        value={profile.last_name}
                        onChange={e => setProfile(p => ({ ...p, last_name: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full border border-gray-100 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Téléphone</label>
                    <input
                      type="tel"
                      placeholder="+242 06 000 0000"
                      value={profile.phone}
                      onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {profileSuccess && (
                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3 text-sm font-medium">
                      <CheckCircle size={15} /> {profileSuccess}
                    </div>
                  )}
                  {profileError && (
                    <p className="text-red-500 text-xs">{profileError}</p>
                  )}
                  <button
                    onClick={saveProfile}
                    disabled={savingProfile}
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl hover:shadow-md transition-all disabled:opacity-50"
                  >
                    {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Enregistrer
                  </button>
                </div>
              </div>
            )}

            {/* Password */}
            {section === 'password' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-lg text-gray-900 mb-5">Modifier le mot de passe</h2>
                <div className="space-y-4">
                  {(['current', 'new1', 'new2'] as const).map((field, i) => (
                    <div key={field}>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        {field === 'current' ? 'Mot de passe actuel' : field === 'new1' ? 'Nouveau mot de passe' : 'Confirmer le nouveau mot de passe'}
                      </label>
                      <div className="relative">
                        <input
                          type={showPw[field] ? 'text' : 'password'}
                          value={passwords[field]}
                          onChange={e => setPasswords(p => ({ ...p, [field]: e.target.value }))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(p => ({ ...p, [field]: !p[field] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPw[field] ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2">
                    <Shield size={14} className="mt-0.5 shrink-0" />
                    Utilisez au moins 8 caractères avec des lettres, chiffres et symboles.
                  </div>
                  {pwSuccess && (
                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3 text-sm font-medium">
                      <CheckCircle size={15} /> {pwSuccess}
                    </div>
                  )}
                  {pwError && <p className="text-red-500 text-xs">{pwError}</p>}
                  <button
                    onClick={savePassword}
                    disabled={savingPw}
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl hover:shadow-md transition-all disabled:opacity-50"
                  >
                    {savingPw ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                    Changer le mot de passe
                  </button>
                </div>
              </div>
            )}

            {/* Notifications / Appearance */}
            {section === 'notifications' && (
              <div className="space-y-4">
                {/* Appearance */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-bold text-lg text-gray-900 mb-5">Apparence</h2>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      {darkMode ? (
                        <Moon size={20} className="text-blue-600" />
                      ) : (
                        <Sun size={20} className="text-amber-500" />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Mode sombre</p>
                        <p className="text-xs text-gray-400">{darkMode ? 'Activé' : 'Désactivé'}</p>
                      </div>
                    </div>
                    <button
                      onClick={toggleDark}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${darkMode ? 'left-7' : 'left-1'}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Notification prefs */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-bold text-lg text-gray-900 mb-5">Notifications</h2>
                  <div className="space-y-3">
                    {[
                      { label: 'Nouveaux messages', sub: 'Quand un agent vous répond' },
                      { label: 'Visites', sub: 'Confirmation et modifications de visite' },
                      { label: 'Contrats', sub: 'Mises à jour sur vos contrats' },
                      { label: 'Plaintes', sub: 'Réponses à vos signalements' },
                    ].map(pref => (
                      <div key={pref.label} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{pref.label}</p>
                          <p className="text-xs text-gray-400">{pref.sub}</p>
                        </div>
                        <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center">
                          <CheckCircle size={12} className="text-blue-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
