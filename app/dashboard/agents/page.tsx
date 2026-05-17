'use client';
import { useEffect, useState } from 'react';
import { api, endpoints } from '@/lib/api';
import { Agent } from '@/types';
import { Plus, Users, Phone, Mail, Edit2, Trash2, Building2, Star } from 'lucide-react';

export default function DashboardAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    api.get(endpoints.agents).then(r=>setAgents(r.data.results||[])).finally(()=>setLoading(false));
  };

  useEffect(()=>{ fetch(); },[]);

  const handleDelete = async (id: number) => {
    if (!confirm('Désactiver cet agent ?')) return;
    await api.delete(`${endpoints.agents}${id}/`); fetch();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Gestion des agents</h1>
          <p className="text-gray-500 text-sm">{agents.length} agent{agents.length!==1?'s':''} actif{agents.length!==1?'s':''}</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all">
          <Plus size={16}/> Inviter un agent
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_,i)=><div key={i} className="bidhaa-card h-48 animate-pulse bg-blue-50"></div>)}
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-24"><Users size={40} className="text-gray-200 mx-auto mb-3"/><p className="text-gray-400 font-medium">Aucun agent</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map(agent=>(
            <div key={agent.id} className="bidhaa-card p-6 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {agent.user.first_name?.[0]}{agent.user.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{agent.user.first_name} {agent.user.last_name}</p>
                    <p className="text-xs text-gray-500">{agent.employee_id}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-amber-100 hover:text-amber-600 transition-all"><Edit2 size={12}/></button>
                  <button onClick={()=>handleDelete(agent.id)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-all"><Trash2 size={12}/></button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {agent.user.phone && <div className="flex items-center gap-2 text-xs text-gray-500"><Phone size={11} className="text-blue-400"/>{agent.user.phone}</div>}
                <div className="flex items-center gap-2 text-xs text-gray-500"><Mail size={11} className="text-blue-400"/>{agent.user.email}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500"><Building2 size={11} className="text-blue-400"/>{agent.agency_name}</div>
              </div>

              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Spécialisation</p>
                  <p className="text-xs font-semibold text-gray-700 line-clamp-1">{agent.specialization || 'Non renseigné'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Commission</p>
                  <div className="flex items-center gap-1"><Star size={11} className="text-amber-400"/><span className="text-sm font-bold text-gray-900">{agent.commission_rate}%</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
