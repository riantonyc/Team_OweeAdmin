"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Download, RotateCcw, LogOut, ShieldCheck } from "lucide-react";
import { useToast } from "./Toast";

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenExcelModal: () => void;
  onResetData: () => void;
}

export default function Header({
  onOpenAddModal,
  onOpenExcelModal,
  onResetData,
}: HeaderProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      showToast("Berhasil logout dari sistem", "info");
      router.push("/login");
      router.refresh();
    } catch (err) {
      showToast("Gagal logout", "error");
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-carbon/90 backdrop-blur-md border-b border-slateBorder">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
        {/* Brand & Logo Identity */}
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-byonBlue/60 shadow-lg shadow-blue-600/30 shrink-0 bg-slateElevated">
            <Image
              src="/logo.jpg"
              alt="Team Oweee Official Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                TEAM OWEEE
              </span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-byonBlue/20 text-blue-400 border border-blue-500/30 rounded">
                PORPROV XIV KALBAR
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                CABOR MUAYTHAI
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-white mt-0.5 flex items-center gap-2">
              <span>SMART ADMIN DATABASE ATLET</span>
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-byonBlue hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-blue-600/25 transition-all cursor-pointer min-h-[40px]"
            title="Tambah Atlet Baru"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Atlet</span>
          </button>

          <button
            onClick={onOpenExcelModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition-all cursor-pointer min-h-[40px]"
            title="Export ke File Excel Rapi 4 Sheet"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Excel Book1 (.xlsx)</span>
            <span className="sm:hidden">Excel (.xlsx)</span>
          </button>

          <button
            onClick={onResetData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slateElevated hover:bg-slate-700 text-slate-300 border border-slateBorder font-medium text-xs sm:text-sm transition-all cursor-pointer min-h-[40px]"
            title="Kembalikan ke 68 Atlet Awal"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span className="hidden xl:inline">Reset (68 Atlet)</span>
          </button>

          {/* User Badge & Logout */}
          <div className="flex items-center gap-2 ml-auto sm:ml-2 pl-2 border-l border-slateBorder/60">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 bg-slateCard px-2.5 py-1.5 rounded-lg border border-slateBorder">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono font-bold text-white">teamowee</span>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold text-xs sm:text-sm transition-all cursor-pointer min-h-[40px]"
              title="Keluar dari akun admin"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
