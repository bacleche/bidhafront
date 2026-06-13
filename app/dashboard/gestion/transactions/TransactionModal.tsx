'use client';
import { useState } from 'react';
import { api, endpoints } from '@/lib/api';

export function TransactionModal({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) {
  const [formData, setFormData] = useState({ client_name: '', type: 'sale', amount: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(endpoints.transactions, formData);
      onCreated(); // Rafraîchit la liste
      onClose();
    } catch (err) { alert("Erreur lors de la création"); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-xl font-bold mb-6">Nouvelle Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full p-3 rounded-xl border" placeholder="Nom du client" required onChange={e => setFormData({...formData, client_name: e.target.value})} />
          <select className="w-full p-3 rounded-xl border" onChange={e => setFormData({...formData, type: e.target.value})}>
            <option value="sale">Vente</option>
            <option value="lease">Bail</option>
            <option value="rent">Location</option>
          </select>
          <input className="w-full p-3 rounded-xl border" placeholder="Montant (€)" type="number" required onChange={e => setFormData({...formData, amount: e.target.value})} />
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 py-3 border rounded-xl font-bold text-gray-600">Annuler</button>
            <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Créer</button>
          </div>
        </form>
      </div>
    </div>
  );
}