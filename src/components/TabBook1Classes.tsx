"use client";

import React, { useState } from "react";
import { Download, Plus, FileSpreadsheet } from "lucide-react";
import { Athlete } from "@/lib/types";
import { WEIGHT_CLASSES } from "@/lib/constants";
import { formatDobIndo } from "@/lib/excelExport";
import ModalCustomClassExport from "./ModalCustomClassExport";

interface TabBook1ClassesProps {
  athletes: Athlete[];
  onOpenDetail: (id: number) => void;
  onOpenAddWithClass: (kelas: string) => void;
  onOpenExcelModal: () => void;
}

export default function TabBook1Classes({
  athletes,
  onOpenDetail,
  onOpenAddWithClass,
  onOpenExcelModal,
}: TabBook1ClassesProps) {
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [isCustomExportModalOpen, setIsCustomExportModalOpen] = useState(false);

  const classesToShow =
    selectedClass === "ALL"
      ? WEIGHT_CLASSES
      : WEIGHT_CLASSES.filter((c) => c === selectedClass);

  return (
    <section className="space-y-6">
      {/* Top Banner & Jump Filter */}
      <div className="bg-slateCard border border-slateBorder rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-[#1F3864] text-white border border-blue-400/30">
              FORMAT RESMI BOOK1 EXCEL
            </span>
            <h2 className="text-sm sm:text-base font-extrabold text-white">
              Tabel Per Kelas Berat Badan (Putra &amp; Putri Berdampingan)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Warna header (<span className="text-[#60A5FA] font-semibold">Navy #1F3864</span>,{" "}
            <span className="text-[#38BDF8] font-semibold">Biru Putra #2E75B6</span>,{" "}
            <span className="text-[#F87171] font-semibold">Merah Putri #C0504D</span>) sama persis dengan hasil Export Excel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-lg bg-carbon border border-slateBorder text-xs sm:text-sm text-white font-semibold min-h-[40px]"
          >
            <option value="ALL">Tampilkan Semua Kelas (11)</option>
            {WEIGHT_CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Tombol Utama: Cetak / Export Excel 1 Sheet dengan Konfigurasi */}
          <button
            onClick={() => setIsCustomExportModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer flex items-center gap-1.5 min-h-[40px] transition-all"
            title="Buka Konfigurator Cetak Excel 1 Sheet (Bisa atur gabung putra-putri, per kontingen, dll)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Cetak Excel 1 Sheet (Konfigurasi)</span>
          </button>

          {/* Tombol Sekunder: Export Master Book1 4 Sheet */}
          <button
            onClick={onOpenExcelModal}
            className="px-3 py-2 rounded-lg bg-slateElevated hover:bg-slate-700 text-slate-300 border border-slateBorder font-semibold text-xs sm:text-sm cursor-pointer flex items-center gap-1.5 min-h-[40px] transition-all"
            title="Download File Master Excel Lengkap 4 Sheet"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span className="hidden xl:inline">Master (4 Sheet)</span>
          </button>
        </div>
      </div>

      {/* Class Cards */}
      <div className="space-y-6">
        {classesToShow.map((kelasName) => {
          const putraList = athletes
            .filter(
              (a) =>
                a.status === "Aktif" &&
                a.kelas === kelasName &&
                a.kategori === "PUTRA"
            )
            .sort(
              (a, b) =>
                a.kontingen.localeCompare(b.kontingen) || a.nama.localeCompare(b.nama)
            );

          const putriList = athletes
            .filter(
              (a) =>
                a.status === "Aktif" &&
                a.kelas === kelasName &&
                a.kategori === "PUTRI"
            )
            .sort(
              (a, b) =>
                a.kontingen.localeCompare(b.kontingen) || a.nama.localeCompare(b.nama)
            );

          const maxRows = Math.max(putraList.length, putriList.length, 1);

          return (
            <div
              key={kelasName}
              className="bg-slateCard border-2 border-[#1F3864] rounded-xl overflow-hidden shadow-xl"
            >
              {/* Class Header Banner */}
              <div className="px-4 py-3 bg-[#1F3864] border-b border-slateBorder flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <h3 className="text-sm sm:text-base font-extrabold tracking-wide text-white uppercase">
                    {kelasName}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="px-2.5 py-1 rounded bg-[#2E75B6] text-white border border-white/20">
                    Putra: {putraList.length}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-[#C0504D] text-white border border-white/20">
                    Putri: {putriList.length}
                  </span>
                  <button
                    onClick={() => onOpenAddWithClass(kelasName)}
                    className="ml-1 px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah</span>
                  </button>
                </div>
              </div>

              {/* Side-by-Side Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="divide-x divide-slateBorder border-b border-slateBorder text-xs font-extrabold uppercase tracking-wider">
                      <th colSpan={5} className="py-2.5 px-3 text-center bg-[#2E75B6] text-white">
                        PUTRA
                      </th>
                      <th className="w-3 bg-carbon/90"></th>
                      <th colSpan={5} className="py-2.5 px-3 text-center bg-[#C0504D] text-white">
                        PUTRI
                      </th>
                    </tr>
                    <tr className="divide-x divide-slateBorder/70 border-b border-slateBorder text-[11px] font-extrabold uppercase text-white">
                      <th className="py-2 px-2 text-center w-10 bg-[#2E75B6]/90">No</th>
                      <th className="py-2 px-3 bg-[#2E75B6]/90">Nama</th>
                      <th className="py-2 px-3 bg-[#2E75B6]/90">Kontingen</th>
                      <th className="py-2 px-2 text-center bg-[#2E75B6]/90">Tgl Lahir</th>
                      <th className="py-2 px-2 text-center w-16 bg-[#2E75B6]/90">Temuan</th>
                      <th className="w-3 bg-carbon/90"></th>
                      <th className="py-2 px-2 text-center w-10 bg-[#C0504D]/90">No</th>
                      <th className="py-2 px-3 bg-[#C0504D]/90">Nama</th>
                      <th className="py-2 px-3 bg-[#C0504D]/90">Kontingen</th>
                      <th className="py-2 px-2 text-center bg-[#C0504D]/90">Tgl Lahir</th>
                      <th className="py-2 px-2 text-center w-16 bg-[#C0504D]/90">Temuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slateBorder/60">
                    {Array.from({ length: maxRows }).map((_, i) => {
                      const pa = putraList[i];
                      const pi = putriList[i];
                      const zebraClass = i % 2 === 1 ? "bg-slateElevated/25" : "bg-slateCard";

                      return (
                        <tr
                          key={i}
                          className={`divide-x divide-slateBorder/70 hover:bg-slateElevated/60 transition-colors ${zebraClass}`}
                        >
                          {/* PUTRA COLUMNS */}
                          <td className="py-2.5 px-2 text-center font-mono text-xs text-slate-300 tabular-nums">
                            {pa ? i + 1 : ""}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-white">
                            {pa ? (
                              <button
                                onClick={() => onOpenDetail(pa.id)}
                                className="hover:text-blue-400 text-left font-bold"
                              >
                                {pa.nama}
                              </button>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-xs font-medium text-slate-300">
                            {pa ? pa.kontingen : ""}
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono text-xs text-slate-300 tabular-nums">
                            {pa ? formatDobIndo(pa.dob) : ""}
                          </td>
                          <td
                            className={`py-2.5 px-2 text-center text-xs font-semibold ${
                              pa && pa.temuan === "Ya" ? "text-blue-300" : "text-slate-500"
                            }`}
                          >
                            {pa ? pa.temuan : ""}
                          </td>

                          {/* SEPARATOR COLUMN */}
                          <td className="w-3 bg-carbon/90"></td>

                          {/* PUTRI COLUMNS */}
                          <td className="py-2.5 px-2 text-center font-mono text-xs text-slate-300 tabular-nums">
                            {pi ? i + 1 : ""}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-white">
                            {pi ? (
                              <button
                                onClick={() => onOpenDetail(pi.id)}
                                className="hover:text-rose-400 text-left font-bold"
                              >
                                {pi.nama}
                              </button>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-xs font-medium text-slate-300">
                            {pi ? pi.kontingen : ""}
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono text-xs text-slate-300 tabular-nums">
                            {pi ? formatDobIndo(pi.dob) : ""}
                          </td>
                          <td
                            className={`py-2.5 px-2 text-center text-xs font-semibold ${
                              pi && pi.temuan === "Ya" ? "text-rose-300" : "text-slate-500"
                            }`}
                          >
                            {pi ? pi.temuan : ""}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="divide-x divide-slate-400/50 border-t-2 border-[#1F3864] text-xs font-extrabold">
                      <td className="py-2.5 px-3 text-center bg-[#D9E1F2] text-[#1F3864]">Jumlah</td>
                      <td className="py-2.5 px-3 text-center font-mono text-sm bg-[#D9E1F2] text-[#1F3864] tabular-nums">
                        {putraList.length}
                      </td>
                      <td colSpan={3} className="py-2.5 px-3 bg-[#D9E1F2] text-[#1F3864]/70 text-[11px]">
                        Atlet Putra Aktif
                      </td>
                      <td className="w-3 bg-carbon/90"></td>
                      <td className="py-2.5 px-3 text-center bg-[#F2DCDB] text-[#7A1C1A]">Jumlah</td>
                      <td className="py-2.5 px-3 text-center font-mono text-sm bg-[#F2DCDB] text-[#7A1C1A] tabular-nums">
                        {putriList.length}
                      </td>
                      <td colSpan={3} className="py-2.5 px-3 bg-[#F2DCDB] text-[#7A1C1A]/70 text-[11px]">
                        Atlet Putri Aktif
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Konfigurator Excel 1 Sheet */}
      <ModalCustomClassExport
        isOpen={isCustomExportModalOpen}
        athletes={athletes}
        initialClass={selectedClass}
        onClose={() => setIsCustomExportModalOpen(false)}
      />
    </section>
  );
}
