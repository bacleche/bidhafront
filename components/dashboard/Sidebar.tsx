'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Building2, Home, Users, User, ArrowLeftRight, FileText, Settings, LogOut, ChevronRight } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/properties', label: 'Biens', icon: Home },
  { href: '/dashboard/agents', label: 'Agents', icon: Users },
  { href: '/dashboard/clients', label: 'Clients', icon: User },
  { href: '/dashboard/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/dashboard/contracts', label: 'Contrats', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-950 to-blue-900 min-h-screen flex flex-col text-white shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <Building2 size={18} className="text-blue-300" />
          </div>
          <span className="font-display font-bold text-xl">Bidhaa</span>
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold shrink-0">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-blue-300 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all group ${active ? 'bg-white/15 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white'}`}>
              <Icon size={17} className={active ? 'text-blue-300' : 'text-blue-400 group-hover:text-blue-300'} />
              {label}
              {active && <ChevronRight size={14} className="ml-auto text-blue-300" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-white/10 space-y-0.5">
        <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-blue-200 hover:bg-white/10 hover:text-white transition-all font-semibold">
          <Settings size={16} /> Paramètres
        </Link>
        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all font-semibold">
          <LogOut size={16} /> Déconnexion
        </button>
      </div>
    </aside>
  );
}
