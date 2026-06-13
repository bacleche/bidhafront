'use client';
import { useState, useEffect } from 'react';
import { api, endpoints } from '@/lib/api';
import { FileSearch } from 'lucide-react';

export default function ContractGenerator({ transactionId, onCreated }: { transactionId: number | undefined, onCreated: () => void }) {
  const [formData, setFormData] = useState({ title: '', contract_type: 'sale_contract', content: '' });
  const [transactionData, setTransactionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Sécurisation : on charge les détails uniquement si transactionId est valide
  useEffect(() => {
    if (transactionId) {
      api.get(`${endpoints.transactions}${transactionId}/`)
        .then(res => setTransactionData(res.data))
        .catch(err => console.error("Erreur chargement transaction:", err));
    }
  }, [transactionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId) return;
    
    setLoading(true);
    try {
      await api.post(endpoints.contracts, { 
        ...formData, 
        transaction: transactionId, 
        status: 'sent' 
      });
      onCreated();
      alert("Contrat émis avec succès");
    } catch (err) { 
      alert("Erreur lors de la création"); 
    } finally { 
      setLoading(false); 
    }
  };

  if (!transactionId) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <FileSearch className="text-blue-500" size={40} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune transaction sélectionnée</h3>
        <p className="text-gray-500 max-w-sm mb-8">
          Sélectionnez une transaction dans votre tableau de bord pour pouvoir émettre, valider ou consulter les contrats associés.
        </p>
        <button 
          onClick={() => window.location.href = '/dashboard/gestion_owner/transactions'} 
          className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
        >
          Voir mes transactions
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <h2 className="text-xl font-bold mb-6">Émettre un nouveau contrat</h2>
      
      {/* Informations de contexte */}
      {transactionData && (
        <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-sm text-blue-900"><strong>Client :</strong> {transactionData.client?.name || "N/A"}</p>
          <p className="text-sm text-blue-900"><strong>Bien :</strong> {transactionData.property?.title || "N/A"}</p>
        </div>
      )}

      <input className="w-full p-3 mb-4 rounded-xl border" placeholder="Titre" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
      
      <select className="w-full p-3 mb-4 rounded-xl border" value={formData.contract_type} onChange={e => setFormData({...formData, contract_type: e.target.value})}>
        <option value="sale_contract">Vente</option>
        <option value="lease_contract">Bail</option>
        <option value="rent_contract">Location</option>
      </select>

      <textarea className="w-full p-3 mb-4 rounded-xl border h-32" placeholder="Contenu..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
      
      <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors">
        {loading ? "En cours..." : "Émettre le contrat"}
      </button>
    </form>
  );
}