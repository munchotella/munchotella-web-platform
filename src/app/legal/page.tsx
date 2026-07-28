import React from "react";
import { Shield, BookOpen, Truck } from "lucide-react";
import { AnimateIn } from "@/components/ui/AnimateIn";

export const metadata = {
  title: "Informații Juridice | Munchotella",
  description: "Termeni și Condiții, Politica de Confidențialitate și Informații Livrare Munchotella.",
};

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-[#FFFCF6] pt-28 pb-32">
      <div className="max-w-[800px] mx-auto px-6 md:px-12">
        <AnimateIn direction="up">
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#1A120B] mb-4">Transparență & Siguranță</h1>
            <p className="text-[#736A60] text-lg max-w-2xl mx-auto">Suntem aici ca să îți aducem desertul preferat direct la ușă. Pentru ca totul să decurgă perfect, iată regulile noastre simple de livrare și modul în care îți protejăm datele.</p>
          </div>
        </AnimateIn>

        <div className="space-y-20">
          
          {/* Termeni si Conditii */}
          <section id="terms" className="scroll-mt-32">
            <AnimateIn direction="up" delay={0.1}>
              <div className="flex items-center space-x-4 mb-8 border-b border-[#E8E2D9] pb-4">
                <div className="w-12 h-12 rounded-full bg-[#1A120B] flex items-center justify-center text-[#D4A853]">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h2 className="font-serif text-3xl font-bold text-[#1A120B]">Termeni și Condiții</h2>
              </div>
              
              <div className="space-y-6 text-[#4A4238] leading-relaxed">
                <div>
                  <h3 className="text-lg font-bold text-[#1A120B] mb-2">1. Serviciul Munchotella</h3>
                  <p>Munchotella oferă servicii de comandă și livrare la domiciliu a produselor de tip waffles, băuturi și alte preparate alimentare din meniul propriu în raza orașului Chișinău.</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1A120B] mb-2">2. Plasarea Comenzii</h3>
                  <p>Prin finalizarea comenzii, clientul confirmă că datele furnizate sunt corecte. Imaginile produselor sunt cu titlu de prezentare și pot exista mici diferențe față de produsul final livrat.</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1A120B] mb-2">3. Plata și Prețuri</h3>
                  <p>Prețurile sunt exprimate în MDL. Taxa de livrare este calculată automat și detaliată în secțiunea de Livrare. Pentru distanțe mai mari de 1km se aplică tariful standard de taxi (30 MDL pornire + 6.45 MDL/km).</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1A120B] mb-2">4. Politica de Anulare</h3>
                  <p>Produsele alimentare perisabile preparate la comandă <strong>NU</strong> pot fi returnate conform legislației Republicii Moldova. Anularea unei comenzi este posibilă doar telefonic în primele 5 minute de la plasarea acesteia.</p>
                </div>
              </div>
            </AnimateIn>
          </section>

          {/* Politica de Confidentialitate */}
          <section id="privacy" className="scroll-mt-32">
            <AnimateIn direction="up" delay={0.2}>
              <div className="flex items-center space-x-4 mb-8 border-b border-[#E8E2D9] pb-4">
                <div className="w-12 h-12 rounded-full bg-[#1A120B] flex items-center justify-center text-[#D4A853]">
                  <Shield className="w-6 h-6" />
                </div>
                <h2 className="font-serif text-3xl font-bold text-[#1A120B]">Politica de Confidențialitate</h2>
              </div>
              
              <div className="space-y-6 text-[#4A4238] leading-relaxed">
                <div>
                  <h3 className="text-lg font-bold text-[#1A120B] mb-2">1. Date Colectate</h3>
                  <p>Colectăm nume, telefon, e-mail și adresa de livrare conform <strong>Legii nr. 133/2011 privind protecția datelor cu caracter personal</strong>.</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1A120B] mb-2">2. Scopul Procesării</h3>
                  <p>Datele sunt utilizate strict pentru procesarea comenzii, comunicarea statusului livrării și îmbunătățirea experienței utilizatorului pe platforma noastră.</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1A120B] mb-2">3. Coordonate GPS</h3>
                  <p>Aplicația utilizează locația GPS pentru a calcula taxa de livrare și pentru a ghida curierul la adresa exactă. Aceste date nu sunt stocate permanent în baza noastră de date.</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1A120B] mb-2">4. Drepturile Utilizatorului</h3>
                  <p>Aveți dreptul de acces, intervenție și opoziție asupra datelor. Pentru ștergerea contului și a datelor asociate, contactați-ne la adresa <a href="mailto:munchotella@gmail.com" className="text-[#D4A853] hover:underline">munchotella@gmail.com</a>.</p>
                </div>
                
                <div className="mt-8 p-6 bg-[#E8E2D9]/30 rounded-2xl border border-[#E8E2D9]">
                  <h4 className="font-bold text-[#1A120B] mb-2">Cadru Legal (Monitorul Oficial)</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-[#736A60]">
                    <li>Legea nr. 133 privind protecția datelor cu caracter personal</li>
                    <li>Legea nr. 284 privind comerțul electronic</li>
                  </ul>
                </div>
              </div>
            </AnimateIn>
          </section>

          {/* Informatii Livrare */}
          <section id="delivery" className="scroll-mt-32">
            <AnimateIn direction="up" delay={0.3}>
              <div className="flex items-center space-x-4 mb-8 border-b border-[#E8E2D9] pb-4">
                <div className="w-12 h-12 rounded-full bg-[#1A120B] flex items-center justify-center text-[#D4A853]">
                  <Truck className="w-6 h-6" />
                </div>
                <h2 className="font-serif text-3xl font-bold text-[#1A120B]">Informații Livrare</h2>
              </div>
              
              <div className="space-y-6 text-[#4A4238] leading-relaxed">
                <div>
                  <h3 className="text-lg font-bold text-[#1A120B] mb-2">Politica Generală de Livrare</h3>
                  <p>Timpul estimat de livrare este de obicei între 30 și 60 de minute. Acest timp este orientativ, iar Munchotella nu răspunde pentru întârzierile cauzate de aglomerația în trafic, condiții meteo nefavorabile sau alte situații de forță majoră.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm">
                    <h4 className="font-bold text-[#1A120B] mb-3 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-[#D4A853] mr-2"></span>
                      Livrare Pietonală
                    </h4>
                    <p className="text-sm">Pentru locații aflate în imediata apropiere (sub 1km distanță față de punctul de preparare). Taxa aplicată este de <strong>+20 MDL</strong>.</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm">
                    <h4 className="font-bold text-[#1A120B] mb-3 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-[#D4A853] mr-2"></span>
                      Livrare prin Taxi
                    </h4>
                    <p className="text-sm">Se folosește un serviciu extern de taxi. Tariful se calculează automat la finalizarea comenzii conform formulei: <strong>30 MDL pornire + 6.45 MDL / km</strong>.</p>
                  </div>
                </div>
              </div>
            </AnimateIn>
          </section>

        </div>
      </div>
    </main>
  );
}
