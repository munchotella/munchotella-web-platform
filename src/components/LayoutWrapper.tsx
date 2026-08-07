"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.includes('/admin');

  return (
    <>
      {!isAdmin && <Navbar />}
      <main className={isAdmin ? "" : "flex-1"}>
        {children}
      </main>
      {!isAdmin && <Footer />}
    </>
  );
}
