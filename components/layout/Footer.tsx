import Link from 'next/link';
import { Building2, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-blue-950 to-blue-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Building2 size={22} className="text-blue-300" />
              </div>
              <span className="font-display font-bold text-2xl text-white">Bidhaa</span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed mb-5">
              La plateforme de gestion immobilière de référence en République du Congo.
            </p>
            <div className="flex gap-3">
             {['FB', 'TW', 'IG', 'IN'].map((s, i) => (
  <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-blue-500 transition-all text-xs font-bold">
    {s}
  </a>
))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-bold text-white mb-4">Services</h4>
            <ul className="space-y-2.5">
              {['Vente immobilière','Location','Gestion locative','Estimation gratuite','Conseils juridiques'].map(s => (
                <li key={s}><a href="#" className="text-blue-200 text-sm hover:text-white transition-colors">{s}</a></li>
              ))}
            </ul>
          </div>

          {/* Villes */}
          <div>
            <h4 className="font-display font-bold text-white mb-4">Villes couvertes</h4>
            <ul className="space-y-2.5">
              {['Brazzaville','Pointe-Noire','Dolisie','Nkayi','Ouesso','Impfondo'].map(v => (
                <li key={v}><a href="#" className="text-blue-200 text-sm hover:text-white transition-colors">{v}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-white mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-blue-300 mt-0.5 shrink-0" />
                <span className="text-blue-200 text-sm">Avenue de la Paix, Brazzaville, République du Congo</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-blue-300 shrink-0" />
                <span className="text-blue-200 text-sm">+242 06 000 0000</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-blue-300 shrink-0" />
                <span className="text-blue-200 text-sm">contact@bidhaa.cg</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-blue-300 text-sm">© 2026 Bidhaa - Dev | nkouka@darius. Tous droits réservés.</p>
          <div className="flex gap-6">
            {['Mentions légales','Confidentialité','CGU'].map(l => (
              <a key={l} href="#" className="text-blue-300 text-sm hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
