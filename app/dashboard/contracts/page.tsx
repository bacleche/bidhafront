'use client';
import { useEffect, useState } from 'react';
import { api, endpoints } from '@/lib/api';
import { Contract } from '@/types';
import { FileText, Plus, CheckCircle, Clock, XCircle, FileX, PenTool, X, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

const TYPE_LABELS: Record<string,string> = { sale_contract:'Contrat de Vente', lease_contract:'Contrat de Bail', purchase_contract:'Contrat d\'Achat', preliminary:'Avant-Contrat', mandate:'Mandat' };
const STATUS_CONFIG: Record<string,{label:string;color:string;icon:any}> = {
  draft: { label:'Brouillon', color:'bg-gray-100 text-gray-600', icon:FileText },
  sent: { label:'Envoyé', color:'bg-blue-100 text-blue-700', icon:Clock },
  signed: { label:'Signé', color:'bg-emerald-100 text-emerald-700', icon:CheckCircle },
  expired: { label:'Expiré', color:'bg-amber-100 text-amber-700', icon:FileX },
  cancelled: { label:'Annulé', color:'bg-red-100 text-red-600', icon:XCircle },
};

const EMPTY_FORM = {
  title: '',
  contract_type: 'sale_contract',
  status: 'draft',
  contract_number: '',
  content: '',
  start_date: '',
  end_date: '',
  transaction: '',
};

export default function DashboardContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchContracts = () => {
    setLoading(true);
    api.get(endpoints.contracts)
      .then(r => setContracts(r.data.results || r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchContracts();
    // Charger les transactions disponibles pour les lier au contrat
    api.get(endpoints.transactions)
      .then(r => setTransactions(r.data.results || r.data))
      .catch(console.error);
  }, []);

  const openModal = () => {
    setForm({
      ...EMPTY_FORM,
      contract_number: `CTR-${Math.floor(10000 + Math.random() * 90000)}`,
      start_date: new Date().toISOString().split('T')[0],
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.transaction || !form.start_date) {
      setError('Titre, transaction liée et date de début sont obligatoires.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.post(endpoints.contracts, {
        ...form,
        transaction: Number(form.transaction),
      });
      setShowModal(false);
      fetchContracts();
    } catch (e: any) {
      const msg = e.response?.data;
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filter ? contracts.filter(c => c.status === filter || c.contract_type === filter) : contracts;

  return (
     <div className="min-h-screen bg-gray-50">
          <Navbar />
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Contrats</h1>
          <p className="text-gray-500 text-sm">{contracts.length} contrat{contracts.length !== 1 ? 's' : ''}</p>
        </div>
        {/* <button
          onClick={openModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all"
        >
          <Plus size={16} /> Nouveau contrat
        </button> */}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {Object.entries(STATUS_CONFIG).map(([key, { label, color, icon: Icon }]) => {
          const count = contracts.filter(c => c.status === key).length;
          return (
            <button key={key} onClick={() => setFilter(filter === key ? '' : key)} className={`bidhaa-card p-4 text-center transition-all ${filter === key ? 'border-blue-400 bg-blue-50' : ''}`}>
              <Icon size={20} className={`mx-auto mb-1.5 ${color.split(' ')[1]}`} />
              <p className="font-display font-bold text-xl text-gray-900">{count}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </button>
          );
        })}
      </div>

      {/* Contract list */}
      <div className="space-y-3">
        {loading ? [...Array(3)].map((_, i) => <div key={i} className="bidhaa-card h-24 animate-pulse bg-blue-50"></div>)
          : filtered.length === 0 ? (
            <div className="text-center py-20"><FileText size={36} className="text-gray-200 mx-auto mb-3" /><p className="text-gray-400">Aucun contrat</p></div>
          ) : filtered.map(c => {
            const sc = STATUS_CONFIG[c.status];
            return (
              <div key={c.id} className="bidhaa-card p-5 flex items-center gap-4 hover:border-blue-200 transition-all cursor-pointer">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${sc?.color?.split(' ')[0]}`}>
                  <sc.icon size={20} className={sc?.color?.split(' ')[1]} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-sm text-gray-900">{c.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge bg-blue-50 text-blue-600 text-xs">{TYPE_LABELS[c.contract_type]}</span>
                        <span className="text-xs text-gray-400 font-mono">{c.contract_number}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`badge text-xs ${sc?.color}`}>{sc?.label}</span>
                      <p className="text-xs text-gray-400 mt-1">{new Date(c.start_date).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                </div>
                <button className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-all shrink-0">
                  <PenTool size={15} />
                </button>
              </div>
            );
          })}
      </div>

      {/* Modal création contrat */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b shrink-0">
              <div>
                <h2 className="font-bold text-lg text-gray-900">Nouveau contrat</h2>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{form.contract_number}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-5 space-y-4">

              {/* Transaction liée — champ clé */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Transaction liée <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.transaction}
                  onChange={e => setForm(f => ({ ...f, transaction: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">— Sélectionner une transaction —</option>
                  {transactions.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.transaction_number} — {t.client?.first_name} {t.client?.last_name} · {parseFloat(t.amount).toLocaleString()} FCFA
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Le client est automatiquement déterminé par la transaction.</p>
              </div>

              {/* Titre */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Titre du contrat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex : Contrat de vente - Villa Les Flamboyants"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Type + Statut */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type de contrat</label>
                  <select
                    value={form.contract_type}
                    onChange={e => setForm(f => ({ ...f, contract_type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Statut initial</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
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
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date de fin <span className="text-gray-400">(optionnel)</span></label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Contenu */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Contenu / Clauses</label>
                <textarea
                  rows={5}
                  placeholder="Rédigez les clauses et conditions du contrat..."
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-50"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Enregistrer le contrat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>

  );
}