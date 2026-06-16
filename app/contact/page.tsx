'use client';
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Building2, Mail, MapPin, Phone, Send, Loader2, CheckCircle } from 'lucide-react';

const CITIES = [
  'Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi', 'Ouesso',
  'Impfondo', 'Sibiti', 'Madingou', 'Kinkala', 'Gamboma'
];

const BESOINS = [
  'Acheter un bien',
  'Louer un bien',
  'Vendre mon bien',
  'Estimer mon bien',
  'Rejoindre comme agence',
  'Support technique',
  'Autre',
];

export default function ContactPage() {
  const [form, setForm] = useState({ full_name: '', city: '', besoin: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500)); // simulé
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-10 px-4 text-center">
        <h1 className="font-display font-bold text-3xl text-white mb-1">Contactez-nous</h1>
        <p className="text-blue-200 text-sm">Notre équipe vous répond sous 24h</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* Infos */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Building2 size={18} className="text-blue-600" />
              </div>
              <span className="font-display font-bold text-gray-900">Bidhaa</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              La plateforme immobilière de référence au Congo Brazzaville. Achat, location, gestion d'agence — tout en un.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: MapPin, label: 'Brazzaville, République du Congo' },
              { icon: Mail, label: 'contact@bidhaa.cg' },
              { icon: Phone, label: '+242 06 000 00 00' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-blue-500" />
                </div>
                {label}
              </div>
            ))}
          </div>

          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-xs font-bold text-blue-700 mb-1">Horaires d'ouverture</p>
            <p className="text-xs text-blue-600">Lun – Ven : 8h00 – 17h00</p>
            <p className="text-xs text-blue-600">Samedi : 9h00 – 13h00</p>
          </div>
        </div>

        {/* Formulaire */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          {sent ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h2 className="font-display font-bold text-xl text-gray-900 mb-2">Message envoyé !</h2>
              <p className="text-sm text-gray-500">Nous vous répondrons à <span className="font-semibold text-gray-700">{form.email}</span> sous 24h.</p>
              <button onClick={() => { setSent(false); setForm({ full_name:'', city:'', besoin:'', email:'', message:'' }); }}
                className="mt-6 text-sm text-blue-600 font-bold hover:underline">
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-display font-bold text-xl text-gray-900 mb-6">Envoyez-nous un message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Nom complet */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nom complet</label>
                  <input
                    value={form.full_name}
                    onChange={e => setForm({ ...form, full_name: e.target.value })}
                    required placeholder="Jean Moukala"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"
                  />
                </div>

                {/* Ville + Besoin */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Ville</label>
                    <select
                      value={form.city}
                      onChange={e => setForm({ ...form, city: e.target.value })}
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all bg-white"
                    >
                      <option value="">Choisir...</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Besoin</label>
                    <select
                      value={form.besoin}
                      onChange={e => setForm({ ...form, besoin: e.target.value })}
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all bg-white"
                    >
                      <option value="">Choisir...</option>
                      {BESOINS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Adresse email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required placeholder="jean@example.com"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Message</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    required rows={4} placeholder="Décrivez votre besoin en détail..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Envoi en cours...</>
                    : <><Send size={16} /> Envoyer le message</>
                  }
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}