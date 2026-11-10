"use client";

import React from "react";
import { Database, BookOpen, Grid, Trophy, Plus, Dna } from "lucide-react";

interface BottomBarProps {
  currentTab: string;
  onSelectTab: (tab: "database" | "classes" | "matrix" | "bracket" | "medals") => void;
  onOpenAddModal: () => void;
}

export default function BottomBar({
  currentTab,
  onSelectTab,
  onOpenAddModal,
}: BottomBarProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-carbon/95 backdrop-blur-lg border-t border-slateBorder px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Tab 1: Database */}
        <button
          onClick={() => onSelectTab("database")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] ${
            currentTab === "database"
              ? "text-blue-400 bg-byonBlue/15 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Database className="w-4 h-4 mb-0.5" />
          <span className="text-[9px]">Data</span>
        </button>

        {/* Tab 2: Book1 Tabel */}
        <button
          onClick={() => onSelectTab("classes")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] ${
            currentTab === "classes"
              ? "text-blue-400 bg-byonBlue/15 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span className="text-[9px]">Kelas</span>
        </button>

        {/* Center: + Tambah Atlet FAB */}
        <button
          onClick={onOpenAddModal}
          className="flex flex-col items-center justify-center w-11 h-11 -mt-3 rounded-full bg-gradient-to-tr from-byonBlue to-blue-500 text-white shadow-lg shadow-blue-600/40 border-2 border-carbon transition-transform active:scale-95"
          title="Tambah Atlet"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>

        {/* Tab 4: Bagan Pertandingan */}
        <button
          onClick={() => onSelectTab("bracket")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] ${
            currentTab === "bracket"
              ? "text-blue-400 bg-byonBlue/15 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Dna className="w-4 h-4 mb-0.5" />
          <span className="text-[9px]">Bagan</span>
        </button>

        {/* Tab 5: Medali */}
        <button
          onClick={() => onSelectTab("medals")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] ${
            currentTab === "medals"
              ? "text-blue-400 bg-byonBlue/15 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Trophy className="w-4 h-4 mb-0.5" />
          <span className="text-[9px]">Medali</span>
        </button>
      </div>
    </div>
  );
}
