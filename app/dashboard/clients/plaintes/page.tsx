'use client';
import { useEffect, useState } from 'react';
import { api, endpoints } from '@/lib/api';
import { AlertTriangle, Clock, CheckCircle, Loader2, Home } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  open:        { label: 'Ouverte',        color: 'bg-red-100 text-red-600' },
  in_progress: { label: 'En traitement',  color: 'bg-amber-100 text-amber-700' },
  resolved:    { label: 'Résolue',        color: 'bg-emerald-100 text-emerald-700' },
  closed:      { label: 'Clôturée',       color: 'bg-gray-100 text-gray-500' },
};

export default function ClientPlaintesPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(endpoints.complaints)
      .then(r => setComplaints(Array.isArray(r.data) ? r.data : r.data.results ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={28} className="animate-spin text-blue-500" />
    </div>
  );

  return (

    
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl text-gray-900">Mes Plaintes</h2>
      {complaints.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <AlertTriangle size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium text-gray-500">Aucune plainte soumise</p>
          <p className="text-sm mt-1">Signalez un problème depuis la page d&apos;un bien.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c: any) => {
            const sc = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.open;
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className={`px-4 py-2 flex items-center justify-between ${sc.color.split(' ')[0]}`}>
                  <span className={`text-xs font-bold ${sc.color.split(' ')[1]}`}>{sc.label}</span>
                  <span className={`text-xs ${sc.color.split(' ')[1]}`}>
                    {new Date(c.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <p className="font-semibold text-sm text-gray-900">{c.subject}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{c.description}</p>
                  {c.property_title && (
                    <p className="text-xs text-blue-500 flex items-center gap-1">
                      <Home size={10} /> {c.property_title}
                    </p>
                  )}
                  {c.owner_response && (
                    <div className="mt-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                      <p className="text-xs font-bold text-emerald-700 mb-1">Réponse de l&apos;agence</p>
                      <p className="text-xs text-emerald-800 leading-relaxed">{c.owner_response}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
