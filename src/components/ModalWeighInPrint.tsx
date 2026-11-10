"use client";

import React, { useState } from "react";
import { X, Printer } from "lucide-react";
import { Athlete } from "@/lib/types";
import { WEIGHT_CLASSES } from "@/lib/constants";
import { formatDobIndo, calculateAge } from "@/lib/excelExport";

interface ModalWeighInPrintProps {
  isOpen: boolean;
  athletes: Athlete[];
  onClose: () => void;
}

export default function ModalWeighInPrint({
  isOpen,
  athletes,
  onClose,
}: ModalWeighInPrintProps) {
  const [selectedClass, setSelectedClass] = useState("KELAS 48 KG");
  const [selectedGender, setSelectedGender] = useState<"PUTRA" | "PUTRI">("PUTRA");

  if (!isOpen) return null;

  const currentList = athletes.filter(
    (a) =>
      a.status === "Aktif" &&
      a.kelas === selectedClass &&
      a.kategori === selectedGender
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 duration-150">
        {/* Modal Controls (Not Printed) */}
        <div className="px-5 py-3.5 bg-slate-100 border-b border-slate-300 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">Pilih Kategori:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-2.5 py-1.5 rounded border border-slate-300 text-xs font-bold"
            >
              {WEIGHT_CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value as "PUTRA" | "PUTRI")}
              className="px-2.5 py-1.5 rounded border border-slate-300 text-xs font-bold"
            >
              <option value="PUTRA">PUTRA</option>
              <option value="PUTRI">PUTRI</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Dokumen</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-600 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Weigh-In Document */}
        <div className="p-8 space-y-6 printable-content">
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-4 space-y-1">
            <h2 className="text-sm font-bold tracking-widest uppercase">
              PENGURUS PROVINSI MUAYTHAI INDONESIA (KALBAR)
            </h2>
            <h1 className="text-xl font-extrabold uppercase tracking-tight">
              FORMULIR RESMI TIMBANG BADAN &amp; CEK KESEHATAN
            </h1>
            <p className="text-xs text-slate-600">
              PEKAN OLAHRAGA PROVINSI (PORPROV) XIV KALIMANTAN BARAT — CABOR MUAYTHAI
            </p>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 text-xs font-semibold gap-2 py-2">
            <div>
              <p>Kelas Berat: <span className="font-extrabold text-black">{selectedClass}</span></p>
              <p>Kategori: <span className="font-extrabold text-black">{selectedGender}</span></p>
            </div>
            <div className="text-right">
              <p>Tanggal Timbang: ............................................</p>
              <p>Waktu: 07.00 - 09.00 WIB</p>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-slate-200 border-b border-black text-[11px] font-extrabold uppercase text-center">
                <th className="border border-black py-2 px-2 w-10">No</th>
                <th className="border border-black py-2 px-3 text-left">Nama Lengkap Atlet</th>
                <th className="border border-black py-2 px-3 text-left">Kontingen</th>
                <th className="border border-black py-2 px-2 w-16">Usia</th>
                <th className="border border-black py-2 px-2 w-24">Target (Kg)</th>
                <th className="border border-black py-2 px-2 w-24">Timbang (Kg)</th>
                <th className="border border-black py-2 px-2 w-20">Medis</th>
                <th className="border border-black py-2 px-3 w-28">Paraf Atlet</th>
              </tr>
            </thead>
            <tbody>
              {currentList.map((a, idx) => (
                <tr key={a.id} className="border-b border-black">
                  <td className="border border-black py-2.5 px-2 text-center font-mono">{idx + 1}</td>
                  <td className="border border-black py-2.5 px-3 font-bold uppercase">{a.nama}</td>
                  <td className="border border-black py-2.5 px-3">{a.kontingen}</td>
                  <td className="border border-black py-2.5 px-2 text-center">{calculateAge(a.dob)}</td>
                  <td className="border border-black py-2.5 px-2 text-center font-mono">{selectedClass.replace("KELAS ", "")}</td>
                  <td className="border border-black py-2.5 px-2 text-center">............</td>
                  <td className="border border-black py-2.5 px-2 text-center">[ ] Fit</td>
                  <td className="border border-black py-2.5 px-3 text-center">............</td>
                </tr>
              ))}
              {/* Extra blank lines for walk-ins */}
              {[1, 2].map((n) => (
                <tr key={`blank-${n}`} className="border-b border-black">
                  <td className="border border-black py-3 px-2 text-center font-mono">{currentList.length + n}</td>
                  <td className="border border-black py-3 px-3"></td>
                  <td className="border border-black py-3 px-3"></td>
                  <td className="border border-black py-3 px-2"></td>
                  <td className="border border-black py-3 px-2 text-center">{selectedClass.replace("KELAS ", "")}</td>
                  <td className="border border-black py-3 px-2"></td>
                  <td className="border border-black py-3 px-2 text-center">[ ] Fit</td>
                  <td className="border border-black py-3 px-3"></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signature Block */}
          <div className="grid grid-cols-2 pt-8 text-xs text-center">
            <div className="space-y-16">
              <p>Dokter Pertandingan / Medis,</p>
              <p className="font-bold underline">( .................................................... )</p>
            </div>
            <div className="space-y-16">
              <p>Technical Delegate / Wasit Utama,</p>
              <p className="font-bold underline">( .................................................... )</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
