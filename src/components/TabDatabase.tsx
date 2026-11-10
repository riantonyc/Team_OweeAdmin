"use client";

import React, { useState, useEffect } from "react";
import { Search, X, RotateCcw, Eye, Edit3, Trash2 } from "lucide-react";
import { Athlete } from "@/lib/types";
import { KALBAR_CONTINGENTS, WEIGHT_CLASSES } from "@/lib/constants";
import { formatDobIndo, calculateAge } from "@/lib/excelExport";

interface TabDatabaseProps {
  athletes: Athlete[];
  contingentFilter?: string;
  onContingentFilterChange?: (kontingen: string) => void;
  onOpenDetail: (id: number) => void;
  onOpenEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onInlineUpdate: (id: number, field: string, value: any) => void;
}

export default function TabDatabase({
  athletes,
  contingentFilter = "ALL",
  onContingentFilterChange,
  onOpenDetail,
  onOpenEdit,
  onDelete,
  onInlineUpdate,
}: TabDatabaseProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKontingen, setFilterKontingen] = useState(contingentFilter);
  const [filterKelas, setFilterKelas] = useState("ALL");
  const [filterKategori, setFilterKategori] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("kelas");

  // Sinkronkan jika filter kontingen berubah dari luar (misal klik di Tab Rekap Matriks)
  useEffect(() => {
    if (contingentFilter !== undefined) {
      setFilterKontingen(contingentFilter);
    }
  }, [contingentFilter]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterKontingen("ALL");
    onContingentFilterChange?.("ALL");
    setFilterKelas("ALL");
    setFilterKategori("ALL");
    setFilterStatus("ALL");
    setSortOrder("kelas");
  };

  // Filter athletes
  let filtered = athletes.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      a.nama.toLowerCase().includes(q) ||
      a.kontingen.toLowerCase().includes(q) ||
      a.kelas.toLowerCase().includes(q);
    const matchKontingen = filterKontingen === "ALL" || a.kontingen === filterKontingen;
    const matchKelas = filterKelas === "ALL" || a.kelas === filterKelas;
    const matchKategori = filterKategori === "ALL" || a.kategori === filterKategori;
    const matchStatus = filterStatus === "ALL" || a.status === filterStatus;

    return matchSearch && matchKontingen && matchKelas && matchKategori && matchStatus;
  });

  // Sort athletes
  filtered.sort((a, b) => {
    if (sortOrder === "nama") return a.nama.localeCompare(b.nama);
    if (sortOrder === "kontingen") {
      const cmp = a.kontingen.localeCompare(b.kontingen);
      if (cmp !== 0) return cmp;
      return (
        WEIGHT_CLASSES.indexOf(a.kelas as any) - WEIGHT_CLASSES.indexOf(b.kelas as any)
      );
    }
    if (sortOrder === "terbaru") return b.id - a.id;

    // Default: kelas -> gender -> kontingen -> nama
    const idxA = WEIGHT_CLASSES.indexOf(a.kelas as any);
    const idxB = WEIGHT_CLASSES.indexOf(b.kelas as any);
    if (idxA !== idxB) return idxA - idxB;
    if (a.kategori !== b.kategori) return a.kategori === "PUTRA" ? -1 : 1;
    const kCmp = a.kontingen.localeCompare(b.kontingen);
    if (kCmp !== 0) return kCmp;
    return a.nama.localeCompare(b.nama);
  });

  return (
    <section className="space-y-4">
      {/* Search & Multi-Filter Control Box */}
      <div className="bg-slateCard border border-slateBorder rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-2 lg:col-span-4 relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Cari Nama / Kontingen / Kelas
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik nama atlet, kontingen (mis. Aldo, Mempawah)..."
                className="w-full pl-9 pr-8 py-2 rounded-lg bg-carbon border border-slateBorder text-sm text-white placeholder-slate-500 focus:outline-none focus:border-byonBlueLight min-h-[40px]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Kontingen */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Filter Kontingen
            </label>
            <select
              value={filterKontingen}
              onChange={(e) => {
                setFilterKontingen(e.target.value);
                onContingentFilterChange?.(e.target.value);
              }}
              className="w-full px-3 py-2 rounded-lg bg-carbon border border-slateBorder text-xs sm:text-sm text-white focus:outline-none focus:border-byonBlueLight min-h-[40px]"
            >
              <option value="ALL">Semua Kontingen (14)</option>
              {KALBAR_CONTINGENTS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kelas */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Filter Kelas Berat
            </label>
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-carbon border border-slateBorder text-xs sm:text-sm text-white focus:outline-none focus:border-byonBlueLight min-h-[40px]"
            >
              <option value="ALL">Semua Kelas (11)</option>
              {WEIGHT_CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kategori */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Filter Gender
            </label>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-carbon border border-slateBorder text-xs sm:text-sm text-white focus:outline-none focus:border-byonBlueLight min-h-[40px]"
            >
              <option value="ALL">Putra &amp; Putri</option>
              <option value="PUTRA">PUTRA (PA)</option>
              <option value="PUTRI">PUTRI (PI)</option>
            </select>
          </div>

          {/* Filter Status & Reset */}
          <div className="lg:col-span-2 flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-carbon border border-slateBorder text-xs sm:text-sm text-white focus:outline-none focus:border-byonBlueLight min-h-[40px]"
              >
                <option value="ALL">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Dicabut">Dicabut / Nonaktif</option>
              </select>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-3 py-2 rounded-lg bg-slateElevated hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slateBorder min-h-[40px] shrink-0 flex items-center justify-center gap-1"
              title="Reset Filter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Showing counter & sort order */}
        <div className="mt-3 pt-3 border-t border-slateBorder/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Menampilkan <span className="font-bold text-white">{filtered.length}</span> dari {athletes.length} atlet
            </span>
            {filterKontingen !== "ALL" && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 text-[11px] flex items-center gap-1">
                Kontingen: {filterKontingen}
                <button
                  onClick={() => {
                    setFilterKontingen("ALL");
                    onContingentFilterChange?.("ALL");
                  }}
                  className="hover:text-white ml-0.5 cursor-pointer"
                  title="Hapus filter kontingen"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 hidden sm:inline md:hidden">
              👉 Geser tabel ke kanan untuk melihat seluruh kolom
            </span>
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span>Urut:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-carbon border border-slateBorder text-xs text-slate-200 min-h-[32px]"
              >
                <option value="kelas">Kelas &amp; Gender (Book1)</option>
                <option value="kontingen">Kontingen (A-Z)</option>
                <option value="nama">Nama (A-Z)</option>
                <option value="terbaru">Terbaru</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Hanya Tabel Database */}
      {filtered.length === 0 ? (
        <div className="bg-slateCard border border-slateBorder rounded-xl p-12 text-center text-slate-400 space-y-2">
          <p className="text-base font-bold text-slate-300">
            Tidak ada data atlet yang cocok dengan pencarian / filter.
          </p>
          <p className="text-xs">
            Coba ubah kata kunci pencarian atau klik tombol Reset Filter.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-2 px-4 py-2 rounded-lg bg-byonBlue text-white font-bold text-xs"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="bg-slateCard border border-slateBorder rounded-xl overflow-hidden shadow-xl">
          <div className="sm:hidden px-3 py-1.5 bg-slateElevated/60 border-b border-slateBorder text-[11px] text-slate-400 flex items-center justify-between">
            <span>Tabel Database Atlet</span>
            <span className="text-blue-400 font-medium">👉 Geser untuk melihat semua kolom</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px] md:min-w-full">
              <thead>
                <tr className="bg-slateElevated/80 border-b border-slateBorder text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
                  <th className="py-3 px-3 text-center w-12">No</th>
                  <th className="py-3 px-4">Nama Lengkap Atlet</th>
                  <th className="py-3 px-3">Kontingen (Ubah Cepat)</th>
                  <th className="py-3 px-3 text-center">Kategori</th>
                  <th className="py-3 px-3">Kelas Berat Badan (Ubah Cepat)</th>
                  <th className="py-3 px-3">Tgl Lahir &amp; Usia</th>
                  <th className="py-3 px-2 text-center">THB</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slateBorder/60 text-sm">
                {filtered.map((a, index) => {
                  const isPutra = a.kategori === "PUTRA";
                  const isAktif = a.status === "Aktif";

                  return (
                    <tr
                      key={a.id}
                      className={`hover:bg-slateElevated/50 transition-colors ${
                        !isAktif ? "opacity-60 bg-rose-950/10" : ""
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-mono text-xs text-slate-400 tabular-nums">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-4">
                        <button
                          onClick={() => onOpenDetail(a.id)}
                          className="text-left group cursor-pointer"
                        >
                          <div className="font-bold text-white group-hover:text-blue-400 transition-colors">
                            {a.nama}
                          </div>
                          {a.catatan && (
                            <div className="text-[11px] text-amber-300/80 italic">{a.catatan}</div>
                          )}
                        </button>
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={a.kontingen}
                          onChange={(e) => onInlineUpdate(a.id, "kontingen", e.target.value)}
                          className="px-2 py-1.5 rounded-lg bg-carbon border border-slateBorder hover:border-slate-500 text-xs font-semibold text-slate-200 focus:outline-none focus:border-byonBlueLight cursor-pointer"
                        >
                          {KALBAR_CONTINGENTS.map((k) => (
                            <option key={k} value={k}>
                              {k}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() =>
                            onInlineUpdate(a.id, "kategori", isPutra ? "PUTRI" : "PUTRA")
                          }
                          className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${
                            isPutra
                              ? "bg-byonBlue/20 text-blue-300 border border-blue-500/30 hover:bg-byonBlue/30"
                              : "bg-putriRed/20 text-rose-300 border border-rose-500/30 hover:bg-putriRed/30"
                          }`}
                        >
                          {a.kategori}
                        </button>
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={a.kelas}
                          onChange={(e) => onInlineUpdate(a.id, "kelas", e.target.value)}
                          className="px-2 py-1.5 rounded-lg bg-carbon border border-slateBorder hover:border-blue-400 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-byonBlueLight cursor-pointer"
                        >
                          {WEIGHT_CLASSES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5 px-3 tabular-nums">
                        <div className="text-xs font-semibold text-slate-200">
                          {formatDobIndo(a.dob)}
                        </div>
                        <div className="text-[11px] text-slate-400">{calculateAge(a.dob)}</div>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${
                            a.temuan === "Ya"
                              ? "bg-blue-500/15 text-blue-300"
                              : "text-slate-500"
                          }`}
                        >
                          {a.temuan}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() =>
                            onInlineUpdate(a.id, "status", isAktif ? "Dicabut" : "Aktif")
                          }
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                            isAktif
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                          }`}
                        >
                          {a.status}
                        </button>
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onOpenDetail(a.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-slateElevated hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slateBorder cursor-pointer"
                            title="Lihat Profil"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenEdit(a.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-byonBlue/20 hover:bg-byonBlue/35 text-blue-300 border border-blue-500/30 text-xs font-semibold cursor-pointer"
                            title="Edit Atlet"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(a.id)}
                            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 cursor-pointer"
                            title="Hapus Atlet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
