'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Building2, Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Home, Search, Phone } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-blue-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md">
              <Building2 size={20} className="text-white" />
            </div>
            <span className="font-display font-800 text-2xl gradient-text tracking-tight">Bidhaa</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">Accueil</Link>
            <Link href="/properties" className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">Biens</Link>
            <Link href="/agencies" className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">Agences</Link>
            <Link href="/contact" className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">Contact</Link>
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setUserMenu(!userMenu)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-blue-50 transition-all">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-blue-500 capitalize">{user?.role?.replace('_',' ')}</p>
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
                {userMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden z-50 animate-fade-up">
                    <div className="p-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500 font-medium">Connecté en tant que</p>
                      <p className="text-sm font-bold text-gray-800">{user?.email}</p>
                    </div>
                    <Link href="/dashboard" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all">
                      <LayoutDashboard size={15} /> Tableau de bord
                    </Link>
                    <Link href="/dashboard/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all">
                      <User size={15} /> Mon profil
                    </Link>
                    <button onClick={() => { logout(); setUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-all border-t border-gray-100">
                      <LogOut size={15} /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-all">Connexion</Link>
                <Link href="/register" className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all">Inscription</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-1 animate-fade-up">
            {[['/', 'Accueil'], ['/properties', 'Biens'], ['/agencies', 'Agences'], ['/contact', 'Contact']].map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all">{label}</Link>
            ))}
            <div className="pt-2 border-t border-gray-100 flex gap-2">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="flex-1 text-center py-2.5 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl">Dashboard</Link>
                  <button onClick={logout} className="flex-1 py-2.5 text-sm font-bold text-red-500 bg-red-50 rounded-xl">Déconnexion</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="flex-1 text-center py-2.5 text-sm font-bold text-blue-600 border border-blue-200 rounded-xl">Connexion</Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="flex-1 text-center py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl">Inscription</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
