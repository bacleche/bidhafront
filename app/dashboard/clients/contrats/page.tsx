'use client';
import { useEffect, useState } from 'react';
import { api, endpoints } from '@/lib/api';
import {
  FileText, Download, CheckCircle, Clock, XCircle, AlertCircle,
  Loader2, RefreshCw, Building2, User, Calendar
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  draft:        { label: 'Brouillon',        color: 'bg-gray-100 text-gray-600',    icon: FileText },
  sent:         { label: 'En attente signature', color: 'bg-amber-100 text-amber-700', icon: Clock },
  signed_owner: { label: 'Signé (agence)',   color: 'bg-blue-100 text-blue-700',    icon: CheckCircle },
  signed:       { label: 'Signé',            color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  expired:      { label: 'Expiré',           color: 'bg-red-100 text-red-500',      icon: XCircle },
  cancelled:    { label: 'Annulé',           color: 'bg-red-100 text-red-500',      icon: XCircle },
};

export default function ClientContratsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);

  const fetchContracts = () => {
    setLoading(true);
    api.get(endpoints.contracts)
      .then(r => setContracts(Array.isArray(r.data) ? r.data : r.data.results ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchContracts(); }, []);

  const signContract = async (id: number) => {
    setSigning(id);
    try {
      await api.post(`${endpoints.contracts}${id}/sign_client/`);
      fetchContracts();
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Erreur lors de la signature.');
    } finally {
      setSigning(null);
    }
  };

 const downloadContract = async (id: number, contractNumber: string) => {
  setDownloading(id);
  try {
    const response = await api.get(`${endpoints.contracts}${id}/download/`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `contrat-${contractNumber}.pdf`);  // ← contractNumber
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch {
    alert('Erreur lors du téléchargement.');
  } finally {
    setDownloading(null);
  }
};
  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-gray-900">Mes Contrats</h2>
          <p className="text-sm text-gray-500 mt-0.5">{contracts.length} contrat{contracts.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={fetchContracts}
          className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-all"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {contracts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Aucun contrat pour le moment</p>
          <p className="text-xs text-gray-400 mt-1">Vos contrats apparaîtront ici une fois initiés par votre agent.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map(c => {
            const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.draft;
            const StatusIcon = cfg.icon;
            const canSign = (c.status === 'sent' || c.status === 'signed_owner') && !c.client_signed;
            const canDownload = c.status === 'signed';

            return (
              <div key={c.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <FileText size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        Contrat #{String(c.id).padStart(5, '0')}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {c.contract_type === 'sale' ? 'Vente' : c.contract_type === 'rent' ? 'Location' : c.contract_type}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl ${cfg.color}`}>
                    <StatusIcon size={12} />
                    {cfg.label}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {c.property_title && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Building2 size={13} className="text-blue-400 shrink-0" />
                      <span className="truncate">{c.property_title}</span>
                    </div>
                  )}
                  {c.agent_name && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <User size={13} className="text-blue-400 shrink-0" />
                      <span className="truncate">{c.agent_name}</span>
                    </div>
                  )}
                  {c.created_at && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar size={13} className="text-blue-400 shrink-0" />
                      <span>{new Date(c.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>

                {/* Signature timeline */}
                <div className="mt-4 flex items-center gap-2 text-xs">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium ${c.owner_signed ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-400'}`}>
                    {c.owner_signed ? <CheckCircle size={11} /> : <Clock size={11} />}
                    Agence
                  </div>
                  <div className="flex-1 h-px bg-gray-200" />
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium ${c.client_signed ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-400'}`}>
                    {c.client_signed ? <CheckCircle size={11} /> : <Clock size={11} />}
                    Vous
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2 flex-wrap">
                  {canSign && (
                    <button
                      onClick={() => signContract(c.id)}
                      disabled={signing === c.id}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl hover:shadow-md transition-all disabled:opacity-50"
                    >
                      {signing === c.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                      Signer le contrat
                    </button>
                  )}
                  {canDownload && (
                    <button
                      onClick={() => downloadContract(c.id, c.contract_number)}
                      disabled={downloading === c.id}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all disabled:opacity-50"
                    >
                      {downloading === c.id ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                      Télécharger
                    </button>
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
