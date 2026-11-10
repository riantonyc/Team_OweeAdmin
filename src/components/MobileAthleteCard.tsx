"use client";

import React from "react";
import { Eye, Edit3, Trash2, Check, AlertCircle } from "lucide-react";
import { Athlete } from "@/lib/types";
import { KALBAR_CONTINGENTS, WEIGHT_CLASSES } from "@/lib/constants";
import { formatDobIndo, calculateAge } from "@/lib/excelExport";

interface MobileAthleteCardProps {
  athlete: Athlete;
  index: number;
  onOpenDetail: (id: number) => void;
  onOpenEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onInlineUpdate: (id: number, field: string, value: any) => void;
}

export default function MobileAthleteCard({
  athlete,
  index,
  onOpenDetail,
  onOpenEdit,
  onDelete,
  onInlineUpdate,
}: MobileAthleteCardProps) {
  const isPutra = athlete.kategori === "PUTRA";
  const isAktif = athlete.status === "Aktif";

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isAktif
          ? "bg-slateCard border-slateBorder hover:border-slate-500"
          : "bg-rose-950/20 border-rose-900/40 opacity-70"
      }`}
    >
      {/* Top Row: Index, Name, Gender Badge & Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <span className="w-6 h-6 rounded-md bg-carbon border border-slateBorder flex items-center justify-center font-mono text-xs font-bold text-slate-400 tabular-nums shrink-0 mt-0.5">
            {index + 1}
          </span>
          <div>
            <button
              onClick={() => onOpenDetail(athlete.id)}
              className="text-left font-bold text-sm sm:text-base text-white hover:text-blue-400 transition-colors line-clamp-1"
            >
              {athlete.nama}
            </button>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
              <span className="tabular-nums font-mono">{formatDobIndo(athlete.dob)}</span>
              <span>•</span>
              <span className="text-slate-300 font-semibold">{calculateAge(athlete.dob)}</span>
              {athlete.temuan === "Ya" && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-300 font-bold bg-blue-500/15 px-1.5 py-0.5 rounded">
                    <Check className="w-2.5 h-2.5" /> THB
                  </span>
                </>
              )}
            </div>
            {athlete.catatan && (
              <p className="text-[11px] text-amber-300/80 mt-1 italic">{athlete.catatan}</p>
            )}
          </div>
        </div>

        {/* Quick Toggles: Kategori & Status */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <button
            onClick={() =>
              onInlineUpdate(athlete.id, "kategori", isPutra ? "PUTRI" : "PUTRA")
            }
            className={`min-h-[32px] px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              isPutra
                ? "bg-byonBlue/20 text-blue-300 border border-blue-500/30 hover:bg-byonBlue/30"
                : "bg-putriRed/20 text-rose-300 border border-rose-500/30 hover:bg-putriRed/30"
            }`}
            title="Ketuk untuk ganti Putra/Putri"
          >
            {athlete.kategori}
          </button>

          <button
            onClick={() =>
              onInlineUpdate(athlete.id, "status", isAktif ? "Dicabut" : "Aktif")
            }
            className={`min-h-[28px] px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
              isAktif
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                : "bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
            }`}
            title="Ketuk untuk mengubah status Aktif / Dicabut"
          >
            {athlete.status}
          </button>
        </div>
      </div>

      {/* Middle Row: Quick Select for Kontingen & Kelas (Touch-Friendly Dropdowns) */}
      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slateBorder/60">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Kontingen
          </label>
          <select
            value={athlete.kontingen}
            onChange={(e) => onInlineUpdate(athlete.id, "kontingen", e.target.value)}
            className="w-full px-2.5 py-2 rounded-lg bg-carbon border border-slateBorder text-xs font-semibold text-slate-200 focus:outline-none focus:border-byonBlueLight min-h-[40px]"
          >
            {KALBAR_CONTINGENTS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Kelas Berat
          </label>
          <select
            value={athlete.kelas}
            onChange={(e) => onInlineUpdate(athlete.id, "kelas", e.target.value)}
            className="w-full px-2.5 py-2 rounded-lg bg-carbon border border-slateBorder text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-byonBlueLight min-h-[40px]"
          >
            {WEIGHT_CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bottom Row: Actions */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slateBorder/40">
        <span className="text-[11px] text-slate-500 font-mono">ID: #{athlete.id}</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onOpenDetail(athlete.id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slateElevated hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slateBorder min-h-[36px]"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Lihat</span>
          </button>
          <button
            onClick={() => onOpenEdit(athlete.id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-byonBlue/20 hover:bg-byonBlue/35 text-blue-300 border border-blue-500/30 text-xs font-semibold min-h-[36px]"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(athlete.id)}
            className="p-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Hapus Atlet"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

