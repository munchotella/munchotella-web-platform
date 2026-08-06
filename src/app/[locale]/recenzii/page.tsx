"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function RecenziiRedirect() {
  const router = useRouter();
  const t = useTranslations("Redirect");

  useEffect(() => {
    router.replace("/#testimonials");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <p className="text-[#736A60] font-sans text-sm animate-pulse">
        {t('redirectingReviews')}
      </p>
    </div>
  );
}
