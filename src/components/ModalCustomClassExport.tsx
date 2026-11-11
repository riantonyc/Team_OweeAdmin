"use client";

import React, { useState } from "react";
import {
  X,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  Layers,
  Users2,
  SlidersHorizontal,
  Palette,
  Check,
} from "lucide-react";
import { Athlete } from "@/lib/types";
import { WEIGHT_CLASSES, KALBAR_CONTINGENTS } from "@/lib/constants";
import {
  exportCustomClassTableToExcel,
  CustomExportConfig,
} from "@/lib/customExcelExport";
import { useToast } from "./Toast";

interface ModalCustomClassExportProps {
  isOpen: boolean;
  athletes: Athlete[];
  initialClass?: string;
  onClose: () => void;
}

export default function ModalCustomClassExport({
  isOpen,
  athletes,
  initialClass,
  onClose,
}: ModalCustomClassExportProps) {
  const { showToast } = useToast();

  // Active configuration state
  const [activeTab, setActiveTab] = useState<"preset" | "custom">("preset");
  const [selectedPreset, setSelectedPreset] = useState<
    "merged_class" | "by_contingent" | "side_by_side" | "flat"
  >("merged_class");

  const [groupBy, setGroupBy] = useState<"class" | "contingent" | "flat">("class");
  const [genderLayout, setGenderLayout] = useState<
    "sideBySide" | "merged" | "putraOnly" | "putriOnly"
  >("merged");

  const [selectedClasses, setSelectedClasses] = useState<string[]>(
    initialClass && initialClass !== "ALL" ? [initialClass] : ["ALL"]
  );
  const [selectedContingents, setSelectedContingents] = useState<string[]>(["ALL"]);
  const [statusFilter, setStatusFilter] = useState<"Aktif" | "ALL">("Aktif");

  const [columns, setColumns] = useState({
    no: true,
    nama: true,
    kontingen: true,
    kelas: true,
    kategori: true,
    dob: true,
    usia: true,
    temuan: true,
    catatan: false,
  });

  const [title, setTitle] = useState("TABEL ATLET CABOR MUAYTHAI — PORPROV XIV KALBAR");
  const [sheetName, setSheetName] = useState("Tabel_Per_Kelas");
  const [themeColor, setThemeColor] = useState<"navy" | "emerald" | "monochrome" | "slate">(
    "navy"
  );

  if (!isOpen) return null;

  // Handler for 1-Click Presets
  const applyPreset = (preset: "merged_class" | "by_contingent" | "side_by_side" | "flat") => {
    setSelectedPreset(preset);
    if (preset === "merged_class") {
      setGroupBy("class");
      setGenderLayout("merged");
      setColumns((prev) => ({ ...prev, kategori: true, kontingen: true, kelas: false }));
      setTitle("TABEL PER KELAS — PUTRA & PUTRI GABUNG (1 SHEET)");
      setSheetName("Tabel_Kelas_Gabung");
    } else if (preset === "by_contingent") {
      setGroupBy("contingent");
      setGenderLayout("merged");
      setColumns((prev) => ({ ...prev, kategori: true, kontingen: false, kelas: true }));
      setTitle("TABEL ATLET PER KONTINGEN KABUPATEN/KOTA (1 SHEET)");
      setSheetName("Tabel_Per_Kontingen");
    } else if (preset === "side_by_side") {
      setGroupBy("class");
      setGenderLayout("sideBySide");
      setColumns((prev) => ({ ...prev, kategori: true, kontingen: true, kelas: false }));
      setTitle("TABEL PER KELAS BERDAMPINGAN BOOK1 (1 SHEET)");
      setSheetName("Book1_Berdampingan");
    } else if (preset === "flat") {
      setGroupBy("flat");
      setGenderLayout("merged");
      setColumns((prev) => ({ ...prev, kategori: true, kontingen: true, kelas: true }));
      setTitle("TABEL MASTER SELURUH ATLET (1 SHEET)");
      setSheetName("Master_Semua_Atlet");
    }
  };

  // Calculate live preview metrics
  const activeCount = athletes.filter((a) => {
    if (statusFilter === "Aktif" && a.status !== "Aktif") return false;
    if (
      selectedClasses.length > 0 &&
      !selectedClasses.includes("ALL") &&
      !selectedClasses.includes(a.kelas)
    ) {
      return false;
    }
    if (
      selectedContingents.length > 0 &&
      !selectedContingents.includes("ALL") &&
      !selectedContingents.includes(a.kontingen)
    ) {
      return false;
    }
    if (genderLayout === "putraOnly" && a.kategori !== "PUTRA") return false;
    if (genderLayout === "putriOnly" && a.kategori !== "PUTRI") return false;
    return true;
  }).length;

  const handleDownload = () => {
    try {
      const config: CustomExportConfig = {
        groupBy,
        genderLayout,
        selectedClasses,
        selectedContingents,
        statusFilter,
        columns,
        title,
        sheetName,
        themeColor,
      };

      exportCustomClassTableToExcel(athletes, config);
      showToast("Berhasil mendownload Excel 1 Sheet sesuai konfigurasi!", "success");
      onClose();
    } catch (err) {
      console.error(err);
      showToast("Gagal mengekspor file Excel kustom.", "error");
    }
  };

  // Helper toggle array filter
  const toggleClassSelection = (c: string) => {
    if (c === "ALL") {
      setSelectedClasses(["ALL"]);
      return;
    }
    let updated = selectedClasses.filter((x) => x !== "ALL");
    if (updated.includes(c)) {
      updated = updated.filter((x) => x !== c);
      if (updated.length === 0) updated = ["ALL"];
    } else {
      updated.push(c);
    }
    setSelectedClasses(updated);
  };

  const toggleContingentSelection = (k: string) => {
    if (k === "ALL") {
      setSelectedContingents(["ALL"]);
      return;
    }
    let updated = selectedContingents.filter((x) => x !== "ALL");
    if (updated.includes(k)) {
      updated = updated.filter((x) => x !== k);
      if (updated.length === 0) updated = ["ALL"];
    } else {
      updated.push(k);
    }
    setSelectedContingents(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slateCard border border-slateBorder rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#1F3864] via-slateElevated to-slateCard border-b border-slateBorder flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-extrabold text-sm shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  OUTPUT 1 SHEET EXCEL
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Tabel Per Kelas Custom
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                Konfigurator Cetak &amp; Export Tabel Excel
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Mode Sub-Tabs */}
        <div className="px-5 py-2.5 bg-carbon/90 border-b border-slateBorder flex items-center justify-between gap-2 shrink-0">
          <div className="inline-flex rounded-lg border border-slateBorder p-0.5 bg-slateElevated">
            <button
              onClick={() => setActiveTab("preset")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === "preset"
                  ? "bg-byonBlue text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Preset Cepat (1-Klik)</span>
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === "custom"
                  ? "bg-byonBlue text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Pengaturan Kustom Detail</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-300 font-mono hidden sm:flex items-center gap-1.5 bg-slateElevated px-2.5 py-1 rounded-lg border border-slateBorder">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{activeCount} atlet terpilih</span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
          {/* TAB 1: PRESET CEPAT (1-KLIK) */}
          {activeTab === "preset" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Pilih format struktur tabel siap pakai sesuai kebutuhan laporan Anda:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Preset 1: Putra & Putri Gabung */}
                <div
                  onClick={() => applyPreset("merged_class")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedPreset === "merged_class"
                      ? "border-emerald-500 bg-emerald-950/20 shadow-md ring-1 ring-emerald-500"
                      : "border-slateBorder bg-carbon hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-white flex items-center gap-1.5 text-xs sm:text-sm">
                      <Users2 className="w-4 h-4 text-blue-400" />
                      Putra &amp; Putri Gabung (1 Tabel / Kelas)
                    </span>
                    {selectedPreset === "merged_class" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Setiap kelas memiliki 1 tabel gabungan rapi dengan kolom gender (PUTRA / PUTRI). Sangat mudah dibaca &amp; hemat tempat cetak.
                  </p>
                </div>

                {/* Preset 2: Terpisah Antar Kontingen */}
                <div
                  onClick={() => applyPreset("by_contingent")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedPreset === "by_contingent"
                      ? "border-emerald-500 bg-emerald-950/20 shadow-md ring-1 ring-emerald-500"
                      : "border-slateBorder bg-carbon hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-white flex items-center gap-1.5 text-xs sm:text-sm">
                      <Layers className="w-4 h-4 text-amber-400" />
                      Tabel Terpisah Antar Kontingen
                    </span>
                    {selectedPreset === "by_contingent" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Tiap kabupaten/kota (Mempawah, Ketapang, dll.) dibuatkan tabel tersendiri dalam 1 sheet dengan daftar kelas dan total atletnya.
                  </p>
                </div>

                {/* Preset 3: Book1 Klasik Berdampingan */}
                <div
                  onClick={() => applyPreset("side_by_side")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedPreset === "side_by_side"
                      ? "border-emerald-500 bg-emerald-950/20 shadow-md ring-1 ring-emerald-500"
                      : "border-slateBorder bg-carbon hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-white flex items-center gap-1.5 text-xs sm:text-sm">
                      <Sparkles className="w-4 h-4 text-blue-300" />
                      Book1 Berdampingan (Putra Kiri, Putri Kanan)
                    </span>
                    {selectedPreset === "side_by_side" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Format resmi Book1 berdampingan biru (<span className="text-[#38BDF8]">#2E75B6</span>) dan merah (<span className="text-[#F87171]">#C0504D</span>) khusus 1 sheet saja.
                  </p>
                </div>

                {/* Preset 4: Flat Unified List */}
                <div
                  onClick={() => applyPreset("flat")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedPreset === "flat"
                      ? "border-emerald-500 bg-emerald-950/20 shadow-md ring-1 ring-emerald-500"
                      : "border-slateBorder bg-carbon hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-white flex items-center gap-1.5 text-xs sm:text-sm">
                      <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                      Tabel Tunggal Terpadu (Flat List)
                    </span>
                    {selectedPreset === "flat" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Satu tabel besar terpadu berisi seluruh atlet dari kelas &amp; kontingen terpilih, diurutkan menurut kelas &amp; gender.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PENGATURAN KUSTOM DETAIL */}
          {activeTab === "custom" && (
            <div className="space-y-4">
              {/* Group By & Gender Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-carbon border border-slateBorder rounded-xl p-3 space-y-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
                    1. Pengelompokan Tabel (Grouping)
                  </label>
                  <select
                    value={groupBy}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setGroupBy(val);
                      if (val !== "class" && genderLayout === "sideBySide") {
                        setGenderLayout("merged");
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-slateElevated border border-slateBorder text-xs sm:text-sm text-white font-semibold focus:outline-none focus:border-byonBlueLight min-h-[40px]"
                  >
                    <option value="class">Per Kelas Berat Badan (45kg, 48kg, dst)</option>
                    <option value="contingent">Tabel Terpisah Antar Kontingen (Kab/Kota)</option>
                    <option value="flat">Tabel Tunggal Terpadu (Flat Semua Atlet)</option>
                  </select>
                </div>

                <div className="bg-carbon border border-slateBorder rounded-xl p-3 space-y-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
                    2. Tata Letak Gender (Putra &amp; Putri)
                  </label>
                  <select
                    value={genderLayout}
                    onChange={(e) => setGenderLayout(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slateElevated border border-slateBorder text-xs sm:text-sm text-white font-semibold focus:outline-none focus:border-byonBlueLight min-h-[40px]"
                  >
                    <option value="merged">Putra &amp; Putri Gabung (1 Kolom Vertikal)</option>
                    {groupBy === "class" && (
                      <option value="sideBySide">Berdampingan (Putra Kiri, Putri Kanan)</option>
                    )}
                    <option value="putraOnly">Hanya Atlet PUTRA Saja</option>
                    <option value="putriOnly">Hanya Atlet PUTRI Saja</option>
                  </select>
                </div>
              </div>

              {/* Filter Kelas */}
              <div className="bg-carbon border border-slateBorder rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
                    3. Filter Kelas Berat Badan
                  </label>
                  <button
                    onClick={() => setSelectedClasses(["ALL"])}
                    className="text-[11px] text-blue-400 hover:underline cursor-pointer"
                  >
                    Pilih Semua Kelas (11)
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedClasses(["ALL"])}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      selectedClasses.includes("ALL")
                        ? "bg-byonBlue text-white"
                        : "bg-slateElevated text-slate-400 hover:text-white"
                    }`}
                  >
                    Semua Kelas
                  </button>
                  {WEIGHT_CLASSES.map((c) => {
                    const isSelected = selectedClasses.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => toggleClassSelection(c)}
                        className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                          isSelected && !selectedClasses.includes("ALL")
                            ? "bg-byonBlue text-white border border-blue-400"
                            : "bg-slateElevated text-slate-400 hover:text-white border border-slateBorder/60"
                        }`}
                      >
                        {c.replace("UNDER ", "U-")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter Kontingen */}
              <div className="bg-carbon border border-slateBorder rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
                    4. Filter Kontingen Kabupaten / Kota
                  </label>
                  <button
                    onClick={() => setSelectedContingents(["ALL"])}
                    className="text-[11px] text-blue-400 hover:underline cursor-pointer"
                  >
                    Pilih Semua Kontingen (14)
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedContingents(["ALL"])}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      selectedContingents.includes("ALL")
                        ? "bg-byonBlue text-white"
                        : "bg-slateElevated text-slate-400 hover:text-white"
                    }`}
                  >
                    Semua Kontingen
                  </button>
                  {KALBAR_CONTINGENTS.map((k) => {
                    const isSelected = selectedContingents.includes(k);
                    return (
                      <button
                        key={k}
                        onClick={() => toggleContingentSelection(k)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                          isSelected && !selectedContingents.includes("ALL")
                            ? "bg-byonBlue text-white border border-blue-400"
                            : "bg-slateElevated text-slate-400 hover:text-white border border-slateBorder/60"
                        }`}
                      >
                        {k}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Kolom Checklist */}
              {genderLayout !== "sideBySide" && (
                <div className="bg-carbon border border-slateBorder rounded-xl p-3 space-y-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
                    5. Kolom Data yang Ditampilkan
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={columns.no}
                        onChange={(e) => setColumns({ ...columns, no: e.target.checked })}
                        className="accent-byonBlue rounded"
                      />
                      <span>No Urut</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={columns.nama}
                        disabled
                        className="accent-byonBlue rounded"
                      />
                      <span>Nama Atlet</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={columns.kontingen}
                        onChange={(e) => setColumns({ ...columns, kontingen: e.target.checked })}
                        className="accent-byonBlue rounded"
                      />
                      <span>Kontingen</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={columns.kelas}
                        onChange={(e) => setColumns({ ...columns, kelas: e.target.checked })}
                        className="accent-byonBlue rounded"
                      />
                      <span>Kelas Berat</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={columns.kategori}
                        onChange={(e) => setColumns({ ...columns, kategori: e.target.checked })}
                        className="accent-byonBlue rounded"
                      />
                      <span>Gender (PA/PI)</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={columns.dob}
                        onChange={(e) => setColumns({ ...columns, dob: e.target.checked })}
                        className="accent-byonBlue rounded"
                      />
                      <span>Tgl Lahir</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={columns.usia}
                        onChange={(e) => setColumns({ ...columns, usia: e.target.checked })}
                        className="accent-byonBlue rounded"
                      />
                      <span>Usia</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={columns.temuan}
                        onChange={(e) => setColumns({ ...columns, temuan: e.target.checked })}
                        className="accent-byonBlue rounded"
                      />
                      <span>THB (Temuan)</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={columns.catatan}
                        onChange={(e) => setColumns({ ...columns, catatan: e.target.checked })}
                        className="accent-byonBlue rounded"
                      />
                      <span>Catatan Khusus</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PALET WARNA TEMA & JUDUL */}
          <div className="bg-carbon border border-slateBorder rounded-xl p-3 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-300 mb-1">
                  Judul Dokumen di Excel
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slateElevated border border-slateBorder text-xs text-white focus:outline-none focus:border-byonBlueLight min-h-[36px]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-300 mb-1">
                  Nama Sheet (Maks 31 Karakter)
                </label>
                <input
                  type="text"
                  maxLength={31}
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slateElevated border border-slateBorder text-xs text-white focus:outline-none focus:border-byonBlueLight min-h-[36px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-blue-400" />
                <span>Pilihan Palet Warna Tabel:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "navy", label: "Navy Resmi (#1F3864)", color: "bg-[#1F3864]" },
                  { id: "emerald", label: "Emerald Sport", color: "bg-[#065F46]" },
                  { id: "monochrome", label: "Monokrom (Siap Cetak)", color: "bg-[#374151]" },
                  { id: "slate", label: "Dark Slate", color: "bg-[#0F172A]" },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setThemeColor(th.id as any)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                      themeColor === th.id
                        ? "border-emerald-400 bg-slateElevated font-bold text-white shadow-sm"
                        : "border-slateBorder bg-carbon text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${th.color} shrink-0`}></span>
                    <span className="truncate">{th.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ringkasan Output Sebelum Download */}
          <div className="p-3 rounded-xl bg-blue-950/25 border border-blue-500/30 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-extrabold text-white">Struktur File: </span>
              <span>
                {groupBy === "class" && genderLayout === "sideBySide"
                  ? "Tabel Berdampingan Book1 (Putra/Putri)"
                  : groupBy === "class"
                  ? "Tabel Per Kelas (Putra & Putri Gabung)"
                  : groupBy === "contingent"
                  ? "Tabel Terpisah Antar Kontingen"
                  : "Tabel Tunggal Terpadu"}
              </span>
              <span className="text-slate-400"> • </span>
              <span className="text-emerald-400 font-bold">{activeCount} Atlet Lolos Filter</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[11px] self-start sm:self-auto border border-emerald-500/30">
              1 Sheet Saja
            </span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 bg-carbon border-t border-slateBorder flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slateElevated hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold min-h-[40px] cursor-pointer"
          >
            Batal
          </button>

          <button
            onClick={handleDownload}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 min-h-[40px] cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Excel 1 Sheet</span>
          </button>
        </div>
      </div>
    </div>
  );
}

