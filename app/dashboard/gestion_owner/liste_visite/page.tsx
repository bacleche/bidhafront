'use client';
import { useEffect, useState } from 'react';
import { api, endpoints } from '@/lib/api';
import {
  CalendarCheck, Clock, CheckCircle, XCircle, RefreshCw,
  Search, SlidersHorizontal, MapPin, User, Calendar
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending:     { label: 'En attente',    color: 'bg-amber-100 text-amber-700',    icon: Clock },
  accepted:    { label: 'Acceptée',      color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  rescheduled: { label: 'Reprogrammée', color: 'bg-blue-100 text-blue-700',      icon: RefreshCw },
  rejected:    { label: 'Rejetée',       color: 'bg-red-100 text-red-600',        icon: XCircle },
  done:        { label: 'Effectuée',     color: 'bg-gray-100 text-gray-500',      icon: CheckCircle },
};

export default function OwnerVisitsPage() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [view, setView] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    setLoading(true);
    api.get(endpoints.visitRequests)
      .then(r => setVisits(r.data.results || r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = visits.filter(v => {
    const matchSearch =
      v.property_title?.toLowerCase().includes(search.toLowerCase()) ||
      v.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      v.agent_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? v.status === statusFilter : true;
    const matchDate = dateFilter
      ? new Date(v.requested_date).toISOString().slice(0, 10) === dateFilter
      : true;
    return matchSearch && matchStatus && matchDate;
  });

  // Grouper par date pour la vue liste
  const grouped = filtered.reduce((acc: Record<string, any[]>, v) => {
    const date = new Date(v.rescheduled_date || v.requested_date).toISOString().slice(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(v);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort();

  const statCounts = Object.keys(STATUS_CONFIG).reduce((acc, key) => {
    acc[key] = visits.filter(v => v.status === key).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50">
              <Navbar />
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-bold text-2xl text-gray-900">Planning des visites</h1>
        <p className="text-sm text-gray-500 mt-1">{visits.length} demande(s) sur l'ensemble de vos biens</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, { label, color, icon: Icon }]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
            className={`bg-white rounded-2xl border p-4 text-center transition-all hover:shadow-md ${
              statusFilter === key ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-100'
            }`}
          >
            <Icon size={18} className={`mx-auto mb-1.5 ${color.split(' ')[1]}`} />
            <p className="font-bold text-xl text-gray-900">{statCounts[key] || 0}</p>
            <p className="text-xs text-gray-500 leading-tight">{label}</p>
          </button>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Bien, client, agent..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-600"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-600 font-medium"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        {(search || statusFilter || dateFilter) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter(''); setDateFilter(''); }}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 font-medium"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Liste groupée par date */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <CalendarCheck size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium">Aucune visite trouvée</p>
          {(search || statusFilter || dateFilter) && (
            <p className="text-sm mt-1">Essayez de modifier vos filtres</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => {
            const isToday = date === new Date().toISOString().slice(0, 10);
            const isPast = date < new Date().toISOString().slice(0, 10);
            return (
              <div key={date}>
                {/* Séparateur date */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${
                    isToday ? 'bg-blue-600 text-white' :
                    isPast  ? 'bg-gray-100 text-gray-500' :
                              'bg-emerald-100 text-emerald-700'
                  }`}>
                    <Calendar size={12} />
                    {isToday ? 'Aujourd\'hui' : new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', {
                      weekday: 'long', day: 'numeric', month: 'long'
                    })}
                  </div>
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400">{grouped[date].length} visite(s)</span>
                </div>

                {/* Visites du jour */}
                <div className="space-y-2">
                  {grouped[date].map(v => {
                    const sc = STATUS_CONFIG[v.status];
                    const StatusIcon = sc.icon;
                    const displayDate = v.rescheduled_date || v.requested_date;
                    return (
                      <div key={v.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm hover:border-blue-100 hover:shadow-md transition-all">
                        {/* Heure */}
                        <div className="w-14 text-center shrink-0">
                          <p className="font-bold text-lg text-gray-900 leading-none">
                            {new Date(displayDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {v.rescheduled_date && (
                            <p className="text-xs text-blue-500 font-semibold mt-0.5">Reprog.</p>
                          )}
                        </div>

                        {/* Séparateur vertical */}
                        <div className={`w-1 h-12 rounded-full shrink-0 ${sc.color.split(' ')[0]}`} />

                        {/* Infos */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{v.property_title}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <User size={11} /> {v.client_name}
                            </span>
                            {v.agent_name && (
                              <span className="flex items-center gap-1 text-xs text-blue-500 font-medium">
                                Agent : {v.agent_name}
                              </span>
                            )}
                          </div>
                          {v.notes && (
                            <p className="text-xs text-gray-400 mt-0.5 italic truncate">"{v.notes}"</p>
                          )}
                        </div>

                        {/* Statut */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${sc.color}`}>
                            <StatusIcon size={11} />
                            {sc.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </div>

  );
}