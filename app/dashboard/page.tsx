'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api, endpoints } from '@/lib/api';
import StatsCard from '@/components/ui/StatsCard';
import { Home, Users, ArrowLeftRight, TrendingUp, FileText, Building2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

function formatAmount(n: number) {
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)} M FCFA`;
  if (n >= 1_000) return `${(n/1_000).toFixed(0)} K FCFA`;
  return `${n.toLocaleString()} FCFA`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [propStats, setPropStats] = useState<any>(null);
  const [txnStats, setTxnStats] = useState<any>(null);
  const [recentTxns, setRecentTxns] = useState<any[]>([]);
  const [clientCount, setClientCount] = useState(0);
  const [agentCount, setAgentCount] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get(endpoints.propertiesStats),
      api.get(endpoints.transactionsStats),
      api.get(`${endpoints.transactions}?ordering=-created_at&page_size=5`),
      api.get(`${endpoints.clients}?page_size=1`),
      api.get(`${endpoints.agents}?page_size=1`),
    ]).then(([pS, tS, tR, cC, aC]) => {
      setPropStats(pS.data);
      setTxnStats(tS.data);
      setRecentTxns(tR.data.results || []);
      setClientCount(cC.data.count || 0);
      setAgentCount(aC.data.count || 0);
    }).catch(console.error);
  }, []);

  const STATUS_BADGE: Record<string,string> = { pending:'bg-amber-100 text-amber-700', completed:'bg-emerald-100 text-emerald-700', cancelled:'bg-red-100 text-red-600' };
  const STATUS_LABEL: Record<string,string> = { pending:'En cours', completed:'Complété', cancelled:'Annulé' };
  const TYPE_LABEL: Record<string,string> = { sale:'Vente', rent:'Location', purchase:'Achat' };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <h1 className="font-display font-bold text-2xl text-gray-900">Bonjour, {user?.first_name} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Voici un aperçu de votre activité immobilière</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="animate-fade-up" style={{animationDelay:'0.05s'}}>
          <StatsCard label="Biens total" value={propStats?.total ?? '—'} icon={Home} color="bg-gradient-to-br from-blue-500 to-blue-700" change={`${propStats?.available ?? 0} disponibles`} changeType="up" />
        </div>
        <div className="animate-fade-up" style={{animationDelay:'0.1s'}}>
          <StatsCard label="Agents actifs" value={agentCount ?? '—'} icon={Users} color="bg-gradient-to-br from-indigo-500 to-indigo-700" />
        </div>
        <div className="animate-fade-up" style={{animationDelay:'0.15s'}}>
          <StatsCard label="Clients" value={clientCount ?? '—'} icon={Building2} color="bg-gradient-to-br from-emerald-500 to-emerald-700" />
        </div>
        <div className="animate-fade-up" style={{animationDelay:'0.2s'}}>
          <StatsCard label="Chiffre d'affaires" value={txnStats ? formatAmount(parseFloat(txnStats.total_revenue)) : '—'} icon={TrendingUp} color="bg-gradient-to-br from-amber-500 to-amber-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent transactions */}
        <div className="lg:col-span-2 animate-fade-up" style={{animationDelay:'0.25s'}}>
          <div className="bidhaa-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-gray-900">Transactions récentes</h2>
              <Link href="/dashboard/transactions" className="text-sm text-blue-600 font-semibold hover:underline">Voir tout</Link>
            </div>
            {recentTxns.length === 0 ? (
              <div className="text-center py-8">
                <ArrowLeftRight size={28} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Aucune transaction</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTxns.map(txn => (
                  <div key={txn.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <ArrowLeftRight size={16} className="text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{txn.property_title}</p>
                      <p className="text-xs text-gray-400">{txn.client_name} · {TYPE_LABEL[txn.transaction_type]}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900">{formatAmount(parseFloat(txn.amount))}</p>
                      <span className={`badge text-xs ${STATUS_BADGE[txn.status]}`}>{STATUS_LABEL[txn.status]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Property stats */}
        <div className="animate-fade-up" style={{animationDelay:'0.3s'}}>
          <div className="bidhaa-card p-6 h-full">
            <h2 className="font-display font-bold text-gray-900 mb-5">État des biens</h2>
            <div className="space-y-4">
              {propStats && [
                { label:'Disponibles', count:propStats.available, icon:CheckCircle, color:'text-emerald-500', bg:'bg-emerald-50' },
                { label:'Vendus', count:propStats.sold, icon:TrendingUp, color:'text-blue-500', bg:'bg-blue-50' },
                { label:'Loués', count:propStats.rented, icon:Clock, color:'text-amber-500', bg:'bg-amber-50' },
              ].map(({label,count,icon:Icon,color,bg}) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon size={16} className={color} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">{label}</p>
                  </div>
                  <span className="font-display font-bold text-gray-900 text-lg">{count}</span>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Actions rapides</p>
              {[
                { href:'/dashboard/properties', label:'Ajouter un bien', icon:Home },
                { href:'/dashboard/clients', label:'Nouveau client', icon:Users },
                { href:'/dashboard/transactions', label:'Nouvelle transaction', icon:ArrowLeftRight },
              ].map(({href,label,icon:Icon}) => (
                <Link key={href} href={href} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-all">
                  <Icon size={15} /> {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
