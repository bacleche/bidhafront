'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/properties/PropertyCard';
import SearchBar from '@/components/ui/SearchBar';
import { api, endpoints } from '@/lib/api';
import { Property, PaginatedResponse } from '@/types';
import { SlidersHorizontal, GridIcon, List, ChevronLeft, ChevronRight } from 'lucide-react';

function PropertiesContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<PaginatedResponse<Property> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [ordering, setOrdering] = useState('-created_at');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    params.set('ordering', ordering);
    api.get(`${endpoints.properties}?${params.toString()}`)
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams, page, ordering]);

  const totalPages = data ? Math.ceil(data.count / 12) : 0;

  return (
    <div>
      {/* Filter bar */}
      <div className="bg-white border-b border-blue-50 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex-1 max-w-xl"><SearchBar /></div>
          <div className="flex items-center gap-3 shrink-0">
            <select value={ordering} onChange={e=>setOrdering(e.target.value)} className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400 bg-white text-gray-600 font-medium">
              <option value="-created_at">Plus récents</option>
              <option value="price">Prix croissant</option>
              <option value="-price">Prix décroissant</option>
              <option value="-views_count">Plus vus</option>
              <option value="-area">Plus grands</option>
            </select>
            <span className="text-sm text-gray-500 font-medium whitespace-nowrap hidden sm:block">
              {data?.count ?? 0} résultat{(data?.count ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(12)].map((_, i) => <div key={i} className="bidhaa-card h-72 animate-pulse bg-blue-50"></div>)}
          </div>
        ) : data?.results.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <SlidersHorizontal size={32} className="text-blue-300" />
            </div>
            <p className="font-display font-bold text-xl text-gray-700">Aucun résultat</p>
            <p className="text-gray-400 mt-2 text-sm">Modifiez vos critères de recherche pour trouver des biens.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {data?.results.map((p, i) => (
                <div key={p.id} className="animate-fade-up" style={{animationDelay:`${i*0.04}s`}}>
                  <PropertyCard property={p} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 disabled:opacity-40 transition-all">
                  <ChevronLeft size={16} />
                </button>
                {[...Array(Math.min(7,totalPages))].map((_, i) => {
                  const p = i + 1;
                  return <button key={p} onClick={()=>setPage(p)} className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${page===p ? 'bg-blue-600 text-white shadow-md' : 'border border-gray-200 hover:bg-blue-50 hover:border-blue-300'}`}>{p}</button>;
                })}
                <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 disabled:opacity-40 transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-10 px-4 text-center">
        <h1 className="font-display font-bold text-3xl text-white mb-1">Nos biens immobiliers</h1>
        <p className="text-blue-200 text-sm">Vente, location — trouvez le bien qui correspond à vos besoins</p>
      </div>
      <Suspense fallback={<div className="text-center py-20 text-blue-400">Chargement...</div>}>
        <PropertiesContent />
      </Suspense>
      <Footer />
    </div>
  );
}
