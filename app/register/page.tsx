'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, endpoints } from '@/lib/api';
import { Building2, Loader2, User, Building, Users } from 'lucide-react';

const ROLES = [
  { value: 'agency_owner', label: "Propriétaire d'agence", icon: Building, desc: 'Gérez votre agence et vos biens' },
  // { value: 'agent', label: 'Agent immobilier', icon: Users, desc: 'Gérez vos clients et transactions' },
  { value: 'client', label: 'Particulier / Client', icon: User, desc: 'Recherchez et achetez des biens' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('client');
  const [form, setForm] = useState({ username:'', email:'', first_name:'', last_name:'', password:'', phone:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post(endpoints.auth.register, { ...form, role });
      router.push('/login?registered=1');
    } catch (err: any) {
      const data = err.response?.data;
      setError(data ? Object.values(data).flat().join(' ') : 'Une erreur est survenue.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8 animate-fade-up">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Building2 size={24} className="text-blue-300" />
            </div>
            <span className="font-display font-extrabold text-3xl text-white">Bidhaa</span>
          </Link>
          <p className="text-blue-200 text-sm">Rejoignez la plateforme immobilière du Congo</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl animate-fade-up" style={{animationDelay:'0.1s'}}>
          <h1 className="font-display font-bold text-2xl text-gray-900 mb-6">Créer un compte</h1>

          {/* Role selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Je suis...</label>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map(({ value, label, icon: Icon, desc }) => (
                <button key={value} type="button" onClick={() => setRole(value)} className={`p-3 rounded-2xl border-2 text-left transition-all ${role===value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
                  <Icon size={18} className={role===value ? 'text-blue-600 mb-1.5' : 'text-gray-400 mb-1.5'} />
                  <p className={`text-xs font-bold leading-tight ${role===value ? 'text-blue-700' : 'text-gray-700'}`}>{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-tight hidden sm:block">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Prénom</label>
                <input value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nom</label>
                <input value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nom d'utilisateur</label>
              <input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone</label>
              <input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+242 06..." className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Mot de passe</label>
              <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={6} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Création...</> : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-blue-600 font-bold hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
