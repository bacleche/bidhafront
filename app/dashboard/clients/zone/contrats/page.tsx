'use client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ClientContratsPage from '../../contrats/page';

export default function ZoneContratsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <ClientContratsPage />
      </div>
  
    </div>
  );
}
