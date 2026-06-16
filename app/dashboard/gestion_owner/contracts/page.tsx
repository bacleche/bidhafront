'use client';
import { useState , useEffect} from 'react';
import { Plus, FileText } from 'lucide-react';
import { api, endpoints } from '@/lib/api';
import { TransactionModal } from '../../gestion/transactions/TransactionModal';
import { ContractModal } from './ContractModal'; // ← import
import Navbar from '@/components/layout/Navbar';

export default function TransactionsManager() {
  const [showForm, setShowForm] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [contractTarget, setContractTarget] = useState<any | null>(null);  // ← transaction sélectionnée

  const fetchTransactions = () => {
    api.get(endpoints.transactions).then(res => {
      const data = res.data.results || (Array.isArray(res.data) ? res.data : []);
      setTransactions(data);
    }).catch(() => setTransactions([]));
  };

  useEffect(() => { fetchTransactions(); }, []);

  return (
     <div className="min-h-screen bg-gray-50">
              <Navbar />
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500">Gérez les ventes et locations</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={18} /> Nouvelle Transaction
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-6 py-4 text-left">Client</th>
              <th className="px-6 py-4 text-left">Bien</th>
              <th className="px-6 py-4 text-left">Type</th>
              <th className="px-6 py-4 text-left">Montant</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.isArray(transactions) && transactions.length > 0 ? (
              transactions.map((t: any) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold">{t.client_name}</td>
                  <td className="px-6 py-4 text-gray-600">{t.property_title}</td>
                  <td className="px-6 py-4 capitalize">{t.transaction_type}</td>
                  <td className="px-6 py-4">{Number(t.amount).toLocaleString()} FCFA</td>
                  <td className="px-6 py-4 text-right">
                    {t.contract_exists ? (
                      // Bouton grisé si le contrat existe déjà
                      <button
                        disabled
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 border border-gray-200 bg-gray-50 px-3 py-1.5 rounded-lg cursor-not-allowed"
                      >
                        <FileText size={13} />
                        Contrat existant
                      </button>
                    ) : (
                      // Bouton actif pour initier
                      <button
                        onClick={() => setContractTarget(t)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 border border-green-200 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <FileText size={13} />
                        Initier un contrat
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                  Aucune transaction trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <TransactionModal
          onClose={() => setShowForm(false)}
          onCreated={fetchTransactions}
        />
      )}

      {/* Modal contrat */}
      {contractTarget && (
        <ContractModal
          transaction={contractTarget}
          onClose={() => setContractTarget(null)}
          onCreated={fetchTransactions}
        />
      )}
    </div>
    </div>

   
  );
}