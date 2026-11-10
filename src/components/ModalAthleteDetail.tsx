"use client";

import React from "react";
import { X, Edit3, Trash2, ShieldCheck, Users } from "lucide-react";
import { Athlete } from "@/lib/types";
import { WEIGHT_CLASSES } from "@/lib/constants";
import { formatDobIndo, calculateAge } from "@/lib/excelExport";

interface ModalAthleteDetailProps {
  athlete: Athlete | null;
  allAthletes: Athlete[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onInlineUpdate: (id: number, field: string, value: any) => void;
}

export default function ModalAthleteDetail({
  athlete,
  allAthletes,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onInlineUpdate,
}: ModalAthleteDetailProps) {
  if (!isOpen || !athlete) return null;

  const isPutra = athlete.kategori === "PUTRA";
  const isAktif = athlete.status === "Aktif";

  // Competitors in the same weight class & gender
  const peersInClass = allAthletes
    .filter(
      (item) =>
        item.status === "Aktif" &&
        item.kelas === athlete.kelas &&
        item.kategori === athlete.kategori
    )
    .sort(
      (x, y) =>
        x.kontingen.localeCompare(y.kontingen) || x.nama.localeCompare(y.nama)
    );

  const otherCompetitorsCount = peersInClass.filter((item) => item.id !== athlete.id).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slateCard border border-slateBorder rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 duration-150">
        {/* Top Gradient Banner */}
        <div
          className={`px-5 py-4 border-b border-slateBorder flex items-center justify-between ${
            isPutra
              ? "bg-gradient-to-r from-blue-900/60 via-slateElevated to-slateCard"
              : "bg-gradient-to-r from-rose-900/60 via-slateElevated to-slateCard"
          }`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded text-white ${
                isPutra ? "bg-byonBlue" : "bg-putriRed"
              }`}
            >
              {athlete.kategori}
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {athlete.kelas}
            </span>
            <span
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded ${
                isAktif
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              }`}
            >
              {athlete.status}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fighter Info */}
        <div className="p-5 space-y-5">
          <div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
              {athlete.nama}
            </h2>
            <p className="text-sm font-semibold text-blue-400 mt-0.5">
              Kontingen {athlete.kontingen}
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-carbon border border-slateBorder">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Tanggal Lahir
              </span>
              <span className="text-xs sm:text-sm font-bold text-white tabular-nums font-mono mt-0.5 block">
                {formatDobIndo(athlete.dob)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-carbon border border-slateBorder">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Usia
              </span>
              <span className="text-xs sm:text-sm font-bold text-white mt-0.5 block">
                {calculateAge(athlete.dob)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-carbon border border-slateBorder">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Temuan THB
              </span>
              <span
                className={`text-xs sm:text-sm font-bold mt-0.5 block ${
                  athlete.temuan === "Ya" ? "text-blue-300" : "text-slate-500"
                }`}
              >
                {athlete.temuan === "Ya" ? "Terverifikasi" : "Belum Ada"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-carbon border border-slateBorder">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Jumlah Lawan
              </span>
              <span className="text-xs sm:text-sm font-bold text-amber-300 mt-0.5 block">
                {otherCompetitorsCount} Atlet
              </span>
            </div>
          </div>

          {/* Quick Change Selectors */}
          <div className="p-3.5 rounded-xl bg-carbon border border-slateBorder flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Ubah Cepat Kelas Berat
              </span>
              <select
                value={athlete.kelas}
                onChange={(e) => onInlineUpdate(athlete.id, "kelas", e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slateElevated border border-slateBorder text-xs font-mono font-bold text-amber-300 min-h-[36px]"
              >
                {WEIGHT_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:w-40">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Ubah Cepat Status
              </span>
              <select
                value={athlete.status}
                onChange={(e) => onInlineUpdate(athlete.id, "status", e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slateElevated border border-slateBorder text-xs font-bold text-slate-200 min-h-[36px]"
              >
                <option value="Aktif">Aktif</option>
                <option value="Dicabut">Dicabut</option>
              </select>
            </div>
          </div>

          {/* Opponents / Competitors in the same Class */}
          <div className="rounded-xl border border-slateBorder overflow-hidden">
            <div className="px-4 py-2.5 bg-slateElevated border-b border-slateBorder flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Daftar Pesaing di {athlete.kelas} ({athlete.kategori})
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400 tabular-nums">
                {peersInClass.length} Total Atlet
              </span>
            </div>

            <div className="divide-y divide-slateBorder/60 max-h-56 overflow-y-auto">
              {peersInClass.map((peer, idx) => {
                const isSelf = peer.id === athlete.id;
                return (
                  <div
                    key={peer.id}
                    className={`px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm ${
                      isSelf ? "bg-byonBlue/15 font-bold text-white" : "text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-slate-400 w-5">
                        {idx + 1}.
                      </span>
                      <span>{peer.nama}</span>
                      {isSelf && (
                        <span className="px-1.5 py-0.5 text-[9px] rounded bg-byonBlue text-white font-bold">
                          Atlet Ini
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{peer.kontingen}</span>
                      <span className="font-mono text-xs text-slate-400 tabular-nums hidden sm:inline">
                        {formatDobIndo(peer.dob)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                onClose();
                onDelete(athlete.id);
              }}
              className="px-3.5 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 min-h-[40px]"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Atlet</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slateElevated hover:bg-slate-700 text-slate-300 text-xs font-semibold min-h-[40px]"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  onClose();
                  onEdit(athlete.id);
                }}
                className="px-4 py-2 rounded-lg bg-byonBlue hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 min-h-[40px]"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Lengkap</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

