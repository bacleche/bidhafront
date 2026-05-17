'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Home, SlidersHorizontal } from 'lucide-react';

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [offer, setOffer] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (city) params.set('city', city);
    if (type) params.set('property_type', type);
    if (offer) params.set('offer_type', offer);
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-2">
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[160px] flex items-center gap-2 px-4 py-2.5 bg-blue-50 rounded-xl">
          <Search size={16} className="text-blue-400 shrink-0" />
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} placeholder="Rechercher un bien..." className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full font-medium" />
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl">
          <MapPin size={16} className="text-gray-400 shrink-0" />
          <select value={city} onChange={e=>setCity(e.target.value)} className="bg-transparent text-sm text-gray-600 outline-none cursor-pointer">
            <option value="">Toute ville</option>
            {['Brazzaville','Pointe-Noire','Dolisie','Nkayi','Ouesso'].map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl">
          <Home size={16} className="text-gray-400 shrink-0" />
          <select value={type} onChange={e=>setType(e.target.value)} className="bg-transparent text-sm text-gray-600 outline-none cursor-pointer">
            <option value="">Type de bien</option>
            {[['apartment','Appartement'],['house','Maison'],['villa','Villa'],['land','Terrain'],['commercial','Commercial'],['office','Bureau']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl">
          <SlidersHorizontal size={16} className="text-gray-400 shrink-0" />
          <select value={offer} onChange={e=>setOffer(e.target.value)} className="bg-transparent text-sm text-gray-600 outline-none cursor-pointer">
            <option value="">Vente / Location</option>
            <option value="sale">Vente</option>
            <option value="rent">Location</option>
          </select>
        </div>
        <button onClick={handleSearch} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95">
          Rechercher
        </button>
      </div>
    </div>
  );
}
