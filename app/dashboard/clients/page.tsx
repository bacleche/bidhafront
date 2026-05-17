'use client';
import { useEffect, useState } from 'react';
import { api, endpoints } from '@/lib/api';
import { Client } from '@/types';
import { Plus, Search, User, Phone, Mail, Building2, Trash2, Edit2 } from 'lucide-react';

export default function DashboardClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ first_name:'', last_name:'', email:'', phone:'', client_type:'individual', company_name:'', address:'', agency:1 });
  const [saving, setSaving] = useState(false);

  const fetch = (q='') => {
    setLoading(true);
    api.get(`${endpoints.clients}${q?`?search=${q}`:''}`)
      .then(r=>{setClients(r.data.results||[]);setTotal(r.data.count||0);})
      .finally(()=>setLoading(false));
  };

  useEffect(()=>{ fetch(); },[]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await api.post(endpoints.clients, form); setShowForm(false); fetch(); setForm({first_name:'',last_name:'',email:'',phone:'',client_type:'individual',company_name:'',address:'',agency:1}); }
    catch(err){ console.error(err); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce client ?')) return;
    await api.delete(`${endpoints.clients}${id}/`); fetch(search);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Gestion des clients</h1>
          <p className="text-gray-500 text-sm">{total} client{total!==1?'s':''}</p>
        </div>
        <button onClick={()=>setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all">
          <Plus size={16}/> Nouveau client
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-fade-up">
            <h2 className="font-display font-bold text-xl text-gray-900 mb-5">Nouveau client</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Prénom</label><input required value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"/></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Nom</label><input required value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"/></div>
              </div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"/></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Téléphone</label><input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"/></div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Type de client</label>
                <select value={form.client_type} onChange={e=>setForm({...form,client_type:e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 transition-all">
                  <option value="individual">Particulier</option>
                  <option value="company">Entreprise</option>
                </select>
              </div>
              {form.client_type==='company' && <div><label className="block text-xs font-semibold text-gray-600 mb-1">Nom de l'entreprise</label><input value={form.company_name} onChange={e=>setForm({...form,company_name:e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 transition-all"/></div>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-all">Annuler</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-60">{saving?'Enregistrement...':'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bidhaa-card p-3 mb-5 flex items-center gap-3">
        <Search size={16} className="text-gray-400 ml-2 shrink-0"/>
        <input value={search} onChange={e=>{setSearch(e.target.value);fetch(e.target.value);}} placeholder="Rechercher par nom, email, téléphone..." className="flex-1 text-sm text-gray-700 outline-none placeholder-gray-400"/>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? [...Array(6)].map((_,i)=><div key={i} className="bidhaa-card h-36 animate-pulse bg-blue-50"></div>)
        : clients.map(c=>(
          <div key={c.id} className="bidhaa-card p-5 group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  {c.client_type==='company' ? <Building2 size={18} className="text-blue-600"/> : <User size={18} className="text-blue-600"/>}
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">{c.first_name} {c.last_name}</p>
                  <span className="badge text-xs bg-blue-50 text-blue-600">{c.client_type==='company'?'Entreprise':'Particulier'}</span>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-amber-100 hover:text-amber-600 transition-all"><Edit2 size={12}/></button>
                <button onClick={()=>handleDelete(c.id)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-all"><Trash2 size={12}/></button>
              </div>
            </div>
            <div className="space-y-1.5">
              {c.phone && <div className="flex items-center gap-2 text-xs text-gray-500"><Phone size={11} className="text-blue-400"/>{c.phone}</div>}
              {c.email && <div className="flex items-center gap-2 text-xs text-gray-500"><Mail size={11} className="text-blue-400"/>{c.email}</div>}
            </div>
            <p className="text-xs text-gray-400 mt-3">Ajouté le {new Date(c.created_at).toLocaleDateString('fr-FR')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
