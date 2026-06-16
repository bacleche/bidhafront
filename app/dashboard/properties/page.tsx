'use client';
import { useEffect, useState } from 'react';
import { api, endpoints } from '@/lib/api';
import { Property } from '@/types';
import { Plus, Home, MapPin, Trash2, Search, SlidersHorizontal, Eye, DollarSign } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Appartement',
  house: 'Maison',
  villa: 'Villa',
  land: 'Terrain',
  commercial: 'Local Commercial',
  office: 'Bureau',
  warehouse: 'Entrepôt'
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  available: { label: 'Disponible', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  reserved: { label: 'Réservé', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  sold: { label: 'Vendu', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  rented: { label: 'Loué', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  unavailable: { label: 'Indisponible', color: 'bg-gray-100 text-gray-800 border-gray-200' }
};

export default function DashboardPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchProperties = () => {
    setLoading(true);
    api.get(endpoints.properties)
      .then(r => setProperties(r.data.results || r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce bien immobilier ?')) return;
    try {
      await api.delete(`${endpoints.properties}${id}/`);
      fetchProperties();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression.');
    }
  };

  const filtered = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.city.toLowerCase().includes(search.toLowerCase()) ||
                          (p.district && p.district.toLowerCase().includes(search.toLowerCase()));
    const matchesCity = cityFilter ? p.city === cityFilter : true;
    const matchesType = typeFilter ? p.property_type === typeFilter : true;
    return matchesSearch && matchesCity && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50">
              <Navbar />  
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Gestion des Biens</h1>
          <p className="text-gray-500 text-sm">Gérez et suivez le statut de vos biens immobiliers</p>
        </div>
        <Link href="/dashboard/properties/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all self-start">
          <Plus size={16} /> Ajouter un bien
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher par titre, ville, quartier..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white"
          />
        </div>
        {/* City Filter */}
        <select 
          value={cityFilter} 
          onChange={e => setCityFilter(e.target.value)} 
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white text-gray-600 font-medium"
        >
          <option value="">Toutes les villes</option>
          {['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi', 'Ouesso', 'Impfondo'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {/* Type Filter */}
        <select 
          value={typeFilter} 
          onChange={e => setTypeFilter(e.target.value)} 
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white text-gray-600 font-medium"
        >
          <option value="">Tous les types</option>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bidhaa-card h-80 animate-pulse bg-blue-50/50"></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl">
          <Home size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Aucun bien immobilier correspondant</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => {
            const statusCfg = STATUS_CONFIG[p.status] || { label: p.status, color: 'bg-gray-100 text-gray-800' };
            const coverImage = p.images?.find(img => img.is_cover)?.image || p.images?.[0]?.image;
            return (
              <div key={p.id} className="bidhaa-card overflow-hidden group hover:shadow-xl hover:border-blue-100 transition-all flex flex-col h-full bg-white">
                {/* Image */}
                <div className="h-48 w-full bg-gray-100 relative overflow-hidden shrink-0">
                  {coverImage ? (
                    <img 
                      src={`${coverImage}`} 
                      alt={p.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Home size={32} />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`badge border text-xs px-2.5 py-1 ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="badge bg-black/40 backdrop-blur-sm text-white text-xs border-0">
                      {TYPE_LABELS[p.property_type] || p.property_type}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <p className="font-display font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {p.title}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin size={12} className="text-blue-400" />
                      <span className="truncate">{p.address}, {p.district && `${p.district}, `}{p.city}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-auto">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Prix</p>
                      <p className="font-display font-extrabold text-blue-700 text-base">
                        {parseFloat(p.price).toLocaleString()} FCFA
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link 
                        href={`/properties/${p.id}`}
                        target="_blank"
                        className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                        title="Voir la vitrine"
                      >
                        <Eye size={14} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
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