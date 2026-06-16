'use client';
import { useState, useEffect } from 'react';
import { api, endpoints } from '@/lib/api';
import { X, Loader2, Plus, ArrowLeftRight } from 'lucide-react';
import { ClientSearchSelect } from './ClientSearchSelect';

interface Props { onClose: () => void; onCreated: () => void; }

export function TransactionModal({ onClose, onCreated }: Props) {
  const [properties, setProperties] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [clientError, setClientError] = useState('');

 const [form, setForm] = useState({
  property: '',
  transaction_type: 'sale',
  amount: '',
  commission_rate: '5',
  notes: '',
});

  useEffect(() => {
    api.get(endpoints.properties)
      .then(r => setProperties(Array.isArray(r.data) ? r.data : r.data.results ?? []))
      .catch(console.error)
      .finally(() => setLoadingData(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setClientError('');
  
  if (!selectedClient) {
    setClientError('Veuillez sélectionner un client.');
    return;
  }
    if (!form.property || !form.amount) { setError('Veuillez remplir tous les champs obligatoires.'); return; }

    setSubmitting(true); setError('');
    try {
      await api.post(endpoints.transactions, {
        client: selectedClient,
        property: form.property,
        transaction_type: form.transaction_type,
        amount: form.amount,
        commission_rate: form.commission_rate,
        notes: form.notes,
      });
      onCreated();
      onClose();
    } catch (err: any) {
      const detail = err.response?.data;
      if (typeof detail === 'object') {
        const msgs = Object.entries(detail).map(([k, v]) => `${k}: ${v}`).join(' | ');
        setError(msgs);
      } else {
        setError(detail || 'Erreur lors de la création.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const propertyId = e.target.value;
  const selected = properties.find(p => p.id === Number(propertyId));
  setForm(f => ({
    ...f,
    property: propertyId,
    amount: selected ? (selected.price || selected.rent_price || '') : '',
  }));
};

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <ArrowLeftRight size={17} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Nouvelle Transaction</h2>
              <p className="text-xs text-gray-400">Initier une transaction entre client et bien</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
            <X size={15} />
          </button>
        </div>

        <div className="p-5">
          {loadingData ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin text-blue-500" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Client — recherche intelligente */}
              {/* <ClientSearchSelect
                value={selectedClient}
                onChange={(id) => {
                  console.log('Client sélectionné ID:', id); // ← debug
                  setSelectedClient(id);
                }}
                error={clientError}
              /> */}

              <ClientSearchSelect
  value={selectedClient}
  onChange={(id) => {
    console.log('TransactionModal received id:', id);
    setSelectedClient(id);
  }}
  error={clientError}
/>

              {/* Bien immobilier */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Bien immobilier <span className="text-red-500">*</span>
                </label>
                <select
  value={form.property}
  onChange={handlePropertyChange}  // ← remplace l'ancien onChange
  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
>
  <option value="">Sélectionner un bien...</option>
  {properties.map(p => (
    <option key={p.id} value={p.id}>
      {p.title} — {p.city}
    </option>
  ))}
</select>
              </div>

              {/* Type et commission */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.transaction_type}
                    onChange={e => setForm(f => ({ ...f, transaction_type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="sale">Vente</option>
                    <option value="rent">Location</option>
                    <option value="purchase">Achat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Commission (%)</label>
                  <input
                    type="number" min="0" max="100" step="0.5"
                    value={form.commission_rate}
                    onChange={e => setForm(f => ({ ...f, commission_rate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Montant */}
              <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Montant (FCFA) <span className="text-red-500">*</span>
            </label>
            <input
              type="number" min="0"
              value={form.amount}
              readOnly  // ← grisé
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            {form.amount && form.commission_rate && (
              <p className="text-xs text-gray-400 mt-1">
                Commission estimée : <span className="font-semibold text-blue-600">
                  {(Number(form.amount) * Number(form.commission_rate) / 100).toLocaleString()} FCFA
                </span>
              </p>
            )}
          </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes internes</label>
                <textarea
                  rows={2} placeholder="Remarques ou conditions particulières..."
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-xs text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button" onClick={onClose}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl text-sm font-bold hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Créer la transaction
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}