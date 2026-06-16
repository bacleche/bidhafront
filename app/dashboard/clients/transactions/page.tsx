'use client';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { FileText, CheckCircle, Clock, Home } from 'lucide-react';

export default function ClientTransactionView({ transaction }: { transaction: any }) {
  return (

    <div className="min-h-screen bg-gray-50">
       <Navbar />   

    <div className="max-w-2xl mx-auto p-6 space-y-6  min-h-screen bg-gray-50">
       <h1 className="text-xl font-bold">Suivi de mon dossier</h1>

      {/* Carte Résumé */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Home /></div>
          <div>
            <p className="text-xs text-gray-500">Bien immobilier</p>
            <h2 className="font-bold text-lg">{transaction?.property_title}</h2>
          </div>
        </div>

        {/* Timeline (simple) */}
        <div className="flex justify-between items-center mb-8 relative">
          <div className="absolute w-full h-0.5 bg-gray-100 top-1/2 -z-10"></div>
          {['Initialisation', 'Documents', 'Signature'].map((step, i) => (
            <div key={step} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {i === 0 ? <CheckCircle size={16} /> : i + 1}
              </div>
              <span className="text-[10px] mt-2 font-bold text-gray-600">{step}</span>
            </div>
          ))}
        </div>

        {/* Espace Documents */}
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-sm font-bold mb-4">Mes documents</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <FileText className="text-gray-400" size={20} />
                <span className="text-sm font-medium">Contrat de vente.pdf</span>
              </div>
              <button className="text-blue-600 text-xs font-bold uppercase">Télécharger</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

  );
}