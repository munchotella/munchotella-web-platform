"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Star, MessageSquareText, Calendar, Search, Filter, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import BentoKpiCard from "@/components/admin/BentoKpiCard";
import LuxuryButton from "@/components/admin/LuxuryButton";

interface OrderReview {
  _id: string;
  createdAt: string;
  customer?: {
    name?: string;
    phone?: string;
    address?: string;
  };
  totalPrice?: number;
  rating: number;
  reviewText?: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<OrderReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<string>("all");

  const loadReviews = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setRefreshing(true);
      setError(null);

      const res = await adminFetch("/orders?hasReview=true&limit=200");
      if (res?.success && Array.isArray(res.data)) {
        // Filtrăm suplimentar pentru siguranță completă
        const validReviews = res.data.filter(
          (order: OrderReview) => order.rating !== null && order.rating !== undefined
        );
        setReviews(validReviews);
      }
    } catch (err: any) {
      const msg = err.message || "Eroare la preluarea recenziilor.";
      if (!msg.includes("expirat")) {
        setError(msg);
      }
    } finally {
      if (isInitial) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReviews(true);
    const interval = setInterval(() => {
      loadReviews(false);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Calcul statistici
  const totalReviews = reviews.length;
  const averageRating = useMemo(() => {
    if (totalReviews === 0) return "0.0";
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return (sum / totalReviews).toFixed(1);
  }, [reviews, totalReviews]);

  const fiveStarCount = useMemo(() => {
    return reviews.filter((r) => r.rating === 5).length;
  }, [reviews]);

  // Filtrare căutare și stele
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesRating =
        selectedRatingFilter === "all" ||
        review.rating.toString() === selectedRatingFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (review.customer?.name && review.customer.name.toLowerCase().includes(q)) ||
        (review._id && review._id.toLowerCase().includes(q)) ||
        (review.reviewText && review.reviewText.toLowerCase().includes(q));

      return matchesRating && matchesSearch;
    });
  }, [reviews, selectedRatingFilter, searchQuery]);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("ro-RO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return isoString;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-gold-saffron border-t-transparent rounded-full animate-spin"></div>
        <p className="font-body-md text-cacao-dark/60 text-sm animate-pulse">
          Se încarcă recenziile clienților...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header cu Statistici (Warm Luxury style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <BentoKpiCard
          title="Total Recenzii"
          value={totalReviews.toString()}
          subtitle="Comenzi evaluate de oaspeți"
          icon={<MessageSquareText size={24} />}
        />

        <BentoKpiCard
          title="Rating Mediu"
          value={averageRating}
          subtitle={
            totalReviews > 0
              ? `${fiveStarCount} recenzii de 5 stele`
              : "Nicio evaluare încă"
          }
          icon={<Star size={24} className="fill-gold-saffron text-gold-saffron" />}
          trend={totalReviews > 0 ? "Scor general" : undefined}
          trendPositive={Number(averageRating) >= 4.5}
        />

        <div className="bg-vanilla-porcelain border border-warm-border rounded-2xl p-6 shadow-sm flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-label-caps text-[11px] uppercase tracking-widest text-cacao-dark/60">
              Sincronizare Live
            </h3>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-soft-olive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-soft-olive"></span>
            </span>
          </div>

          <div className="my-2">
            <p className="text-sm font-body-md text-cacao-dark/70">
              Actualizare automată la fiecare 15 secunde.
            </p>
          </div>

          <div>
            <LuxuryButton
              variant="outline"
              size="sm"
              onClick={() => loadReviews(false)}
              disabled={refreshing}
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              <span>{refreshing ? "Se actualizează..." : "Reîmprospătează datele"}</span>
            </LuxuryButton>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 p-4 rounded-xl flex items-center gap-3 text-error">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-body-md">{error}</p>
        </div>
      )}

      {/* Controale de filtrare și căutare */}
      <div className="bg-vanilla-porcelain border border-warm-border rounded-2xl p-5 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        {/* Căutare */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cacao-dark/40"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Caută după client, ID comandă sau text..."
            className="w-full bg-white/70 border border-warm-border rounded-xl pl-10 pr-4 py-2.5 text-sm font-body-md text-cacao-dark placeholder:text-cacao-dark/40 focus:outline-none focus:ring-1 focus:ring-gold-saffron transition-all"
          />
        </div>

        {/* Filtre rating */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-label-caps text-cacao-dark/50 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <Filter size={14} /> Filtru:
          </span>
          {[
            { id: "all", label: "Toate" },
            { id: "5", label: "5 ★" },
            { id: "4", label: "4 ★" },
            { id: "3", label: "3 ★" },
            { id: "2", label: "2 ★" },
            { id: "1", label: "1 ★" },
          ].map((tab) => {
            const active = selectedRatingFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedRatingFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-body-md transition-all shrink-0 cursor-pointer ${
                  active
                    ? "bg-cacao-dark text-vanilla-porcelain font-medium shadow-sm"
                    : "bg-white/60 text-cacao-dark/70 hover:bg-white hover:text-cacao-dark border border-warm-border"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabelul / Lista de Recenzii */}
      <div className="bg-vanilla-porcelain border border-warm-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-warm-border flex items-center justify-between bg-white/40">
          <div>
            <h3 className="font-headline-md text-xl text-cacao-dark">
              Jurnal Recenzii și Comentarii
            </h3>
            <p className="text-xs text-cacao-dark/60 font-body-md mt-0.5">
              Afișare {filteredReviews.length} din {totalReviews} recenzii înregistrate
            </p>
          </div>
        </div>

        <div className="divide-y divide-warm-border">
          {filteredReviews.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gold-saffron/10 text-gold-saffron flex items-center justify-center mx-auto">
                <Sparkles size={24} />
              </div>
              <p className="font-headline-md text-lg text-cacao-dark">
                Nicio recenzie găsită
              </p>
              <p className="font-body-md text-sm text-cacao-dark/50 max-w-sm mx-auto">
                {reviews.length === 0
                  ? "Nu a fost plasată încă nicio recenzie pentru comenzi."
                  : "Nu există recenzii care să corespundă criteriilor de filtrare selectate."}
              </p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div
                key={review._id}
                className="p-6 hover:bg-[#FAF7F2]/80 transition-colors"
              >
                <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                  {/* Informații comandă și client */}
                  <div className="md:w-1/3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 bg-cacao-dark/5 rounded text-cacao-dark font-medium border border-warm-border">
                        #{review._id.slice(-4).toUpperCase()}
                      </span>
                      <h4 className="font-body-md font-medium text-cacao-dark">
                        {review.customer?.name || "Client anonim"}
                      </h4>
                    </div>

                    <div className="text-xs text-cacao-dark/50 flex items-center gap-1.5 font-body-md">
                      <Calendar size={13} className="text-cacao-dark/40" />
                      <span>{formatDate(review.createdAt)}</span>
                    </div>

                    {review.totalPrice && (
                      <p className="text-xs text-cacao-dark/60 font-body-md">
                        Valoare comandă:{" "}
                        <span className="font-medium text-cacao-dark">
                          {review.totalPrice} MDL
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Rating și feedback text */}
                  <div className="md:w-2/3 w-full bg-white/70 border border-warm-border/80 rounded-xl p-4 shadow-2xs">
                    {/* Stele */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={`${
                              star <= review.rating
                                ? "fill-gold-saffron text-gold-saffron"
                                : "fill-transparent text-warm-border"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-label-caps text-gold-saffron font-medium">
                        {review.rating} din 5
                      </span>
                    </div>

                    {/* Text recenzie */}
                    {review.reviewText && review.reviewText.trim() !== "" ? (
                      <p className="font-body-md text-cacao-dark/90 text-sm leading-relaxed italic border-l-2 border-gold-saffron/40 pl-3.5 py-0.5">
                        "{review.reviewText}"
                      </p>
                    ) : (
                      <p className="font-body-md text-cacao-dark/40 text-xs italic">
                        Clientul a oferit doar rating prin stele, fără comentariu adițional.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
