'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
// types/auth.ts (ou dans votre AuthContext.tsx)
export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'agency_owner' | 'agent' | 'client';
  email: string;
}


export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true); 
  setError('');
  
  try {
    const userData = await login(form.username, form.password);
    
    const roleRoutes: Record<string, string> = {
      'admin':        '/dashboard',
      'agency_owner': '/dashboard',
      'agent':        '/dashboard',
      'client':       '/dashboard/clients',
    };

    // DEBUG : Affichez le rôle reçu pour voir pourquoi ça ne matche pas
    console.log("Rôle reçu de l'API :", userData.role);

    // Sécurisation : on utilise une route par défaut si le rôle n'existe pas
    const targetRoute = roleRoutes[userData.role] || '/dashboard';
    
    router.push(targetRoute);
    
  } catch (err) {
    setError('Identifiants incorrects ou rôle non reconnu.');
  } finally { 
    setLoading(false); 
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-up">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Building2 size={24} className="text-blue-300" />
            </div>
            <span className="font-display font-extrabold text-3xl text-white">Bidhaa</span>
          </Link>
          <p className="text-blue-200 text-sm">Connectez-vous à votre espace</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl animate-fade-up" style={{animationDelay:'0.1s'}}>
          <h1 className="font-display font-bold text-2xl text-gray-900 mb-6">Connexion</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600 font-medium animate-fade-up">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom d'utilisateur</label>
              <input value={form.username} onChange={e=>setForm({...form, username:e.target.value})} required placeholder="ex: jean.moukoko" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required placeholder="••••••••" className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" /> <span className="text-gray-600 font-medium">Se souvenir de moi</span>
              </label>
              <a href="#" className="text-blue-600 font-semibold hover:underline">Mot de passe oublié ?</a>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Connexion...</> : 'Se connecter'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">Pas encore de compte ?{' '}
              <Link href="/register" className="text-blue-600 font-bold hover:underline">Créer un compte</Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-4 bg-blue-50 rounded-2xl">
            <p className="text-xs font-bold text-blue-700 mb-2">Comptes de démonstration :</p>
            <div className="space-y-1 text-xs text-blue-600 font-mono">
              <p>Admin: <strong>admin</strong> / <strong>admin123</strong></p>
              <p>Agence: <strong>owner1</strong> / <strong>pass123</strong></p>
              <p>Agent: <strong>agent1</strong> / <strong>pass123</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
