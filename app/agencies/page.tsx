'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { api, endpoints } from '@/lib/api';
import { Agency } from '@/types';
import { Building2, MapPin, Phone, Mail, Users, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    api.get(endpoints.agencies).then(r=>setAgencies(r.data.results||[])).finally(()=>setLoading(false));
  },[]);

  return (
    <div className="min-h-screen">
      <Navbar/>
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-10 px-4 text-center">
        <h1 className="font-display font-bold text-3xl text-white mb-1">Nos agences partenaires</h1>
        <p className="text-blue-200 text-sm">Des professionnels de l'immobilier à votre service</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_,i)=><div key={i} className="bidhaa-card h-52 animate-pulse bg-blue-50"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {agencies.map(agency=>(
              <div key={agency.id} className="bidhaa-card p-6 group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {agency.logo ? <img src={`http://localhost:8000${agency.logo}`} alt={agency.name} className="w-full h-full object-cover rounded-2xl"/> : <Building2 size={26} className="text-blue-500"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-gray-900 text-sm leading-tight mb-1">{agency.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500"><MapPin size={11} className="text-blue-400"/>{agency.city}</div>
                  </div>
                </div>
                {agency.description && <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{agency.description}</p>}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500"><Phone size={11} className="text-blue-400"/>{agency.phone}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500"><Mail size={11} className="text-blue-400"/>{agency.email}</div>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Users size={13} className="text-blue-400"/>{agency.agents_count} agent{agency.agents_count!==1?'s':''}
                  </div>
                  <Link href={`/properties?agency=${agency.id}`} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline">
                    Voir les biens <ExternalLink size={11}/>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
}
