'use client';
import { useState, useEffect } from 'react';
import { api, endpoints } from '@/lib/api';
import { FileText, Eye, Search } from 'lucide-react';

export default function ContractsList() {
  const [contracts, setContracts] = useState<any[]>([]);
  
  const [selectedContract, setSelectedContract] = useState<any | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get(endpoints.contracts).then(res => {
      // 1. Log pour voir exactement ce que l'API renvoie
      console.log("Données reçues de l'API :", res.data);

      // 2. Si c'est un objet paginé (ex: { results: [...] }), on pointe vers .results
      // Sinon, on prend res.data directement, et si ce n'est pas un tableau, on force []
      const data = res.data.results || (Array.isArray(res.data) ? res.data : []);
      
      setContracts(data);
    });
  }, []);
  const filteredContracts = filter === 'all' 
    ? contracts 
    : contracts.filter(c => c.contract_type === filter);

  return (
    <div className="flex gap-6 p-6 h-[calc(100vh-64px)]">
      {/* Liste des contrats */}
      <div className="w-1/3 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b">
          <h2 className="font-bold text-lg mb-4">Tous les contrats</h2>
          <select 
            className="w-full p-2 border rounded-xl text-sm"
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tous les types</option>
            <option value="sale_contract">Vente</option>
            <option value="lease_contract">Bail</option>
            <option value="purchase_contract">Achat</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto">
  {Array.isArray(filteredContracts) && filteredContracts.length > 0 ? (
    filteredContracts.map((c) => (
      <div 
        key={c.id} 
        onClick={() => setSelectedContract(c)}
        className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedContract?.id === c.id ? 'bg-blue-50' : ''}`}
      >
        <div className="flex justify-between items-start">
          <p className="font-bold text-sm">{c.title}</p>
          <span className="text-[10px] bg-gray-100 px-2 py-1 rounded">{c.contract_type}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Ref: {c.contract_number}</p>
      </div>
    ))
  ) : (
    <div className="p-4 text-center text-gray-400 text-sm">
      Aucun contrat trouvé.
    </div>
  )}
</div>
      </div>

      {/* Visualisation du contrat */}
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 overflow-y-auto">
        {selectedContract ? (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold">{selectedContract.title}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                selectedContract.status === 'signed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {selectedContract.status.toUpperCase()}
              </span>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl text-sm leading-relaxed text-gray-700 whitespace-pre-line">
              {selectedContract.content}
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
              <p>Type : {selectedContract.contract_type}</p>
              <p>Date : {selectedContract.created_at}</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <FileText size={48} className="mb-4 opacity-20" />
            <p>Sélectionnez un contrat pour le visualiser</p>
          </div>
        )}
      </div>
    </div>
  );
}