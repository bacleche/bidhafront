'use client';
import { useEffect, useState } from 'react';
import { api, endpoints } from '@/lib/api';
import { CalendarCheck, Clock, CheckCircle, XCircle, RefreshCw, Loader2 } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:     { label: 'En attente',    color: 'bg-amber-100 text-amber-700' },
  accepted:    { label: 'Acceptée',      color: 'bg-emerald-100 text-emerald-700' },
  rescheduled: { label: 'Reprogrammée', color: 'bg-blue-100 text-blue-700' },
  rejected:    { label: 'Rejetée',       color: 'bg-red-100 text-red-600' },
  done:        { label: 'Effectuée',     color: 'bg-gray-100 text-gray-600' },
};

export default function VisitsPage() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<number | null>(null);
  const [activeVisit, setActiveVisit] = useState<any | null>(null);
  const [responseForm, setResponseForm] = useState({ status: 'accepted', agent_notes: '', rescheduled_date: '' });

  const fetchVisits = () => {
    setLoading(true);
    api.get(endpoints.visitRequests)
      .then(r => setVisits(r.data.results || r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVisits(); }, []);

  const openResponse = (visit: any) => {
    setActiveVisit(visit);
    setResponseForm({ status: 'accepted', agent_notes: '', rescheduled_date: '' });
  };

  const handleRespond = async () => {
    if (!activeVisit) return;
    setResponding(activeVisit.id);
    try {
      await api.patch(`${endpoints.visitRequests}${activeVisit.id}/respond/`, responseForm);
      setActiveVisit(null);
      fetchVisits();
    } catch (e) { console.error(e); }
    finally { setResponding(null); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-bold text-2xl text-gray-900">Demandes de visite</h1>
        <p className="text-sm text-gray-500 mt-1">{visits.length} demande(s)</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-blue-50 rounded-2xl animate-pulse" />)}</div>
      ) : visits.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <CalendarCheck size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucune demande de visite</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map(v => {
            const sc = STATUS_CONFIG[v.status];
            const date = v.rescheduled_date || v.requested_date;
            return (
              <div key={v.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sc.color.split(' ')[0]}`}>
                  <CalendarCheck size={18} className={sc.color.split(' ')[1]} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">{v.property_title}</p>
                  <p className="text-xs text-gray-500">{v.client_name} · {new Date(date).toLocaleString('fr-FR')}</p>
                  {v.notes && <p className="text-xs text-gray-400 mt-0.5 italic">"{v.notes}"</p>}
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${sc.color}`}>{sc.label}</span>
                {v.status === 'pending' && (
                  <button
                    onClick={() => openResponse(v)}
                    className="shrink-0 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Répondre
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal réponse agent */}
      {activeVisit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b">
              <h2 className="font-bold text-gray-900">Répondre à la demande</h2>
              <p className="text-xs text-gray-400 mt-0.5">{activeVisit.client_name} — {activeVisit.property_title}</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Décision</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'accepted', label: 'Accepter', icon: CheckCircle, color: 'emerald' },
                    { value: 'rescheduled', label: 'Reprogrammer', icon: RefreshCw, color: 'blue' },
                    { value: 'rejected', label: 'Rejeter', icon: XCircle, color: 'red' },
                  ].map(({ value, label, icon: Icon, color }) => (
                    <button
                      key={value}
                      onClick={() => setResponseForm(f => ({ ...f, status: value }))}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                        responseForm.status === value
                          ? `border-${color}-400 bg-${color}-50 text-${color}-700`
                          : 'border-gray-100 text-gray-500 hover:border-gray-200'
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {responseForm.status === 'rescheduled' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nouvelle date proposée</label>
                  <input
                    type="datetime-local"
                    value={responseForm.rescheduled_date}
                    onChange={e => setResponseForm(f => ({ ...f, rescheduled_date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Note {responseForm.status === 'rejected' ? '(motif de rejet)' : '(optionnel)'}
                </label>
                <textarea
                  rows={3}
                  placeholder={responseForm.status === 'rejected' ? 'Expliquez le motif...' : 'Message au client...'}
                  value={responseForm.agent_notes}
                  onChange={e => setResponseForm(f => ({ ...f, agent_notes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 pt-0">
              <button onClick={() => setActiveVisit(null)} className="flex-1 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl font-semibold">
                Annuler
              </button>
              <button
                onClick={handleRespond}
                disabled={!!responding}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {responding ? <Loader2 size={14} className="animate-spin" /> : null}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}