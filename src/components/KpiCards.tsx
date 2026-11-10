"use client";

import React from "react";
import { Users, Shield, Award, MapPin, Scale } from "lucide-react";
import { Athlete } from "@/lib/types";

interface KpiCardsProps {
  athletes: Athlete[];
}

export default function KpiCards({ athletes }: KpiCardsProps) {
  const activeList = athletes.filter((a) => a.status === "Aktif");
  const putraCount = activeList.filter((a) => a.kategori === "PUTRA").length;
  const putriCount = activeList.filter((a) => a.kategori === "PUTRI").length;
  const uniqueContingents = new Set(activeList.map((a) => a.kontingen)).size;

  return (
    <section className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
      {/* Total Aktif */}
      <div className="bg-slateCard border border-slateBorder rounded-xl p-3.5 sm:p-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Atlet Aktif</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums mt-0.5 sm:mt-1">
            {activeList.length}
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
            Dari {athletes.length} total data
          </p>
        </div>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>

      {/* Putra Aktif */}
      <div className="bg-slateCard border border-slateBorder rounded-xl p-3.5 sm:p-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Atlet Putra (PA)</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums mt-0.5 sm:mt-1">
            {putraCount}
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Tarung Putra</p>
        </div>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-byonBlue/15 border border-byonBlue/30 flex items-center justify-center text-blue-400 font-extrabold text-xs shrink-0">
          PA
        </div>
      </div>

      {/* Putri Aktif */}
      <div className="bg-slateCard border border-slateBorder rounded-xl p-3.5 sm:p-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Atlet Putri (PI)</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums mt-0.5 sm:mt-1">
            {putriCount}
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Tarung Putri</p>
        </div>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-putriRed/15 border border-putriRed/30 flex items-center justify-center text-rose-400 font-extrabold text-xs shrink-0">
          PI
        </div>
      </div>

      {/* Kontingen Terdaftar */}
      <div className="bg-slateCard border border-slateBorder rounded-xl p-3.5 sm:p-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Kontingen</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums mt-0.5 sm:mt-1">
            {uniqueContingents}
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Kabupaten / Kota</p>
        </div>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>

      {/* Kelas Dipertandingkan */}
      <div className="col-span-2 md:col-span-1 bg-slateCard border border-slateBorder rounded-xl p-3.5 sm:p-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Kelas Berat</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums mt-0.5 sm:mt-1">
            11
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">48 Kg s.d. 80+ Kg</p>
        </div>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 font-mono font-bold text-xs shrink-0">
          KG
        </div>
      </div>
    </section>
  );
}

