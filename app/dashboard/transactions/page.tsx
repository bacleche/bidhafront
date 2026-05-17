'use client';
import { useEffect, useState } from 'react';
import { api, endpoints } from '@/lib/api';
import { Transaction } from '@/types';
import { ArrowLeftRight, TrendingUp, CheckCircle, Clock, XCircle, Search } from 'lucide-react';

const STATUS_CONFIG: Record<string,{label:string;color:string;icon:any}> = {
  pending: { label:'En cours', color:'bg-amber-100 text-amber-700', icon:Clock },
  completed: { label:'Complété', color:'bg-emerald-100 text-emerald-700', icon:CheckCircle },
  cancelled: { label:'Annulé', color:'bg-red-100 text-red-600', icon:XCircle },
};
const TYPE_LABEL: Record<string,string> = { sale:'Vente', rent:'Location', purchase:'Achat' };
const TYPE_COLOR: Record<string,string> = { sale:'bg-blue-100 text-blue-700', rent:'bg-indigo-100 text-indigo-700', purchase:'bg-emerald-100 text-emerald-700' };

function fmt(p: string) {
  const n = parseFloat(p);
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)} M FCFA`;
  return `${n.toLocaleString()} FCFA`;
}

export default function DashboardTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get(endpoints.transactionsStats).then(r=>setStats(r.data)).catch(console.error);
    api.get(endpoints.transactions)
      .then(r=>{ setTransactions(r.data.results||[]); setTotal(r.data.count||0); })
      .finally(()=>setLoading(false));
  },[]);

  const filtered = filter ? transactions.filter(t => t.status === filter || t.transaction_type === filter) : transactions;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gray-900">Transactions</h1>
        <p className="text-gray-500 text-sm">{total} transaction{total!==1?'s':''}</p>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <div className="bidhaa-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><TrendingUp size={18} className="text-emerald-600"/></div>
            <div><p className="text-xs text-gray-500 font-medium">Chiffre d'affaires</p><p className="font-display font-bold text-sm text-gray-900">{fmt(String(stats.total_revenue))}</p></div>
          </div>
          <div className="bidhaa-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><ArrowLeftRight size={18} className="text-blue-600"/></div>
            <div><p className="text-xs text-gray-500 font-medium">Commissions</p><p className="font-display font-bold text-sm text-gray-900">{fmt(String(stats.total_commission))}</p></div>
          </div>
          {stats.by_status?.map((s:any) => (
            <div key={s.status} className="bidhaa-card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${STATUS_CONFIG[s.status]?.color?.split(' ')[0] || 'bg-gray-50'}`}>
               {(() => { const cfg = STATUS_CONFIG[s.status]; if (!cfg) return null; const Icon = cfg.icon; return <Icon size={18} className={cfg.color.split(' ')[1]} />; })()}
              </div>
              <div><p className="text-xs text-gray-500 font-medium">{STATUS_CONFIG[s.status]?.label}</p><p className="font-display font-bold text-sm text-gray-900">{s.count}</p></div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[{v:'',l:'Toutes'},{v:'pending',l:'En cours'},{v:'completed',l:'Complétées'},{v:'sale',l:'Ventes'},{v:'rent',l:'Locations'}].map(({v,l})=>(
          <button key={v} onClick={()=>setFilter(v)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter===v?'bg-blue-600 text-white shadow-md':'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'}`}>{l}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bidhaa-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Référence','Bien','Client','Type','Montant','Commission','Statut','Date'].map(h=>(
                  <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? [...Array(5)].map((_,i)=><tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-8 bg-gray-100 rounded-xl animate-pulse"></div></td></tr>)
              : filtered.length===0 ? (
                <tr><td colSpan={8} className="text-center py-16">
                  <ArrowLeftRight size={28} className="text-gray-200 mx-auto mb-2"/>
                  <p className="text-sm text-gray-400">Aucune transaction</p>
                </td></tr>
              ) : filtered.map(t=>{
                const sc = STATUS_CONFIG[t.status];
                return (
                  <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3"><span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">{t.transaction_number}</span></td>
                    <td className="px-4 py-3"><p className="text-sm font-semibold text-gray-800 max-w-[180px] truncate">{t.property_title}</p></td>
                    <td className="px-4 py-3"><p className="text-sm text-gray-600">{t.client_name}</p></td>
                    <td className="px-4 py-3"><span className={`badge text-xs ${TYPE_COLOR[t.transaction_type]}`}>{TYPE_LABEL[t.transaction_type]}</span></td>
                    <td className="px-4 py-3"><span className="font-display font-bold text-sm text-blue-700">{fmt(t.amount)}</span></td>
                    <td className="px-4 py-3"><span className="text-sm text-emerald-600 font-semibold">{fmt(t.commission)}</span></td>
                    <td className="px-4 py-3"><span className={`badge text-xs ${sc?.color}`}>{sc?.label}</span></td>
                    <td className="px-4 py-3"><span className="text-xs text-gray-500">{new Date(t.transaction_date).toLocaleDateString('fr-FR')}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
