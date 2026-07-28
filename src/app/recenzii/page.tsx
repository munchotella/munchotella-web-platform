"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RecenziiRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/#testimonials");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <p className="text-[#736A60] font-sans text-sm animate-pulse">
        Se redirecționează la recenzii...
      </p>
    </div>
  );
}
