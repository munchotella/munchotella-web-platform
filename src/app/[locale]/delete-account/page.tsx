"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, Trash2, Mail, Phone, ArrowLeft, CheckCircle2 } from "lucide-react";
import { AnimateIn } from "@/components/ui/AnimateIn";

export default function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-[#FFFCF6] pt-28 pb-32">
      <div className="max-w-[800px] mx-auto px-6 md:px-12">
        <AnimateIn direction="up">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#736A60] hover:text-[#1A120B] mb-8 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Înapoi la pagina principală
          </Link>

          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-[#E83434]/10 text-[#E83434] flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-[#1A120B] mb-4">
              Ștergerea Contului & Datelor
            </h1>
            <p className="text-[#736A60] text-base md:text-lg max-w-xl mx-auto">
              Politica și instrucțiunile oficiale Munchotella privind eliminarea contului de utilizator și a datelor asociate.
            </p>
          </div>
        </AnimateIn>

        <div className="space-y-8">
          {/* Pasii de stergere */}
          <AnimateIn direction="up" delay={0.1}>
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#E8E2D9] shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-[#1A120B] mb-4 flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-[#D4A853]" />
                Cum poți solicita ștergerea contului
              </h2>
              <p className="text-[#4A4238] leading-relaxed mb-6">
                Respectăm confidențialitatea și dreptul tău asupra datelor personale. Poți solicita oricând ștergerea contului Munchotella prin următoarele metode:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[#FFFCF6] border border-[#E8E2D9]">
                  <h3 className="font-bold text-[#1A120B] mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#1A120B] text-white text-xs flex items-center justify-center font-mono">1</span>
                    Direct din Aplicația Mobilă
                  </h3>
                  <p className="text-sm text-[#736A60] leading-relaxed">
                    1. Deschide aplicația mobilă <strong>Munchotella</strong>.<br />
                    2. Mergi la ecranul <strong>Profil</strong>.<br />
                    3. Apasă pe butonul <strong>„Șterge contul”</strong> și confirmă acțiunea.<br />
                    <em>Contul și datele de profil sunt eliminate instantaneu.</em>
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#FFFCF6] border border-[#E8E2D9]">
                  <h3 className="font-bold text-[#1A120B] mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#1A120B] text-white text-xs flex items-center justify-center font-mono">2</span>
                    Prin Asistență / Email
                  </h3>
                  <p className="text-sm text-[#736A60] leading-relaxed mb-3">
                    Dacă nu mai ai acces la aplicație, trimite o solicitare echipei noastre de suport:
                  </p>
                  <div className="space-y-2 text-sm font-medium">
                    <a
                      href="mailto:munchotella@gmail.com?subject=Solicitare%20Stergere%20Cont%20Munchotella"
                      className="flex items-center gap-2 text-[#D4A853] hover:underline"
                    >
                      <Mail className="w-4 h-4" /> munchotella@gmail.com
                    </a>
                    <a
                      href="tel:+37360777758"
                      className="flex items-center gap-2 text-[#1A120B] hover:text-[#D4A853]"
                    >
                      <Phone className="w-4 h-4" /> +373 60 777 758
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </AnimateIn>

          {/* Ce date se sterg vs se pastreaza */}
          <AnimateIn direction="up" delay={0.2}>
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#E8E2D9] shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-[#1A120B] mb-4">
                Tipuri de date prelucrate la ștergere
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-[#1A120B] text-sm">Date șterse definitiv:</h4>
                    <p className="text-sm text-[#736A60]">
                      Numele, prenumele, numărul de telefon, adresa de email, adresele de livrare salvate, token-urile de notificare push și sesiunile active de autentificare.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-[#1A120B] text-sm">Date păstrate în formă anonimizată:</h4>
                    <p className="text-sm text-[#736A60]">
                      Înregistrările comenzilor anterioare sunt anonimizate complet (fără date personale de identificare) exclusiv pentru evidențe contabile și fiscale conform legislației Republicii Moldova.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E8E2D9] text-xs text-[#8A8175]">
                Timp de procesare: Instantaneu prin aplicație sau maxim 24–48 de ore de la primirea cererii prin email/telefon.
              </div>
            </div>
          </AnimateIn>
        </div>
      </div>
    </main>
  );
}
