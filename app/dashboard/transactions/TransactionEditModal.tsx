'use client';
import { useState } from 'react';
import { api, endpoints } from '@/lib/api';

export function TransactionEditModal({ transaction, onClose, onUpdated }: any) {
  const [formData, setFormData] = useState({
    client_name: transaction.client_name,
    amount: transaction.amount,
    status: transaction.status,
    transaction_type: transaction.transaction_type
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Patch pour modifier uniquement les champs changés
      await api.patch(`${endpoints.transactions}${transaction.id}/`, formData);
      onUpdated(); // Rafraîchit la liste dans le parent
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-bold mb-6">Modifier : {transaction.transaction_number}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Client</label>
            <input 
              className="w-full p-3 rounded-xl border border-gray-200"
              value={formData.client_name}
              onChange={e => setFormData({...formData, client_name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Type</label>
              <select className="w-full p-3 rounded-xl border border-gray-200" value={formData.transaction_type} onChange={e => setFormData({...formData, transaction_type: e.target.value})}>
                <option value="sale">Vente</option>
                <option value="rent">Location</option>
                <option value="purchase">Achat</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Statut</label>
              <select className="w-full p-3 rounded-xl border border-gray-200" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="pending">En cours</option>
                <option value="completed">Complété</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Montant</label>
            <input 
              type="number"
              className="w-full p-3 rounded-xl border border-gray-200"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border rounded-xl font-bold text-gray-600 hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}