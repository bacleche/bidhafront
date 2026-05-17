'use client';
import { useEffect, useState } from 'react';
import { api, endpoints } from '@/lib/api';
import { Contract } from '@/types';
import { FileText, Plus, CheckCircle, Clock, XCircle, FileX, PenTool } from 'lucide-react';

const TYPE_LABELS: Record<string,string> = { sale_contract:'Contrat de Vente', lease_contract:'Contrat de Bail', purchase_contract:'Contrat d\'Achat', preliminary:'Avant-Contrat', mandate:'Mandat' };
const STATUS_CONFIG: Record<string,{label:string;color:string;icon:any}> = {
  draft: { label:'Brouillon', color:'bg-gray-100 text-gray-600', icon:FileText },
  sent: { label:'Envoyé', color:'bg-blue-100 text-blue-700', icon:Clock },
  signed: { label:'Signé', color:'bg-emerald-100 text-emerald-700', icon:CheckCircle },
  expired: { label:'Expiré', color:'bg-amber-100 text-amber-700', icon:FileX },
  cancelled: { label:'Annulé', color:'bg-red-100 text-red-600', icon:XCircle },
};

export default function DashboardContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(()=>{
    api.get(endpoints.contracts).then(r=>setContracts(r.data.results||[])).finally(()=>setLoading(false));
  },[]);

  const filtered = filter ? contracts.filter(c=>c.status===filter||c.contract_type===filter) : contracts;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Contrats</h1>
          <p className="text-gray-500 text-sm">{contracts.length} contrat{contracts.length!==1?'s':''}</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all">
          <Plus size={16}/> Nouveau contrat
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {Object.entries(STATUS_CONFIG).map(([key,{label,color,icon:Icon}])=>{
          const count = contracts.filter(c=>c.status===key).length;
          return (
            <button key={key} onClick={()=>setFilter(filter===key?'':key)} className={`bidhaa-card p-4 text-center transition-all ${filter===key?'border-blue-400 bg-blue-50':''}`}>
              <Icon size={20} className={`mx-auto mb-1.5 ${color.split(' ')[1]}`}/>
              <p className="font-display font-bold text-xl text-gray-900">{count}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </button>
          );
        })}
      </div>

      {/* Contract list */}
      <div className="space-y-3">
        {loading ? [...Array(3)].map((_,i)=><div key={i} className="bidhaa-card h-24 animate-pulse bg-blue-50"></div>)
        : filtered.length===0 ? (
          <div className="text-center py-20"><FileText size={36} className="text-gray-200 mx-auto mb-3"/><p className="text-gray-400">Aucun contrat</p></div>
        ) : filtered.map(c=>{
          const sc = STATUS_CONFIG[c.status];
          return (
            <div key={c.id} className="bidhaa-card p-5 flex items-center gap-4 hover:border-blue-200 transition-all cursor-pointer">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${sc?.color?.split(' ')[0]}`}>
                <sc.icon size={20} className={sc?.color?.split(' ')[1]}/>
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
                <PenTool size={15}/>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
