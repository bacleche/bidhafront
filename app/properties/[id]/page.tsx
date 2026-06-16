'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { api, endpoints } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Property } from '@/types';
import {
  MapPin, Maximize2, Bed, Bath, Car, Trees, Waves, Shield, Sofa,
  ArrowLeft, Eye, Phone, Mail, Share2, Heart, CheckCircle2,
  MessageCircle, CalendarCheck, AlertTriangle, X, Loader2, Send,
  Clock, CheckCircle, XCircle, RefreshCw, Star
} from 'lucide-react';

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            size={20}
            className={s <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  );
}

function formatPrice(p: string) {
  const n = parseFloat(p);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} M FCFA`;
  return `${n.toLocaleString()} FCFA`;
}

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Appartement', house: 'Maison', villa: 'Villa',
  land: 'Terrain', commercial: 'Commercial', office: 'Bureau', warehouse: 'Entrepôt'
};

const COMPLAINT_CATEGORIES = [
  { value: 'service', label: 'Qualité de service' },
  { value: 'agent', label: 'Comportement agent' },
  { value: 'property', label: 'Information bien erronée' },
  { value: 'transaction', label: 'Problème transaction' },
  { value: 'other', label: 'Autre' },
];

type ModalType = 'contact' | 'visit' | 'complaint' | 'review' | null;

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [liked, setLiked] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Forms
  const [contactMsg, setContactMsg] = useState("J'aimerais en savoir un peu plus sur ce bien.");
  const [visitDate, setVisitDate] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [complaint, setComplaint] = useState({ category: 'other', subject: '', description: '' });

  useEffect(() => {
    api.get(`${endpoints.properties}${id}/`)
      .then(r => {
        setProperty(r.data);
        if (r.data.agency) {
          api.get(`${endpoints.agencies}${r.data.agency}/reviews/`)
            .then(res => setReviews(res.data))
            .catch(console.error);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const isAgent = user?.role === 'agent';
  const isLoggedIn = !!user;

  const openModal = (type: ModalType) => {
    setError(''); setSuccess('');
    setModal(type);
  };

  const closeModal = () => {
    setModal(null); setSuccess(''); setError('');
  };

  const handleContact = async () => {
    if (!contactMsg.trim()) return;
    setSubmitting(true); setError('');
    try {
      await api.post(endpoints.contactRequests, { property: id, message: contactMsg });
      setSuccess('Votre message a été envoyé à l\'agent. Il vous répondra prochainement.');
      if (property) setProperty({ ...property, is_contacted: true });
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Erreur lors de l\'envoi.');
    } finally { setSubmitting(false); }
  };

  const handleVisit = async () => {
    if (!visitDate) { setError('Veuillez choisir une date.'); return; }
    setSubmitting(true); setError('');
    try {
      await api.post(endpoints.visitRequests, {
        property: id,
        requested_date: visitDate,
        notes: visitNotes,
      });
      setSuccess('Demande de visite envoyée. L\'agent vous confirmera sous peu.');
      if (property) setProperty({ ...property, has_pending_visit: true });
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Erreur lors de la demande.');
    } finally { setSubmitting(false); }
  };

  const handleComplaint = async () => {
    if (!complaint.subject || !complaint.description) {
      setError('Objet et description sont obligatoires.');
      return;
    }
    setSubmitting(true); setError('');
    try {
      await api.post(endpoints.complaints, { property: id, ...complaint });
      setSuccess('Plainte enregistrée. Le responsable de l\'agence en sera informé.');
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Erreur lors de l\'envoi.');
    } finally { setSubmitting(false); }
  };

  const handleReview = async () => {
    if (!property?.agency) return;
    setSubmitting(true); setError('');
    try {
      await api.post(`${endpoints.agencies}${property.agency}/add_review/`, {
        stars: reviewStars,
        comment: reviewComment
      });
      setSuccess('Merci ! Votre avis a bien été enregistré.');
      setReviewComment('');
      // Re-charger les avis
      const res = await api.get(`${endpoints.agencies}${property.agency}/reviews/`);
      setReviews(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Erreur lors de l\'enregistrement de l\'avis.');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen"><Navbar />
      <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse">
        <div className="h-80 rounded-3xl bg-blue-50 mb-8"></div>
      </div>
    </div>
  );

  if (!property) return (
    <div className="min-h-screen"><Navbar />
      <div className="text-center py-24"><p className="text-gray-500">Bien introuvable</p></div>
    </div>
  );

  const amenities = [
    { icon: Car, label: 'Parking', active: property.parking },
    { icon: Trees, label: 'Jardin', active: property.garden },
    { icon: Waves, label: 'Piscine', active: property.pool },
    { icon: Shield, label: 'Sécurité', active: property.security },
    { icon: Sofa, label: 'Meublé', active: property.furnished },
  ].filter(a => a.active);

  const avgStars = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + r.stars, 0) / reviews.length).toFixed(1)
    : null;


  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link href="/properties" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-5 transition-colors font-medium">
          <ArrowLeft size={16} /> Retour aux biens
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl overflow-hidden bg-blue-50 h-80 md:h-96 relative">
              {property.images?.[activeImg] ? (
                <img src={property.images[activeImg].image} alt={property.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-20 h-20 rounded-3xl bg-blue-100 flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1a56db" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
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

            {property.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {property.images.map((img, i) => (
                  <button key={img.id} onClick={() => setActiveImg(i)} className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? 'border-blue-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img.image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

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

            <div className="bidhaa-card p-6">
              <h2 className="font-display font-bold text-lg text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

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

            {/* ── AVIS AGENCE ── */}
            <div className="bidhaa-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display font-bold text-lg text-gray-900">Avis sur l'agence</h2>
                  {avgStars ? (
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating value={Math.round(Number(avgStars))} />
                      <span className="text-sm font-bold text-amber-500">{avgStars}</span>
                      <span className="text-xs text-gray-400">({reviews.length} avis)</span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">Aucun avis pour le moment</p>
                  )}
                </div>
                {isLoggedIn && !isAgent && (
                  <button
                    onClick={() => openModal('review')}
                    className="px-4 py-2 text-sm font-bold text-blue-600 border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition-all"
                  >
                    Donner un avis
                  </button>
                )}
              </div>
              {reviews.length > 0 && (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {reviews.map((r: any) => (
                    <div key={r.id} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                            {r.client_name?.[0] ?? 'C'}
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{r.client_name ?? 'Client'}</span>
                        </div>
                        <StarRating value={r.stars} />
                      </div>
                      {r.comment && <p className="text-xs text-gray-500 leading-relaxed">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="space-y-5">
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

              {/* Boutons avec état agent */}
              {isAgent ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-center">
                  <p className="text-amber-700 text-sm font-semibold">Vous êtes agent</p>
                  <p className="text-amber-600 text-xs mt-0.5">Ces actions sont réservées aux clients.</p>
                </div>
              ) : !isLoggedIn ? (
                <div className="space-y-3">
                  <Link href="/login" className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-blue-200 transition-all text-sm text-center block">
                    Connectez-vous pour contacter
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {property.is_contacted ? (
                    <button
                      disabled
                      className="w-full py-3.5 bg-gray-150 text-gray-400 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-gray-200"
                    >
                      <CheckCircle2 size={16} className="text-gray-400" /> Déjà contacté
                    </button>
                  ) : (
                    <button
                      onClick={() => openModal('contact')}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-blue-200 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={16} /> Contacter l'agent
                    </button>
                  )}
                  {property.has_pending_visit ? (
                    <button
                      disabled
                      className="w-full py-3 bg-gray-150 text-gray-400 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-gray-200"
                    >
                      <Clock size={16} className="text-gray-400" /> Visite en attente
                    </button>
                  ) : (
                    <button
                      onClick={() => openModal('visit')}
                      className="w-full py-3 border-2 border-blue-200 text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <CalendarCheck size={16} /> Planifier une visite
                    </button>
                  )}
                  <button
                    onClick={() => openModal('complaint')}
                    className="w-full py-2.5 border border-red-100 text-red-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all text-xs flex items-center justify-center gap-2 font-semibold"
                  >
                    <AlertTriangle size={13} /> Signaler un problème
                  </button>
                </div>
              )}
            </div>

            <div className="bidhaa-card p-5">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Agent responsable</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a56db" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>
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

            <div className="bidhaa-card p-4 bg-gray-50">
              <p className="text-xs text-gray-500 font-medium mb-2">Informations</p>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between"><span>Réf.</span><span className="font-mono font-bold text-gray-800">BDH-{String(property.id).padStart(5, '0')}</span></div>
                <div className="flex justify-between"><span>Publié le</span><span className="font-medium">{new Date(property.created_at).toLocaleDateString('fr-FR')}</span></div>
                <div className="flex justify-between"><span>Type</span><span className="font-medium">{TYPE_LABELS[property.property_type]}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* ── MODAL CONTACTER L'AGENT ── */}
      {modal === 'contact' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                  <MessageCircle size={17} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Contacter l'agent</h2>
                  {property.agent_name && <p className="text-xs text-gray-400">{property.agent_name}</p>}
                </div>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
                <X size={15} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 font-medium">
                📍 {property.title} — {property.city}
              </div>
              {success ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <CheckCircle size={28} className="text-emerald-500 mx-auto mb-2" />
                  <p className="text-emerald-700 font-semibold text-sm">{success}</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Votre message</label>
                    <textarea
                      rows={4}
                      value={contactMsg}
                      onChange={e => setContactMsg(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  {error && <p className="text-red-500 text-xs">{error}</p>}
                  <button
                    onClick={handleContact}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-xl hover:shadow-lg transition-all text-sm disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    Envoyer le message
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL PLANIFIER VISITE ── */}
      {modal === 'visit' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CalendarCheck size={17} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Planifier une visite</h2>
                  <p className="text-xs text-gray-400">{property.title}</p>
                </div>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
                <X size={15} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {success ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <CheckCircle size={28} className="text-emerald-500 mx-auto mb-2" />
                  <p className="text-emerald-700 font-semibold text-sm">{success}</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date et heure souhaitées <span className="text-red-500">*</span></label>
                    <input
                      type="datetime-local"
                      value={visitDate}
                      onChange={e => setVisitDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes <span className="text-gray-400">(optionnel)</span></label>
                    <textarea
                      rows={3}
                      placeholder="Précisez vos disponibilités, questions particulières..."
                      value={visitNotes}
                      onChange={e => setVisitNotes(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700">
                    <Clock size={12} className="inline mr-1" />
                    L'agent confirmera, reprogrammera ou vous contactera dans les 24h.
                  </div>
                  {error && <p className="text-red-500 text-xs">{error}</p>}
                  <button
                    onClick={handleVisit}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-xl hover:shadow-lg transition-all text-sm disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <CalendarCheck size={15} />}
                    Envoyer la demande
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL PLAINTE ── */}
      {modal === 'complaint' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle size={17} className="text-red-500" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Signaler un problème</h2>
                  <p className="text-xs text-gray-400">Adressé au responsable de l'agence</p>
                </div>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
                <X size={15} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {success ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <CheckCircle size={28} className="text-emerald-500 mx-auto mb-2" />
                  <p className="text-emerald-700 font-semibold text-sm">{success}</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Catégorie</label>
                    <select
                      value={complaint.category}
                      onChange={e => setComplaint(c => ({ ...c, category: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                    >
                      {COMPLAINT_CATEGORIES.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Objet <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Résumez le problème en une phrase"
                      value={complaint.subject}
                      onChange={e => setComplaint(c => ({ ...c, subject: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description <span className="text-red-500">*</span></label>
                    <textarea
                      rows={4}
                      placeholder="Décrivez le problème en détail..."
                      value={complaint.description}
                      onChange={e => setComplaint(c => ({ ...c, description: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                    />
                  </div>
                  {error && <p className="text-red-500 text-xs">{error}</p>}
                  <button
                    onClick={handleComplaint}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold rounded-xl hover:shadow-lg transition-all text-sm disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <AlertTriangle size={15} />}
                    Soumettre la plainte
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL AVIS AGENCE ── */}
      {modal === 'review' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Star size={17} className="text-amber-500" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Donner un avis</h2>
                  <p className="text-xs text-gray-400">{property.agency_name}</p>
                </div>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
                <X size={15} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {success ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <CheckCircle size={28} className="text-emerald-500 mx-auto mb-2" />
                  <p className="text-emerald-700 font-semibold text-sm">{success}</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Votre note</label>
                    <StarRating value={reviewStars} onChange={setReviewStars} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Commentaire <span className="text-gray-400">(optionnel)</span></label>
                    <textarea
                      rows={3}
                      placeholder="Partagez votre expérience avec cette agence..."
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                    />
                  </div>
                  {error && <p className="text-red-500 text-xs">{error}</p>}
                  <button
                    onClick={handleReview}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-white font-bold rounded-xl hover:shadow-lg transition-all text-sm disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <Star size={15} />}
                    Publier mon avis
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}