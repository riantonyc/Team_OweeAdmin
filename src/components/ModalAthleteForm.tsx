"use client";

import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { Athlete } from "@/lib/types";
import { KALBAR_CONTINGENTS, WEIGHT_CLASSES } from "@/lib/constants";

interface ModalAthleteFormProps {
  isOpen: boolean;
  athlete: Athlete | null;
  initialClass?: string;
  onClose: () => void;
  onSave: (data: Partial<Athlete>) => Promise<void>;
}

export default function ModalAthleteForm({
  isOpen,
  athlete,
  initialClass,
  onClose,
  onSave,
}: ModalAthleteFormProps) {
  const [nama, setNama] = useState("");
  const [kontingen, setKontingen] = useState("Mempawah");
  const [kategori, setKategori] = useState<"PUTRA" | "PUTRI">("PUTRA");
  const [kelas, setKelas] = useState("KELAS 48 KG");
  const [dob, setDob] = useState("2007-01-01");
  const [temuan, setTemuan] = useState<"Ya" | "-">("Ya");
  const [status, setStatus] = useState<"Aktif" | "Dicabut">("Aktif");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (athlete) {
      setNama(athlete.nama);
      setKontingen(athlete.kontingen);
      setKategori(athlete.kategori);
      setKelas(athlete.kelas);
      setDob(athlete.dob || "2007-01-01");
      setTemuan(athlete.temuan || "Ya");
      setStatus(athlete.status || "Aktif");
      setCatatan(athlete.catatan || "");
    } else {
      setNama("");
      setKontingen("Mempawah");
      setKategori("PUTRA");
      setKelas(initialClass || "KELAS 48 KG");
      setDob("2007-01-01");
      setTemuan("Ya");
      setStatus("Aktif");
      setCatatan("");
    }
  }, [athlete, initialClass, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    setLoading(true);
    try {
      await onSave({
        nama: nama.trim(),
        kontingen,
        kategori,
        kelas,
        dob,
        temuan,
        status,
        catatan: catatan.trim(),
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slateCard border border-slateBorder rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-slateElevated border-b border-slateBorder flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded ${
                athlete ? "bg-amber-500 text-carbon" : "bg-byonBlue text-white"
              }`}
            >
              {athlete ? "MODE EDIT" : "INPUT BARU"}
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-white">
              {athlete ? `Edit Data Atlet: ${athlete.nama}` : "Tambah Atlet Baru"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Nama Lengkap Atlet *
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: KRISNA JAYA"
              className="w-full px-3.5 py-2.5 rounded-lg bg-carbon border border-slateBorder text-sm text-white placeholder-slate-500 focus:outline-none focus:border-byonBlueLight min-h-[44px]"
            />
          </div>

          {/* Kontingen & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Kontingen Kabupaten/Kota *
              </label>
              <select
                value={kontingen}
                onChange={(e) => setKontingen(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-carbon border border-slateBorder text-xs sm:text-sm text-white focus:outline-none focus:border-byonBlueLight min-h-[44px]"
              >
                {KALBAR_CONTINGENTS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Kategori Gender *
              </label>
              <div className="grid grid-cols-2 gap-2 h-[44px]">
                <label
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border cursor-pointer font-bold text-xs transition-all ${
                    kategori === "PUTRA"
                      ? "bg-byonBlue border-blue-400 text-white shadow-md shadow-blue-600/30"
                      : "bg-carbon border-slateBorder text-slate-400 hover:text-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="formKategori"
                    value="PUTRA"
                    checked={kategori === "PUTRA"}
                    onChange={() => setKategori("PUTRA")}
                    className="sr-only"
                  />
                  <span>PUTRA</span>
                </label>

                <label
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border cursor-pointer font-bold text-xs transition-all ${
                    kategori === "PUTRI"
                      ? "bg-putriRed border-rose-400 text-white shadow-md shadow-rose-600/30"
                      : "bg-carbon border-slateBorder text-slate-400 hover:text-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="formKategori"
                    value="PUTRI"
                    checked={kategori === "PUTRI"}
                    onChange={() => setKategori("PUTRI")}
                    className="sr-only"
                  />
                  <span>PUTRI</span>
                </label>
              </div>
            </div>
          </div>

          {/* Kelas Berat Badan & Tanggal Lahir */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Kelas Berat Badan *
              </label>
              <select
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-carbon border border-slateBorder text-xs sm:text-sm font-mono font-bold text-amber-300 focus:outline-none focus:border-byonBlueLight min-h-[44px]"
              >
                {WEIGHT_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Tanggal Lahir *
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-carbon border border-slateBorder text-xs sm:text-sm text-white focus:outline-none focus:border-byonBlueLight min-h-[44px]"
              />
            </div>
          </div>

          {/* Temuan THB & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Temuan THB (Verifikasi)
              </label>
              <select
                value={temuan}
                onChange={(e) => setTemuan(e.target.value as "Ya" | "-")}
                className="w-full px-3 py-2.5 rounded-lg bg-carbon border border-slateBorder text-xs sm:text-sm text-white focus:outline-none focus:border-byonBlueLight min-h-[44px]"
              >
                <option value="Ya">Ya (Terverifikasi)</option>
                <option value="-">- (Belum / Tidak Ada)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Status Atlet
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "Aktif" | "Dicabut")}
                className="w-full px-3 py-2.5 rounded-lg bg-carbon border border-slateBorder text-xs sm:text-sm text-white focus:outline-none focus:border-byonBlueLight min-h-[44px]"
              >
                <option value="Aktif">Aktif (Bertanding)</option>
                <option value="Dicabut">Dicabut / Nonaktif</option>
              </select>
            </div>
          </div>

          {/* Catatan Khusus */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Catatan / Riwayat Tambahan (Opsional)
            </label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Update Tarung Ketapang, mutasi atlet, dll."
              className="w-full px-3.5 py-2 rounded-lg bg-carbon border border-slateBorder text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-byonBlueLight min-h-[40px]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slateBorder/60 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-lg bg-slateElevated hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm min-h-[44px]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-byonBlue hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 flex items-center gap-2 min-h-[44px]"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? "Menyimpan..." : "Simpan Data"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
