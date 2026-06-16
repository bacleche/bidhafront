'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api, endpoints } from '@/lib/api';
import { UserPlus, X, Loader2, Edit2, Trash2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

type Agent = {
  id: number;
  user: { first_name: string; last_name: string; email: string; phone: string };
  employee_id: string;
  specialization: string;
  commission_rate: string;
};

const EMPTY_FORM = {
  first_name: '', last_name: '', username: '', email: '',
  phone: '', password: '', specialization: '', commission_rate: '5.00',
};

export default function AgentsPage() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAgents = async () => {
    try {
      const { data } = await api.get(endpoints.agents);
      setAgents(data.results ?? data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchAgents(); }, []);

  const handleSubmit = async () => {
    setLoading(true); setError('');
    
    // Création propre de l'objet d'envoi sans modifier le state 'form'
    let payload = { ...form };
    if (editingAgent && !payload.password) {
      const { password, ...rest } = payload;
      payload = rest as any;
    }

    try {
      if (editingAgent) {
        await api.patch(`${endpoints.agents}${editingAgent.id}/`, payload);
      } else {
        await api.post(endpoints.agents, payload);
      }
      setShowForm(false);
      setEditingAgent(null);
      setForm(EMPTY_FORM);
      fetchAgents();
    } catch (e: any) {
      setError("Erreur : vérifiez vos informations (email déjà utilisé ?)");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet agent ?")) return;
    try {
      await api.delete(`${endpoints.agents}${id}/`);
      fetchAgents();
    } catch (e) { alert("Erreur lors de la suppression"); }
  };

  const openEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setForm({
      first_name: agent.user.first_name,
      last_name: agent.user.last_name,
      username: agent.user.email,
      email: agent.user.email,
      phone: agent.user.phone,
      password: '', 
      specialization: agent.specialization,
      commission_rate: agent.commission_rate,
    });
    setShowForm(true);
  };

  const isOwner = user?.role === 'agency_owner';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Agents</h1>
            <p className="text-sm text-gray-500 mt-1">{agents.length} agent(s) actif(s)</p>
          </div>
          {isOwner && (
            <button onClick={() => { setEditingAgent(null); setForm(EMPTY_FORM); setShowForm(true); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700">
              <UserPlus size={16} /> Nouvel agent
            </button>
          )}
        </div>

        <div className="grid gap-3">
          {agents.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                {a.user.first_name?.[0]}{a.user.last_name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{a.user.first_name} {a.user.last_name}</p>
                <p className="text-xs text-gray-500">{a.user.email} · {a.employee_id}</p>
              </div>
              {isOwner && (
                <div className="flex gap-2">
                  <button onClick={() => openEdit(a)} className="p-2 text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(a.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              )}
            </div>
          ))}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="font-bold text-lg">{editingAgent ? "Modifier l'agent" : "Créer un agent"}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400"><X size={20} /></button>
              </div>
              <div className="p-5 grid grid-cols-2 gap-3">
                {[ 
                  { key: 'first_name', label: 'Prénom' }, { key: 'last_name', label: 'Nom' }, 
                  { key: 'email', label: 'Email' }, { key: 'phone', label: 'Téléphone' },
                  { key: 'password', label: editingAgent ? 'Nouveau mot de passe' : 'Mot de passe', type: 'password' }, 
                  { key: 'specialization', label: 'Spécialisation' }, 
                  { key: 'commission_rate', label: 'Commission (%)', type: 'number' } 
                ].map(({ key, label, type = 'text' }) => (
                  <div key={key} className={key === 'specialization' ? 'col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                    <input 
                      type={type} 
                      value={(form as any)[key]} 
                      onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))} 
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" 
                      placeholder={editingAgent && key === 'password' ? 'Laissez vide pour conserver' : ''}
                    />
                  </div>
                ))}
              </div>
              {error && <p className="px-5 pb-2 text-red-500 text-xs">{error}</p>}
              <div className="p-5 pt-0 flex justify-end gap-3">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Annuler</button>
                <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700">
                  {loading ? <Loader2 size={14} className="animate-spin" /> : editingAgent ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}