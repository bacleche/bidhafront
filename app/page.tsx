'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SearchBar from '@/components/ui/SearchBar';
import PropertyCard from '@/components/properties/PropertyCard';
import { api, endpoints } from '@/lib/api';
import { Property, Agency } from '@/types';
import { Building2, TrendingUp, Shield, Users, ChevronRight, Star, ArrowRight, Home, MapPin } from 'lucide-react';

const STATS = [
  { label: 'Biens disponibles', value: '500+', icon: Home, color: 'from-blue-500 to-blue-700' },
  { label: 'Agences partenaires', value: '40+', icon: Building2, color: 'from-indigo-500 to-indigo-700' },
  { label: 'Transactions réalisées', value: '1 200+', icon: TrendingUp, color: 'from-emerald-500 to-emerald-700' },
  { label: 'Clients satisfaits', value: '3 000+', icon: Users, color: 'from-amber-500 to-amber-600' },
];

const SERVICES = [
  { icon: Home, title: 'Achat & Vente', desc: 'Trouvez le bien de vos rêves ou vendez votre propriété au meilleur prix avec nos experts.', color: 'bg-blue-50 text-blue-600' },
  { icon: Building2, title: 'Location', desc: 'Locations résidentielles et commerciales dans toutes les villes du Congo.', color: 'bg-indigo-50 text-indigo-600' },
  { icon: Shield, title: 'Gestion locative', desc: 'Confiez-nous la gestion de votre bien et percevez vos loyers en toute sérénité.', color: 'bg-emerald-50 text-emerald-600' },
  { icon: TrendingUp, title: 'Estimation', desc: 'Obtenez une estimation gratuite et fiable de la valeur de votre bien immobilier.', color: 'bg-amber-50 text-amber-600' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<Property[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(endpoints.propertiesFeatured),
      api.get(endpoints.agencies + '?page_size=6'),
    ]).then(([pRes, aRes]) => {
      setFeatured(pRes.data);
      setAgencies(aRes.data.results || aRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 min-h-[580px] flex items-center">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-blue-300 blur-3xl"></div>
        </div>
        <div className="absolute inset-0" style={{backgroundImage:'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(96,165,250,0.08) 0%, transparent 50%)'}}></div>

        <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 text-blue-200 text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-white/10 animate-fade-up">
              <MapPin size={14} />
              <span>Brazzaville · Pointe-Noire · Congo</span>
            </div>
            <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-6 animate-fade-up" style={{animationDelay:'0.1s'}}>
              Trouvez votre<br />
              <span className="text-blue-300">bien idéal</span><br />
              au Congo
            </h1>
            <p className="text-blue-200 text-lg mb-8 leading-relaxed animate-fade-up" style={{animationDelay:'0.2s'}}>
              Zua-Nayo connecte acheteurs, locataires et agences immobilières pour des transactions sûres et transparentes.
            </p>

            <div className="animate-fade-up" style={{animationDelay:'0.3s'}}>
              <SearchBar />
            </div>

            <div className="flex gap-6 mt-8 animate-fade-up" style={{animationDelay:'0.4s'}}>
              {['Appartements', 'Villas', 'Terrains', 'Locaux commerciaux'].map((t, i) => (
                <Link key={t} href={`/properties?property_type=${['apartment','villa','land','commercial'][i]}`} className="text-sm text-blue-200 hover:text-white transition-colors font-medium">{t}</Link>
              ))}
            </div>
          </div>
        </div>

        {/* Floating stat card */}
        <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 flex-col gap-3">
          {[{v:'500+',l:'Biens'},{v:'40+',l:'Agences'},{v:'97%',l:'Satisfaction'}].map(({v,l}) => (
            <div key={l} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center min-w-[110px]">
              <p className="font-display font-bold text-2xl text-white">{v}</p>
              <p className="text-blue-200 text-xs font-medium">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-card border border-blue-50 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <p className="font-display font-bold text-xl text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured properties */}
      <section className="max-w-7xl mx-auto px-4 mt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl text-gray-900">Biens en vedette</h2>
            <p className="text-gray-500 text-sm mt-1">Sélection de biens d'exception</p>
          </div>
          <Link href="/properties" className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:gap-2.5 transition-all">
            Voir tout <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <div key={i} className="Zua-Nayo-card h-80 bg-gradient-to-br from-gray-50 to-blue-50 animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((p, i) => <div key={p.id} className="animate-fade-up" style={{animationDelay:`${i*0.07}s`}}><PropertyCard property={p} /></div>)}
          </div>
        )}
      </section>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-4 mt-20">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">Nos services</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">Une gamme complète de services immobiliers pour répondre à tous vos besoins.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="Zua-Nayo-card p-6 text-center group cursor-pointer">
              <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
              </div>
              <h3 className="font-display font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Agencies */}
      {agencies.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-2xl text-gray-900">Agences partenaires</h2>
              <p className="text-gray-500 text-sm mt-1">Des professionnels de confiance</p>
            </div>
            <Link href="/agencies" className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:gap-2.5 transition-all">
              Toutes les agences <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {agencies.map((agency) => (
              <Link key={agency.id} href={`/agencies/${agency.id}`} className="Zua-Nayo-card p-5 text-center group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  {agency.logo ? <img src={`http://localhost:8000${agency.logo}`} alt={agency.name} className="w-full h-full object-cover rounded-2xl" /> : <Building2 size={22} className="text-blue-500" />}
                </div>
                <p className="font-semibold text-xs text-gray-800 line-clamp-2 leading-snug">{agency.name}</p>
                <p className="text-xs text-gray-400 mt-1">{agency.city}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 mt-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 p-10 md:p-16 text-white text-center">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 30% 50%, white 0%, transparent 50%)'}}></div>
          <div className="relative z-10">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">Vous êtes une agence immobilière ?</h2>
            <p className="text-blue-200 text-lg mb-8 max-w-lg mx-auto">Rejoignez Zua-Nayo et gérez vos biens, agents, clients et contrats depuis une seule plateforme.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register" className="px-8 py-3.5 bg-white text-blue-700 font-bold rounded-2xl hover:shadow-xl transition-all">Créer mon agence</Link>
              <Link href="/contact" className="px-8 py-3.5 bg-white/10 text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-all">En savoir plus</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
