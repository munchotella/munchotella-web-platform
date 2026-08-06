import React from "react";
import { Shield, BookOpen, Truck } from "lucide-react";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { useTranslations } from 'next-intl';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await import(`../../../../messages/${locale}.json`);
  return {
    title: t.Legal.title,
    description: t.Legal.description,
  };
}

export default function LegalPage() {
  const t = useTranslations('Legal');
  return (
    <main className="min-h-screen bg-[#FFFCF6] pt-28 pb-32">
      <div className="max-w-[800px] mx-auto px-6 md:px-12">
        <AnimateIn direction="up">
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#1A120B] mb-4">{t('heroTitle')}</h1>
            <p className="text-[#736A60] text-lg max-w-2xl mx-auto">{t('heroDesc')}</p>
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
                <h2 className="font-serif text-3xl font-bold text-[#1A120B]">{t('termsTitle')}</h2>
              </div>
              
              <div className="space-y-6 text-[#4A4238] leading-relaxed">
                <div>
                  <h3 className="text-lg font-bold text-[#1A120B] mb-2">{t('terms1')}</h3>
                  <p>{t('terms1Desc')}</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1A120B] mb-2">{t('terms2')}</h3>
                  <p>{t('terms2Desc')}</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1A120B] mb-2">{t('terms3')}</h3>
                  <p>{t('terms3Desc')}</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1A120B] mb-2">{t('terms4')}</h3>
                  <p>{t('terms4Desc')}</p>
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
                <h2 className="font-serif text-3xl font-bold text-[#1A120B]">{t('privacyTitle')}</h2>
              </div>
              
              <div className="space-y-6 text-[#4A4238] leading-relaxed">
                <div>
                  <h3 className="text-lg font-bold text-[#1A120B] mb-2">{t('privacy1')}</h3>
                  <p>{t('privacy1Desc')}</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1A120B] mb-2">{t('privacy2')}</h3>
                  <p>{t('privacy2Desc')}</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1A120B] mb-2">{t('privacy3')}</h3>
                  <p>{t('privacy3Desc')}</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1A120B] mb-2">{t('privacy4')}</h3>
                  <p>{t('privacy4Desc')}<a href="mailto:munchotella@gmail.com" className="text-[#D4A853] hover:underline">munchotella@gmail.com</a>.</p>
                </div>
                
                <div className="mt-8 p-6 bg-[#E8E2D9]/30 rounded-2xl border border-[#E8E2D9]">
                  <h4 className="font-bold text-[#1A120B] mb-2">{t('legalFramework')}</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-[#736A60]">
                    <li>{t('law133')}</li>
                    <li>{t('law284')}</li>
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
                <h2 className="font-serif text-3xl font-bold text-[#1A120B]">{t('deliveryTitle')}</h2>
              </div>
              
              <div className="space-y-6 text-[#4A4238] leading-relaxed">
                <div>
                  <h3 className="text-lg font-bold text-[#1A120B] mb-2">{t('deliveryPolicy')}</h3>
                  <p>{t('deliveryPolicyDesc')}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm">
                    <h4 className="font-bold text-[#1A120B] mb-3 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-[#D4A853] mr-2"></span>
                      {t('walkingDelivery')}
                    </h4>
                    <p className="text-sm">{t('walkingDeliveryDesc')}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm">
                    <h4 className="font-bold text-[#1A120B] mb-3 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-[#D4A853] mr-2"></span>
                      {t('taxiDelivery')}
                    </h4>
                    <p className="text-sm">{t('taxiDeliveryDesc')}</p>
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
