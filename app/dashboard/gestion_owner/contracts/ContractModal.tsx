'use client';
import { useState } from 'react';
import { X, Loader2, FileText, Plus } from 'lucide-react';
import { api, endpoints } from '@/lib/api';

interface Props {
  transaction: any;
  onClose: () => void;
  onCreated: () => void;
}

export function ContractModal({ transaction, onClose, onCreated }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    contract_type: 'sale_contract',
    title: `Contrat — ${transaction.property_title || ''}`,
    content: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.start_date) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setSubmitting(true); setError('');
    try {
      await api.post(endpoints.contracts, {
        transaction: transaction.id,
        contract_type: form.contract_type,
        title: form.title,
        content: form.content,
        start_date: form.start_date,
        end_date: form.end_date || null,
      });
      onCreated();
      onClose();
    } catch (err: any) {
      const detail = err.response?.data;
      if (typeof detail === 'object') {
        setError(Object.entries(detail).map(([k, v]) => `${k}: ${v}`).join(' | '));
      } else {
        setError(detail || 'Erreur lors de la création.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
              <FileText size={17} className="text-green-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Nouveau Contrat</h2>
              <p className="text-xs text-gray-400">
                Transaction #{transaction.transaction_number}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
            <X size={15} />
          </button>
        </div>

        <div className="p-5">
          {/* Résumé transaction */}
          <div className="bg-gray-50 rounded-xl p-3 mb-5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <FileText size={14} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-700 truncate">
                {transaction.property_title}
              </p>
              <p className="text-xs text-gray-400">
                {transaction.client_name} · {Number(transaction.amount).toLocaleString()} FCFA
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type de contrat */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Type de contrat <span className="text-red-500">*</span>
              </label>
              <select
                value={form.contract_type}
                onChange={e => setForm(f => ({ ...f, contract_type: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="sale_contract">Contrat de Vente</option>
                <option value="lease_contract">Contrat de Bail</option>
                <option value="purchase_contract">Contrat d'Achat</option>
                <option value="preliminary">Avant-Contrat</option>
                <option value="mandate">Mandat</option>
              </select>
            </div>

            {/* Titre */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Date de début <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Contenu */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Contenu / Clauses
              </label>
              <textarea
                rows={4}
                placeholder="Conditions, clauses particulières..."
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
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
                className="flex-1 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl text-sm font-bold hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Créer le contrat
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}