'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api, endpoints } from '@/lib/api';
import { Agency, Agent } from '@/types';
import { ArrowLeft, Loader2, Home, MapPin, DollarSign, Info, Image as ImageIcon, CheckSquare } from 'lucide-react';

const STEPS = ['Informations', 'Localisation', 'Prix', 'Équipements', 'Photos'];

export default function NewPropertyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: '', description: '', property_type: 'apartment', offer_type: 'sale',
    status: 'available', agency: '', agent: '',
    price: '', rent_price: '',
    address: '', city: '', district: '', latitude: '', longitude: '',
    area: '', bedrooms: '0', bathrooms: '0', floors: '1',
    parking: false, garden: false, pool: false, security: false, furnished: false,
    is_featured: false,
  });

  useEffect(() => {
    // Charger toutes les agences
    api.get(endpoints.agencies).then(r => {
      const list = r.data.results || r.data;
      setAgencies(list);
      
      // Si c'est un propriétaire d'agence, charger son agence et la pré-remplir
      if (user?.role === 'agency_owner') {
        api.get(endpoints.agenciesMine).then(res => {
          if (res.data.has_agency) {
            setForm(f => ({ ...f, agency: String(res.data.agency.id) }));
          }
        });
      }
    });

    api.get(endpoints.agents).then(r => setAgents(r.data.results || r.data));
  }, [user]);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setPreviews(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (i: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    setSaving(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) fd.append(k, String(v));
      });
      const { data: property } = await api.post(endpoints.properties, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Upload images
      for (let i = 0; i < images.length; i++) {
        const imgFd = new FormData();
        imgFd.append('property', property.id);
        imgFd.append('image', images[i]);
        imgFd.append('is_cover', i === 0 ? 'true' : 'false');
        imgFd.append('order', String(i));
        await api.post('/property-images/', imgFd, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(() => { });
      }
      router.push('/dashboard/properties');
    } catch (err: any) {
      const d = err.response?.data;
      setError(d ? Object.entries(d).map(([k, v]) => `${k}: ${(v as any[]).join(', ')}`).join(' | ') : 'Une erreur est survenue.');
      setSaving(false);
    }
  };

  const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-50 transition-all bg-white";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  const canNext = () => {
    if (step === 0) return form.title && form.property_type && form.agency;
    if (step === 2) return form.price && form.area;
    return true;
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/properties" className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-green-100 hover:text-green-600 transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Ajouter un bien</h1>
          <p className="text-gray-500 text-sm">Remplissez les informations du bien immobilier</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <button onClick={() => i < step && setStep(i)} className="flex flex-col items-center gap-1 group flex-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i < step ? 'bg-green-600 text-white' :
                  i === step ? 'bg-green-600 text-white ring-4 ring-green-100' :
                    'bg-gray-100 text-gray-400'
                }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${i === step ? 'text-green-600' : 'text-gray-400'}`}>{s}</span>
            </button>
            {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-1 rounded ${i < step ? 'bg-green-500' : 'bg-gray-200'}`}></div>}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="bidhaa-card p-8">
        {error && <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">{error}</div>}

        {/* Step 0 — Informations */}
        {step === 0 && (
          <div className="space-y-5 animate-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center"><Info size={16} className="text-green-600" /></div>
              <h2 className="font-display font-bold text-lg text-gray-900">Informations générales</h2>
            </div>
            <div>
              <label className={labelCls}>Titre du bien <span className="text-red-400">*</span></label>
              <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="ex: Villa moderne 4 chambres - Bacongo" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} placeholder="Décrivez le bien en détail..." className={inputCls + ' resize-none'} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Type de bien <span className="text-red-400">*</span></label>
                <select value={form.property_type} onChange={e => set('property_type', e.target.value)} className={inputCls}>
                  {[['apartment', 'Appartement'], ['house', 'Maison'], ['villa', 'Villa'], ['land', 'Terrain'], ['commercial', 'Local Commercial'], ['office', 'Bureau'], ['warehouse', 'Entrepôt']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Type d'offre <span className="text-red-400">*</span></label>
                <select value={form.offer_type} onChange={e => set('offer_type', e.target.value)} className={inputCls}>
                  <option value="sale">Vente</option>
                  <option value="rent">Location</option>
                  <option value="both">Vente & Location</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Statut</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>
                  {[['available', 'Disponible'], ['reserved', 'Réservé'], ['sold', 'Vendu'], ['rented', 'Loué'], ['unavailable', 'Indisponible']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Agence <span className="text-red-400">*</span></label>
                <select value={form.agency} onChange={e => set('agency', e.target.value)} className={inputCls}>
                  <option value="">Sélectionner...</option>
                  {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Agent responsable</label>
              <select value={form.agent} onChange={e => set('agent', e.target.value)} className={inputCls}>
                <option value="">Aucun agent assigné</option>
                {agents.filter(a => !form.agency || String(a.agency) === form.agency).map(a => <option key={a.id} value={a.id}>{a.user.first_name} {a.user.last_name}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Step 1 — Localisation */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center"><MapPin size={16} className="text-green-600" /></div>
              <h2 className="font-display font-bold text-lg text-gray-900">Localisation</h2>
            </div>
            <div>
              <label className={labelCls}>Adresse complète</label>
              <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="ex: Rue des Manguiers, N°12" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Ville <span className="text-red-400">*</span></label>
                <select value={form.city} onChange={e => set('city', e.target.value)} className={inputCls}>
                  <option value="">Sélectionner...</option>
                  {['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi', 'Ouesso', 'Impfondo'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Quartier / District</label>
                <input value={form.district} onChange={e => set('district', e.target.value)} placeholder="ex: Bacongo, Plateau..." className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Latitude</label>
                <input type="number" step="any" value={form.latitude} onChange={e => set('latitude', e.target.value)} placeholder="-4.2661..." className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Longitude</label>
                <input type="number" step="any" value={form.longitude} onChange={e => set('longitude', e.target.value)} placeholder="15.2832..." className={inputCls} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Prix & Surface */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center"><DollarSign size={16} className="text-green-600" /></div>
              <h2 className="font-display font-bold text-lg text-gray-900">Prix & Surface</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Prix de vente (FCFA) <span className="text-red-400">*</span></label>
                <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="ex: 85000000" className={inputCls} />
              </div>
              {(form.offer_type === 'rent' || form.offer_type === 'both') && (
                <div>
                  <label className={labelCls}>Loyer mensuel (FCFA)</label>
                  <input type="number" value={form.rent_price} onChange={e => set('rent_price', e.target.value)} placeholder="ex: 500000" className={inputCls} />
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Surface (m²) <span className="text-red-400">*</span></label>
                <input type="number" value={form.area} onChange={e => set('area', e.target.value)} placeholder="120" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Chambres</label>
                <input type="number" min="0" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Salles de bain</label>
                <input type="number" min="0" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Étages</label>
                <input type="number" min="0" value={form.floors} onChange={e => set('floors', e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} className="w-4 h-4 accent-green-600" />
                <span className="text-sm font-semibold text-gray-700">Mettre en vedette sur la vitrine</span>
              </label>
            </div>
          </div>
        )}

        {/* Step 3 — Équipements */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center"><CheckSquare size={16} className="text-green-600" /></div>
              <h2 className="font-display font-bold text-lg text-gray-900">Équipements & Services</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { k: 'parking', l: 'Parking / Garage' },
                { k: 'garden', l: 'Jardin' },
                { k: 'pool', l: 'Piscine' },
                { k: 'security', l: 'Sécurité / Gardiennage' },
                { k: 'furnished', l: 'Meublé' },
              ].map(({ k, l }) => (
                <label key={k} className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${form[k as keyof typeof form] ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}>
                  <input type="checkbox" checked={!!form[k as keyof typeof form]} onChange={e => set(k, e.target.checked)} className="w-4 h-4 accent-green-600" />
                  <span className={`text-sm font-semibold ${form[k as keyof typeof form] ? 'text-green-700' : 'text-gray-700'}`}>{l}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 4 — Photos */}
        {step === 4 && (
          <div className="space-y-5 animate-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center"><ImageIcon size={16} className="text-green-600" /></div>
              <h2 className="font-display font-bold text-lg text-gray-900">Photos du bien</h2>
            </div>
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-green-300 rounded-2xl cursor-pointer hover:bg-green-50 transition-all">
              <ImageIcon size={28} className="text-green-400 mb-2" />
              <p className="text-sm font-semibold text-gray-600">Cliquez pour ajouter des photos</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG — La première photo sera la photo de couverture</p>
              <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
            </label>
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden aspect-square">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    {i === 0 && <span className="absolute top-2 left-2 badge bg-green-600 text-white text-xs">Couverture</span>}
                    <button onClick={() => removeImage(i)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600 transition-all">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <button onClick={() => setStep(s => s - 1)} disabled={step === 0} className="px-6 py-2.5 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-all disabled:opacity-40">
            ← Précédent
          </button>
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-green-600 w-5' : i < step ? 'bg-green-400' : 'bg-gray-200'}`}></div>)}
          </div>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-800 text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-green-200 transition-all disabled:opacity-40">
              Suivant →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-green-600 to-green-800 text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-green-200 transition-all disabled:opacity-60">
              {saving ? <><Loader2 size={15} className="animate-spin" /> Enregistrement...</> : '✓ Publier le bien'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
