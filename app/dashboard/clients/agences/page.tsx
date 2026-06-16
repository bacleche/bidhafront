'use client';
import { useEffect, useState } from 'react';
import { api, endpoints } from '@/lib/api';
import { Building2, Star, MapPin, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ClientAgencesPage() {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(endpoints.agencies)
      .then(r => setAgencies(Array.isArray(r.data) ? r.data : r.data.results ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={28} className="animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl text-gray-900">Agences partenaires</h2>
      {agencies.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-16">Aucune agence disponible.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {agencies.map((a: any) => (
            <Link key={a.id} href={`/agencies/${a.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Building2 size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{a.name}</p>
                  {a.city && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {a.city}
                    </p>
                  )}
                </div>
              </div>
              {a.average_rating && (
                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                  <Star size={12} className="fill-amber-400" />
                  {Number(a.average_rating).toFixed(1)}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
