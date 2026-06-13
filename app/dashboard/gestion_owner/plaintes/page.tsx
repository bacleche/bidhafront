'use client';
import { useEffect, useState } from 'react';
import { api, endpoints } from '@/lib/api';
import { AlertTriangle, CheckCircle, Clock, XCircle, MessageSquare, X, Loader2 } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  open:        { label: 'Ouverte',        color: 'bg-red-100 text-red-600' },
  in_progress: { label: 'En traitement',  color: 'bg-amber-100 text-amber-700' },
  resolved:    { label: 'Résolue',        color: 'bg-emerald-100 text-emerald-700' },
  closed:      { label: 'Clôturée',       color: 'bg-gray-100 text-gray-500' },
};

const CATEGORY_LABELS: Record<string, string> = {
  service: 'Qualité de service', agent: 'Comportement agent',
  property: 'Information bien erronée', transaction: 'Problème transaction', other: 'Autre',
};

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [active, setActive] = useState<any | null>(null);
  const [form, setForm] = useState({ owner_response: '', status: 'in_progress' });
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = () => {
    setLoading(true);
    api.get(endpoints.complaints)
      .then(r => setComplaints(r.data.results || r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchComplaints(); }, []);

  const openComplaint = (c: any) => {
    setActive(c);
    setForm({ owner_response: c.owner_response || '', status: c.status === 'open' ? 'in_progress' : c.status });
  };

  const handleRespond = async () => {
    if (!active) return;
    setSubmitting(true);
    try {
      await api.patch(`${endpoints.complaints}${active.id}/respond/`, form);
      setActive(null);
      fetchComplaints();
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const filtered = filter ? complaints.filter(c => c.status === filter) : complaints;
  const openCount = complaints.filter(c => c.status === 'open').length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl text-gray-900">Plaintes clients</h1>
          <p className="text-sm text-gray-500 mt-1">
            {openCount > 0
              ? <span className="text-red-500 font-semibold">{openCount} plainte{openCount > 1 ? 's' : ''} ouverte{openCount > 1 ? 's' : ''} à traiter</span>
              : `${complaints.length} plainte(s) au total`
            }
          </p>
        </div>
      </div>

      {/* Filtres statut */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${!filter ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Toutes ({complaints.length})
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, { label, color }]) => {
          const count = complaints.filter(c => c.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilter(filter === key ? '' : key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === key ? 'ring-2 ring-offset-1 ring-blue-400 ' + color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <AlertTriangle size={40} className="mx-auto mb-3 opacity-20" />
          <p>Aucune plainte {filter ? 'dans cette catégorie' : ''}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => {
            const sc = STATUS_CONFIG[c.status];
            return (
              <div
                key={c.id}
                onClick={() => openComplaint(c)}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sc.color.split(' ')[0]}`}>
                  <AlertTriangle size={17} className={sc.color.split(' ')[1]} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{c.subject}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {c.client_name} · {CATEGORY_LABELS[c.category]}
                        {c.property_title && ` · ${c.property_title}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{c.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.color}`}>{sc.label}</span>
                      <p className="text-xs text-gray-400 mt-1">{new Date(c.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  {c.owner_response && (
                    <div className="mt-2 bg-emerald-50 rounded-lg px-3 py-2 text-xs text-emerald-700 flex items-start gap-1.5">
                      <MessageSquare size={11} className="shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{c.owner_response}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal traitement plainte */}
      {active && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b shrink-0">
              <div>
                <h2 className="font-bold text-gray-900">Traiter la plainte</h2>
                <p className="text-xs text-gray-400 mt-0.5">#{active.id} · {active.client_name}</p>
              </div>
              <button onClick={() => setActive(null)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
                <X size={15} />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4">
              {/* Détail plainte */}
              <div className="bg-red-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-700 uppercase tracking-wide">{CATEGORY_LABELS[active.category]}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CONFIG[active.status]?.color}`}>
                    {STATUS_CONFIG[active.status]?.label}
                  </span>
                </div>
                <p className="font-semibold text-sm text-gray-900">{active.subject}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{active.description}</p>
                {active.property_title && (
                  <p className="text-xs text-gray-400">Bien concerné : {active.property_title}</p>
                )}
                <p className="text-xs text-gray-400">{new Date(active.created_at).toLocaleString('fr-FR')}</p>
              </div>

              {/* Réponse */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Votre réponse au client</label>
                <textarea
                  rows={4}
                  placeholder="Rédigez votre réponse officielle..."
                  value={form.owner_response}
                  onChange={e => setForm(f => ({ ...f, owner_response: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Nouveau statut */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mettre à jour le statut</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'in_progress', label: 'En traitement' },
                    { value: 'resolved', label: 'Résolue' },
                    { value: 'closed', label: 'Clôturée' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setForm(f => ({ ...f, status: value }))}
                      className={`py-2.5 rounded-xl text-sm font-semibold transition-all border-2 ${
                        form.status === value
                          ? 'border-blue-400 bg-blue-50 text-blue-700'
                          : 'border-gray-100 text-gray-500 hover:border-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t shrink-0">
              <button onClick={() => setActive(null)} className="flex-1 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl font-semibold">
                Annuler
              </button>
              <button
                onClick={handleRespond}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}