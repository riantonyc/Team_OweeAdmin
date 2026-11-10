"use client";

import React, { useState } from "react";
import { X, Download, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { Athlete } from "@/lib/types";
import { exportAthletesToExcel } from "@/lib/excelExport";
import { useToast } from "./Toast";

interface ModalExcelExportProps {
  isOpen: boolean;
  athletes: Athlete[];
  onClose: () => void;
}

export default function ModalExcelExport({
  isOpen,
  athletes,
  onClose,
}: ModalExcelExportProps) {
  const [exportMode, setExportMode] = useState<"formula" | "static">("formula");
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleDownload = () => {
    try {
      exportAthletesToExcel(athletes, exportMode);
      showToast("File Excel Book1 berhasil diunduh!", "success");
      onClose();
    } catch (err) {
      showToast("Gagal mengekspor file Excel.", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slateCard border border-slateBorder rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-[#1F3864] via-slateElevated to-slateCard border-b border-slateBorder flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-mono font-extrabold text-sm shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                FULL STYLING &amp; WARNA OTOMATIS
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                Export ke File Excel (.xlsx) Rapi &amp; Berwarna
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* 4 Sheets Explanation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-carbon border border-slateBorder space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-blue-400">
                  Sheet 1: Tabel_Per_Kelas
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-[#1F3864] text-white">
                  Format Book1
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tabel berdampingan <strong>PUTRA</strong> (<span className="text-[#38BDF8]">#2E75B6</span>) &amp;{" "}
                <strong>PUTRI</strong> (<span className="text-[#F87171]">#C0504D</span>) untuk 11 kelas berat, lengkap dengan border tipis dan baris Jumlah (<span className="text-indigo-200">#D9E1F2</span>).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-carbon border border-slateBorder space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-400">
                  Sheet 2: Database_Atlet
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-900/60 text-emerald-300">
                  Pusat Edit
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tabel master seluruh atlet dengan badge warna otomatis pada Kategori &amp; Status, serta <em>Kode Urut Otomatis</em>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-carbon border border-slateBorder space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-400">
                  Sheet 3: Rekap_Kontingen
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-900/50 text-amber-300">
                  Matriks COUNTIFS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tabel matriks sebaran atlet Putra, Putri, dan per Kabupaten/Kota dengan rumus <code>COUNTIFS</code> otomatis.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-carbon border border-slateBorder space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-purple-400">
                  Sheet 4: Referensi_Data
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-purple-900/50 text-purple-300">
                  Master Referensi
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Daftar referensi 11 Kelas Berat Badan Muaythai dan 14 Kontingen Kabupaten/Kota se-Kalimantan Barat.
              </p>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="bg-carbon border border-slateBorder rounded-xl p-3.5 space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
              Pilih Mode Export Excel:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label
                className={`cursor-pointer flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  exportMode === "formula"
                    ? "border-emerald-500 bg-emerald-950/20 shadow-md"
                    : "border-slateBorder bg-slateCard hover:border-slate-500"
                }`}
              >
                <input
                  type="radio"
                  name="excelMode"
                  value="formula"
                  checked={exportMode === "formula"}
                  onChange={() => setExportMode("formula")}
                  className="mt-1 accent-emerald-500"
                />
                <div>
                  <p className="text-xs font-extrabold text-white">
                    Mode Rumus Otomatis (Rekomendasi)
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                    Sheet <code>Tabel_Per_Kelas</code> &amp; <code>Rekap_Kontingen</code> dilengkapi rumus (<code>INDEX/MATCH</code> &amp; <code>COUNTIFS</code>), otomatis sinkron saat diedit di Excel.
                  </p>
                </div>
              </label>

              <label
                className={`cursor-pointer flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  exportMode === "static"
                    ? "border-blue-500 bg-blue-950/20 shadow-md"
                    : "border-slateBorder bg-slateCard hover:border-slate-500"
                }`}
              >
                <input
                  type="radio"
                  name="excelMode"
                  value="static"
                  checked={exportMode === "static"}
                  onChange={() => setExportMode("static")}
                  className="mt-1 accent-blue-500"
                />
                <div>
                  <p className="text-xs font-extrabold text-white">
                    Mode Nilai Statis Siap Cetak
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                    Menulis langsung nilai murni tanpa baris cadangan, cocok untuk langsung dicetak (*print*) menjadi laporan resmi.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-slateElevated hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold min-h-[44px]"
            >
              Batal
            </button>
            <button
              onClick={handleDownload}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              <span>Download File Excel (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
