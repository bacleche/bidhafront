'use client';
import { useEffect, useState } from 'react';
import { api, endpoints } from '@/lib/api';
import { Transaction } from '@/types';
import { ArrowLeftRight, TrendingUp, CheckCircle, Clock, XCircle, Edit2, Trash2 } from 'lucide-react';
import { TransactionEditModal } from './TransactionEditModal';
import Navbar from '@/components/layout/Navbar';
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'En cours', color: 'bg-amber-100 text-amber-700', icon: Clock },
  completed: { label: 'Complété', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-600', icon: XCircle },
};
const TYPE_LABEL: Record<string, string> = { sale: 'Vente', rent: 'Location', purchase: 'Achat' };
const TYPE_COLOR: Record<string, string> = { sale: 'bg-blue-100 text-blue-700', rent: 'bg-indigo-100 text-indigo-700', purchase: 'bg-emerald-100 text-emerald-700' };

function fmt(p: string) {
  const n = parseFloat(p);
  if (isNaN(n)) return "0 FCFA";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} M FCFA`;
  return `${n.toLocaleString()} FCFA`;
}

export default function DashboardTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('');
  const [stats, setStats] = useState<any>(null);

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const fetchTransactions = async () => {
    try {
      const r = await api.get(endpoints.transactions);
      setTransactions(r.data.results || []);
      setTotal(r.data.count || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    api.get(endpoints.transactionsStats).then(r => setStats(r.data)).catch(console.error);
    fetchTransactions();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette transaction ?")) return;
    try {
      await api.delete(`${endpoints.transactions}${id}/`);
      setTransactions(prev => prev.filter(t => t.id !== id));
      setTotal(prev => prev - 1);
    } catch (err) { alert("Erreur lors de la suppression"); }
  };

  const filtered = filter ? transactions.filter(t => t.status === filter || t.transaction_type === filter) : transactions;

  return (
      <div className="min-h-screen bg-gray-50">
              <Navbar />
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gray-900">Transactions</h1>
        <p className="text-gray-500 text-sm">{total} transaction{total !== 1 ? 's' : ''}</p>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <div className="bidhaa-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><TrendingUp size={18} className="text-emerald-600" /></div>
            <div><p className="text-xs text-gray-500 font-medium">CA</p><p className="font-display font-bold text-sm text-gray-900">{fmt(stats.total_revenue || "0")}</p></div>
          </div>
          <div className="bidhaa-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><ArrowLeftRight size={18} className="text-blue-600" /></div>
            <div><p className="text-xs text-gray-500 font-medium">Commissions</p><p className="font-display font-bold text-sm text-gray-900">{fmt(stats.total_commission || "0")}</p></div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[{ v: '', l: 'Toutes' }, { v: 'pending', l: 'En cours' }, { v: 'completed', l: 'Complétées' }, { v: 'sale', l: 'Ventes' }, { v: 'rent', l: 'Locations' }].map(({ v, l }) => (
          <button key={v} onClick={() => setFilter(v)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === v ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'}`}>{l}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bidhaa-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Référence', 'Bien', 'Client', 'Type', 'Montant', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-8 bg-gray-100 rounded-xl animate-pulse"></div></td></tr>)
                : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16"><p className="text-sm text-gray-400">Aucune transaction trouvée</p></td></tr>
                ) : filtered.map(t => {
                  const sc = STATUS_CONFIG[t.status];
                  return (
                    <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-3"><span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">{t.transaction_number}</span></td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">{t.property_title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{t.client_name}</td>
                      <td className="px-4 py-3"><span className={`badge text-xs ${TYPE_COLOR[t.transaction_type]}`}>{TYPE_LABEL[t.transaction_type]}</span></td>
                      <td className="px-4 py-3 font-bold text-sm text-blue-700">{fmt(t.amount)}</td>
                      <td className="px-4 py-3"><span className={`badge text-xs ${sc?.color}`}>{sc?.label}</span></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingTransaction(t)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(t.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
        </div>

      {editingTransaction && (
        <TransactionEditModal 
          transaction={editingTransaction} 
          onClose={() => setEditingTransaction(null)}
          onUpdated={() => {
            setEditingTransaction(null);
            fetchTransactions(); // Rafraîchit la liste
          }}
        />
      )}
    </div>
  


     

        
  );
}