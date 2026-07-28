import type { Metadata } from "next";
import { Playfair_Display, Outfit, Great_Vibes } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const playfairFont = Playfair_Display({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
});

const outfitFont = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

const greatVibesFont = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-logo",
});

export const metadata: Metadata = {
  title: "Munchotella | Sweet Art",
  description: "Artă dulce, preparată cu pasiune. O experiență artizanală pentru gusturi fine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      className={`${playfairFont.variable} ${outfitFont.variable} ${greatVibesFont.variable} h-full antialiased`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-accent-gold selection:text-white">
        <ClientProviders>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
