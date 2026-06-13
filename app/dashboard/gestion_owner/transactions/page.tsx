'use client';
import { useState } from 'react';
import { 
  TrendingUp, DollarSign, Briefcase, Filter, 
  Download, Eye, ShieldCheck 
} from 'lucide-react';

export default function AgencyOwnerDashboard() {
  // Exemple de données (proviennent de votre endpoint /stats/ et /transactions/)
  const stats = { revenue: '125 400 €', commissions: '45 200 €', totalTX: 24 };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      {/* Header avec KPIs */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord financier</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Revenu Total" value={stats.revenue} icon={DollarSign} color="text-emerald-600" />
          <StatCard title="Commissions Agence" value={stats.commissions} icon={TrendingUp} color="text-blue-600" />
          <StatCard title="Transactions Actives" value={stats.totalTX} icon={Briefcase} color="text-amber-600" />
        </div>
      </div>

      {/* Liste des Transactions */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-lg">Toutes les transactions</h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-semibold hover:bg-gray-50">
              <Filter size={16} /> Filtrer
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black">
              <Download size={16} /> Exporter
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 uppercase text-[10px] border-b">
              <th className="pb-3 text-left">Référence</th>
              <th className="pb-3 text-left">Agent</th>
              <th className="pb-3 text-left">Client</th>
              <th className="pb-3 text-left">Montant</th>
              <th className="pb-3 text-center">Status</th>
              <th className="pb-3 text-right">Contrats</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="py-4 font-bold text-gray-900">TX-2026-99</td>
              <td className="py-4">Marc L.</td>
              <td className="py-4">Sophie B.</td>
              <td className="py-4">450 000 €</td>
              <td className="py-4 text-center">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-bold text-[10px]">COMPLÉTÉ</span>
              </td>
              <td className="py-4 text-right">
                <button className="text-blue-600 font-bold hover:underline flex items-center justify-end gap-1">
                  <ShieldCheck size={14} /> Gérer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Composant utilitaire pour les cartes de stats
function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div className={`mb-3 ${color}`}><Icon size={24} /></div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}