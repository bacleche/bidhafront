'use client';
import { useState, useEffect } from 'react';
import { api, endpoints } from '@/lib/api';
import {
  FileText, CheckCircle, Clock, XCircle, Download, Pen,
  Loader2, RefreshCw, User, Building2, Calendar
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  draft:        { label: 'Brouillon',            color: 'bg-gray-100 text-gray-600',       icon: FileText },
  sent:         { label: 'Envoyé au client',     color: 'bg-amber-100 text-amber-700',     icon: Clock },
  signed_owner: { label: 'Signé par vous',       color: 'bg-blue-100 text-blue-700',       icon: CheckCircle },
  signed:       { label: 'Signé par les deux',   color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  expired:      { label: 'Expiré',               color: 'bg-red-100 text-red-500',         icon: XCircle },
  cancelled:    { label: 'Annulé',               color: 'bg-red-100 text-red-500',         icon: XCircle },
};

const TYPE_LABEL: Record<string, string> = {
  sale_contract: 'Vente', lease_contract: 'Bail', rent_contract: 'Location',
};

export default function ContractsList() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [selectedContract, setSelectedContract] = useState<any | null>(null);
  const [filter, setFilter] = useState('all');
  const [signing, setSigning] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fetchContracts = () => {
    api.get(endpoints.contracts).then(res => {
      const data = res.data.results || (Array.isArray(res.data) ? res.data : []);
      setContracts(data);
    });
  };

  useEffect(() => { fetchContracts(); }, []);

  const filteredContracts = filter === 'all'
    ? contracts
    : contracts.filter(c => c.contract_type === filter);

  const signOwner = async (id: number) => {
    setSigning(true);
    try {
      const res = await api.post(`${endpoints.contracts}${id}/sign_owner/`);
      fetchContracts();
      setSelectedContract(res.data);
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Erreur lors de la signature.');
    } finally { setSigning(false); }
  };

  const downloadContract = async (id: number) => {
    setDownloading(true);
    try {
      const response = await api.get(`${endpoints.contracts}${id}/download/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contrat-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Erreur lors du téléchargement.');
    } finally { setDownloading(false); }
  };

  return (
    <div className="flex gap-6 p-6 h-[calc(100vh-64px)]">
      {/* Liste */}
      <div className="w-80 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base">Contrats</h2>
            <button onClick={fetchContracts} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-all">
              <RefreshCw size={14} />
            </button>
          </div>
          <select
            className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">Tous les types</option>
            <option value="sale_contract">Vente</option>
            <option value="lease_contract">Bail</option>
            <option value="rent_contract">Location</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filteredContracts.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              <FileText size={32} className="mx-auto mb-3 opacity-20" />
              Aucun contrat trouvé.
            </div>
          ) : filteredContracts.map(c => {
            const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.draft;
            const StatusIcon = cfg.icon;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedContract(c)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-all ${selectedContract?.id === c.id ? 'bg-blue-50 border-l-2 border-blue-600' : ''}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="font-semibold text-sm text-gray-900 truncate">{c.title || `Contrat #${c.id}`}</p>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${cfg.color}`}>
                    <StatusIcon size={9} />
                    {cfg.label}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{TYPE_LABEL[c.contract_type] ?? c.contract_type}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Détail */}
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-y-auto">
        {selectedContract ? (() => {
          const cfg = STATUS_CONFIG[selectedContract.status] ?? STATUS_CONFIG.draft;
          const StatusIcon = cfg.icon;
          const canSign = selectedContract.status === 'draft' || selectedContract.status === 'sent';
          const canDownload = selectedContract.status === 'signed';
          return (
            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedContract.title || `Contrat #${selectedContract.id}`}</h1>
                  <p className="text-sm text-gray-400 mt-1">{TYPE_LABEL[selectedContract.contract_type] ?? selectedContract.contract_type}</p>
                </div>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold ${cfg.color}`}>
                  <StatusIcon size={15} /> {cfg.label}
                </span>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {selectedContract.client_name && (
                  <div className="flex items-center gap-2 text-gray-500 bg-gray-50 rounded-xl px-3 py-2.5">
                    <User size={14} className="text-blue-400 shrink-0" />
                    <span className="truncate">{selectedContract.client_name}</span>
                  </div>
                )}
                {selectedContract.property_title && (
                  <div className="flex items-center gap-2 text-gray-500 bg-gray-50 rounded-xl px-3 py-2.5">
                    <Building2 size={14} className="text-blue-400 shrink-0" />
                    <span className="truncate">{selectedContract.property_title}</span>
                  </div>
                )}
                {selectedContract.created_at && (
                  <div className="flex items-center gap-2 text-gray-500 bg-gray-50 rounded-xl px-3 py-2.5">
                    <Calendar size={14} className="text-blue-400 shrink-0" />
                    <span>{new Date(selectedContract.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
              </div>

              {/* Signature status */}
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${selectedContract.owner_signed ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-400'}`}>
                  {selectedContract.owner_signed ? <CheckCircle size={12} /> : <Clock size={12} />}
                  Agence (vous)
                </div>
                <div className="flex-1 h-px bg-gray-200" />
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${selectedContract.client_signed ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-400'}`}>
                  {selectedContract.client_signed ? <CheckCircle size={12} /> : <Clock size={12} />}
                  Client
                </div>
              </div>

              {/* Content */}
              {selectedContract.content && (
                <div className="bg-gray-50 rounded-2xl p-6 text-sm text-gray-700 leading-relaxed whitespace-pre-line border border-gray-100">
                  {selectedContract.content}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                {canSign && (
                  <button
                    onClick={() => signOwner(selectedContract.id)}
                    disabled={signing}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl hover:shadow-md transition-all disabled:opacity-50"
                  >
                    {signing ? <Loader2 size={14} className="animate-spin" /> : <Pen size={14} />}
                    Signer de votre côté
                  </button>
                )}
                {canDownload && (
                  <button
                    onClick={() => downloadContract(selectedContract.id)}
                    disabled={downloading}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all disabled:opacity-50"
                  >
                    {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    Télécharger le PDF
                  </button>
                )}
              </div>
            </div>
          );
        })() : (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 py-24">
            <FileText size={56} className="mb-4 opacity-20" />
            <p className="text-gray-400 font-medium">Sélectionnez un contrat</p>
            <p className="text-xs text-gray-300 mt-1">pour le visualiser et agir dessus</p>
          </div>
        )}
      </div>
    </div>
  );
}