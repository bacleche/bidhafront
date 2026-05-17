'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { api, endpoints } from '@/lib/api';
import { Property } from '@/types';
import { MapPin, Maximize2, Bed, Bath, Car, Trees, Waves, Shield, Sofa, ArrowLeft, Eye, Phone, Mail, Share2, Heart, CheckCircle2 } from 'lucide-react';

function formatPrice(p: string) {
  const n = parseFloat(p);
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)} M FCFA`;
  return `${n.toLocaleString()} FCFA`;
}

const TYPE_LABELS: Record<string,string> = { apartment:'Appartement', house:'Maison', villa:'Villa', land:'Terrain', commercial:'Commercial', office:'Bureau', warehouse:'Entrepôt' };

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    api.get(`${endpoints.properties}${id}/`)
      .then(r => setProperty(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen"><Navbar />
      <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse">
        <div className="h-80 rounded-3xl bg-blue-50 mb-8"></div>
        <div className="grid md:grid-cols-3 gap-6"><div className="md:col-span-2 space-y-4"><div className="h-8 bg-gray-100 rounded-xl"></div><div className="h-4 bg-gray-100 rounded-xl w-2/3"></div></div></div>
      </div>
    </div>
  );

  if (!property) return <div className="min-h-screen"><Navbar /><div className="text-center py-24"><p className="text-gray-500">Bien introuvable</p></div></div>;

  const amenities = [
    { icon: Car, label: 'Parking', active: property.parking },
    { icon: Trees, label: 'Jardin', active: property.garden },
    { icon: Waves, label: 'Piscine', active: property.pool },
    { icon: Shield, label: 'Sécurité', active: property.security },
    { icon: Sofa, label: 'Meublé', active: property.furnished },
  ].filter(a => a.active);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back */}
        <Link href="/properties" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-5 transition-colors font-medium">
          <ArrowLeft size={16} /> Retour aux biens
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <div className="rounded-3xl overflow-hidden bg-blue-50 h-80 md:h-96 relative">
              {property.images?.[activeImg] ? (
                <img src={`http://localhost:8000${property.images[activeImg].image}`} alt={property.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-20 h-20 rounded-3xl bg-blue-100 flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1a56db" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                  </div>
                </div>
              )}
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => setLiked(!liked)} className={`w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center transition-all ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                  <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                </button>
                <button className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all">
                  <Share2 size={18} />
                </button>
              </div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm text-white text-xs rounded-full px-3 py-1.5">
                <Eye size={12} /> {property.views_count} vues
              </div>
            </div>

            {/* Thumbnails */}
            {property.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {property.images.map((img, i) => (
                  <button key={img.id} onClick={() => setActiveImg(i)} className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i===activeImg ? 'border-blue-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={`http://localhost:8000${img.image}`} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Title & meta */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="badge bg-blue-100 text-blue-700">{TYPE_LABELS[property.property_type]}</span>
                <span className="badge bg-emerald-100 text-emerald-700">{property.status === 'available' ? 'Disponible' : property.status}</span>
                {property.is_featured && <span className="badge bg-amber-100 text-amber-700">⭐ En vedette</span>}
              </div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-900 mb-3">{property.title}</h1>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <MapPin size={15} className="text-blue-500" />
                <span>{property.address}, {property.district && `${property.district}, `}{property.city}</span>
              </div>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Maximize2, label: 'Surface', value: `${parseFloat(property.area).toFixed(0)} m²` },
                ...(property.bedrooms > 0 ? [{ icon: Bed, label: 'Chambres', value: String(property.bedrooms) }] : []),
                ...(property.bathrooms > 0 ? [{ icon: Bath, label: 'Salles de bain', value: String(property.bathrooms) }] : []),
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bidhaa-card p-4 text-center">
                  <Icon size={20} className="text-blue-500 mx-auto mb-2" />
                  <p className="font-display font-bold text-lg text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bidhaa-card p-6">
              <h2 className="font-display font-bold text-lg text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bidhaa-card p-6">
                <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Équipements & Services</h2>
                <div className="flex flex-wrap gap-3">
                  {amenities.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-xl px-4 py-2.5 text-sm font-semibold">
                      <CheckCircle2 size={15} /> {label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Contact card */}
          <div className="space-y-5">
            {/* Price card */}
            <div className="bidhaa-card p-6 border-2 border-blue-100">
              <div className="mb-4">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                  {property.offer_type === 'rent' ? 'Prix de location' : 'Prix de vente'}
                </p>
                <p className="font-display font-extrabold text-3xl text-blue-700">{formatPrice(property.price)}</p>
                {property.rent_price && (
                  <p className="text-sm text-gray-500 mt-1">{formatPrice(property.rent_price)}<span className="text-xs text-gray-400">/mois</span></p>
                )}
              </div>
              <button className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-blue-200 transition-all text-sm mb-3 animate-pulse-blue">
                Contacter l'agence
              </button>
              <button className="w-full py-3 border-2 border-blue-200 text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all text-sm">
                Planifier une visite
              </button>
            </div>

            {/* Agency */}
            <div className="bidhaa-card p-5">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Agence proposant ce bien</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a56db" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">{property.agency_name}</p>
                  {property.agent_name && <p className="text-xs text-gray-500">Agent : {property.agent_name}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <a href="tel:+24206000000" className="flex items-center gap-3 w-full py-2.5 px-4 bg-gray-50 rounded-xl text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-medium">
                  <Phone size={15} /> +242 06 000 0000
                </a>
                <a href="mailto:contact@bidhaa.cg" className="flex items-center gap-3 w-full py-2.5 px-4 bg-gray-50 rounded-xl text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-medium">
                  <Mail size={15} /> Envoyer un email
                </a>
              </div>
            </div>

            {/* Reference */}
            <div className="bidhaa-card p-4 bg-gray-50">
              <p className="text-xs text-gray-500 font-medium mb-2">Informations</p>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between"><span>Réf.</span><span className="font-mono font-bold text-gray-800">BDH-{String(property.id).padStart(5,'0')}</span></div>
                <div className="flex justify-between"><span>Publié le</span><span className="font-medium">{new Date(property.created_at).toLocaleDateString('fr-FR')}</span></div>
                <div className="flex justify-between"><span>Type</span><span className="font-medium">{TYPE_LABELS[property.property_type]}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
