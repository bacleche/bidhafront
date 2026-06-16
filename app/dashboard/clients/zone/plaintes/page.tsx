'use client';
import { useState, useEffect } from 'react';
import { AlertTriangle, Home, Clock, CheckCircle, Search, Filter } from 'lucide-react';
import { api, endpoints } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';

const COMPLAINT_STATUS = {
  open: { label: 'Ouverte', color: 'bg-red-100 text-red-700 border-red-200' },
  in_progress: { label: 'En traitement', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  resolved: { label: 'Résolue', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  closed: { label: 'Clôturée', color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

export default function ComplaintManager() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(endpoints.complaints)
      .then(res => setComplaints(res.data.results || res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
     <div className="min-h-screen bg-gray-50">
           <Navbar />   
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
     
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des plaintes</h1>
        <p className="text-gray-500 text-sm">Suivez l'état de vos signalements et les réponses de l'agence.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-40 bg-white rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {complaints.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
              <AlertTriangle className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="font-bold text-gray-900">Aucune plainte</h3>
              <p className="text-gray-500 text-sm">Vous n'avez aucun litige en cours.</p>
            </div>
          ) : (
            complaints.map((c) => {
              const status = COMPLAINT_STATUS[c.status as keyof typeof COMPLAINT_STATUS] || COMPLAINT_STATUS.open;
              
              return (
                <div key={c.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  {/* Ligne du haut : Statut et Date */}
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${status.color}`}>
                      {status.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(c.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Corps : Sujet et Description */}
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">{c.subject}</h2>
                    <div className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold mb-3">
                      <Home size={14} /> {c.property_title}
                    </div>
                    <p className="text-gray-600 text-sm bg-gray-50 p-4 rounded-2xl leading-relaxed">
                      {c.description}
                    </p>
                  </div>

                  {/* Section Réponse Agence */}
                  <div className="pt-4 border-t border-gray-100">
                    {c.owner_response ? (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <CheckCircle size={16} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-800 mb-0.5">Réponse de l'agence</p>
                          <p className="text-sm text-gray-700 italic">"{c.owner_response}"</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                        <Clock size={16} />
                        <p className="text-xs font-medium">En attente d'une réponse de notre équipe.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
      </div>
  );
}