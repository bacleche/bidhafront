'use client';
import Link from 'next/link';
import { Property } from '@/types';
import { MapPin, Maximize2, Bed, Bath, Eye, Star, Tag } from 'lucide-react';

const TYPE_LABELS: Record<string,string> = { apartment:'Appartement', house:'Maison', villa:'Villa', land:'Terrain', commercial:'Commercial', office:'Bureau', warehouse:'Entrepôt' };
const STATUS_COLORS: Record<string,string> = { available:'bg-emerald-100 text-emerald-700', reserved:'bg-amber-100 text-amber-700', sold:'bg-red-100 text-red-700', rented:'bg-blue-100 text-blue-700', unavailable:'bg-gray-100 text-gray-600' };
const STATUS_LABELS: Record<string,string> = { available:'Disponible', reserved:'Réservé', sold:'Vendu', rented:'Loué', unavailable:'Indisponible' };

function formatPrice(p: string) {
  const n = parseFloat(p);
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)} M FCFA`;
  if (n >= 1_000) return `${(n/1_000).toFixed(0)} K FCFA`;
  return `${n.toLocaleString()} FCFA`;
}

export default function PropertyCard({ property }: { property: Property }) {
  const coverImg = property.images?.find(i => i.is_cover) || property.images?.[0];

  return (
    <Link href={`/properties/${property.id}`} className="bidhaa-card block overflow-hidden group">
      {/* Image */}
      <div className="relative h-52 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
        {coverImg ? (
          <img src={`http://localhost:8000${coverImg.image}`} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-200 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a56db" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="badge bg-blue-600 text-white text-xs">{TYPE_LABELS[property.property_type] || property.property_type}</span>
          {property.is_featured && <span className="badge bg-amber-400 text-amber-900"><Star size={10} className="mr-0.5" /> Vedette</span>}
        </div>
        <div className="absolute top-3 right-3">
          <span className={`badge text-xs ${STATUS_COLORS[property.status]}`}>{STATUS_LABELS[property.status]}</span>
        </div>
        {property.offer_type === 'rent' && (
          <div className="absolute bottom-3 left-3">
            <span className="badge bg-white text-blue-700 shadow-sm"><Tag size={10} className="mr-1" />Location</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-700 text-gray-900 text-sm leading-snug line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">{property.title}</h3>
        <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
          <MapPin size={12} className="text-blue-400 shrink-0" />
          <span className="truncate">{property.district ? `${property.district}, ` : ''}{property.city}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1"><Maximize2 size={12} className="text-blue-400" />{parseFloat(property.area).toFixed(0)} m²</div>
          {property.bedrooms > 0 && <div className="flex items-center gap-1"><Bed size={12} className="text-blue-400" />{property.bedrooms} ch.</div>}
          {property.bathrooms > 0 && <div className="flex items-center gap-1"><Bath size={12} className="text-blue-400" />{property.bathrooms} sdb</div>}
          <div className="ml-auto flex items-center gap-1"><Eye size={12} className="text-gray-300" />{property.views_count}</div>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            <p className="font-display font-800 text-lg text-blue-700 leading-tight">{formatPrice(property.price)}</p>
            {property.rent_price && <p className="text-xs text-gray-400">{formatPrice(property.rent_price)}/mois</p>}
          </div>
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{property.agency_name}</span>
        </div>
      </div>
    </Link>
  );
}
