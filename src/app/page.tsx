"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import KpiCards from "@/components/KpiCards";
import TabDatabase from "@/components/TabDatabase";
import TabBook1Classes from "@/components/TabBook1Classes";
import TabMatrix from "@/components/TabMatrix";
import TabBracket from "@/components/TabBracket";
import TabMedals from "@/components/TabMedals";
import BottomBar from "@/components/BottomBar";
import ModalAthleteForm from "@/components/ModalAthleteForm";
import ModalAthleteDetail from "@/components/ModalAthleteDetail";
import ModalExcelExport from "@/components/ModalExcelExport";
import ModalWeighInPrint from "@/components/ModalWeighInPrint";
import { useToast } from "@/components/Toast";
import { Athlete } from "@/lib/types";
import { Database, BookOpen, Grid, Dna, Trophy } from "lucide-react";

export default function DashboardPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<
    "database" | "classes" | "matrix" | "bracket" | "medals"
  >("database");

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [initialClassForAdd, setInitialClassForAdd] = useState<string | undefined>(undefined);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailAthlete, setDetailAthlete] = useState<Athlete | null>(null);

  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isWeighInModalOpen, setIsWeighInModalOpen] = useState(false);

  const { showToast } = useToast();

  // Load athletes from API
  const fetchAthletes = async () => {
    try {
      const res = await fetch("/api/athletes");
      const data = await res.json();
      if (data.athletes) {
        setAthletes(data.athletes);
      }
    } catch (err) {
      showToast("Gagal memuat data atlet.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, []);

  // Handler: Add or update athlete
  const handleSaveAthlete = async (athleteData: Partial<Athlete>) => {
    try {
      if (editingAthlete) {
        const res = await fetch(`/api/athletes/${editingAthlete.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(athleteData),
        });
        const data = await res.json();
        if (data.success && data.athlete) {
          setAthletes((prev) =>
            prev.map((a) => (a.id === editingAthlete.id ? data.athlete : a))
          );
          showToast(`Data atlet "${data.athlete.nama}" berhasil diperbarui!`, "success");
        }
      } else {
        const res = await fetch("/api/athletes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(athleteData),
        });
        const data = await res.json();
        if (data.success && data.athlete) {
          setAthletes((prev) => [...prev, data.athlete]);
          showToast(`Atlet "${data.athlete.nama}" berhasil ditambahkan!`, "success");
        }
      }
    } catch (err) {
      showToast("Gagal menyimpan data atlet.", "error");
    }
  };

  // Handler: Inline quick update
  const handleInlineUpdate = async (id: number, field: string, value: any) => {
    try {
      const res = await fetch(`/api/athletes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (data.success && data.athlete) {
        setAthletes((prev) => prev.map((a) => (a.id === id ? data.athlete : a)));
        if (detailAthlete && detailAthlete.id === id) {
          setDetailAthlete(data.athlete);
        }
        showToast(
          `Berhasil mengubah ${field.toUpperCase()} ${data.athlete.nama}`,
          "info"
        );
      }
    } catch (err) {
      showToast("Gagal memperbarui data.", "error");
    }
  };

  // Handler: Delete athlete
  const handleDeleteAthlete = async (id: number) => {
    const target = athletes.find((a) => a.id === id);
    if (!target) return;

    if (!confirm(`Apakah Anda yakin ingin menghapus atlet "${target.nama}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/athletes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setAthletes((prev) => prev.filter((a) => a.id !== id));
        showToast(`Atlet "${target.nama}" berhasil dihapus.`, "info");
      }
    } catch (err) {
      showToast("Gagal menghapus atlet.", "error");
    }
  };

  // Handler: Reset to 68 athletes
  const handleResetToInitial = async () => {
    if (!confirm("Kembalikan data ke 68 atlet awal resmi? Semua perubahan manual akan direset.")) {
      return;
    }

    try {
      const res = await fetch("/api/athletes/reset", { method: "POST" });
      const data = await res.json();
      if (data.success && data.athletes) {
        setAthletes(data.athletes);
        showToast("Data atlet berhasil direset ke 68 atlet awal!", "success");
      }
    } catch (err) {
      showToast("Gagal mereset data atlet.", "error");
    }
  };

  // Modal open helpers
  const handleOpenAddModal = (initialClass?: string) => {
    setEditingAthlete(null);
    setInitialClassForAdd(initialClass);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (id: number) => {
    const target = athletes.find((a) => a.id === id);
    if (target) {
      setEditingAthlete(target);
      setIsFormModalOpen(true);
    }
  };

  const handleOpenDetailModal = (id: number) => {
    const target = athletes.find((a) => a.id === id);
    if (target) {
      setDetailAthlete(target);
      setIsDetailModalOpen(true);
    }
  };

  const handleSelectContingentFromMatrix = (kontingen: string) => {
    setCurrentTab("database");
    showToast(`Menampilkan atlet kontingen ${kontingen}`, "info");
  };

  return (
    <div className="min-h-screen flex flex-col bg-grid-pattern selection:bg-byonBlue selection:text-white pb-20 md:pb-8">
      {/* Top Header */}
      <Header
        onOpenAddModal={() => handleOpenAddModal()}
        onOpenExcelModal={() => setIsExcelModalOpen(true)}
        onOpenWeighInModal={() => setIsWeighInModalOpen(true)}
        onResetData={handleResetToInitial}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {/* KPI Summary Ribbon */}
        <KpiCards athletes={athletes} />

        {/* View Mode Navigation Tabs (Desktop & Tablet) */}
        <section className="hidden md:flex flex-row items-center justify-between gap-3 border-b border-slateBorder pb-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCurrentTab("database")}
              className={`px-3.5 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                currentTab === "database"
                  ? "bg-byonBlue text-white shadow-md shadow-blue-600/20"
                  : "bg-slateCard hover:bg-slateElevated text-slate-300 border border-slateBorder"
              }`}
            >
              <Database className="w-4 h-4" />
              <span>1. Database Atlet</span>
            </button>

            <button
              onClick={() => setCurrentTab("classes")}
              className={`px-3.5 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                currentTab === "classes"
                  ? "bg-byonBlue text-white shadow-md shadow-blue-600/20"
                  : "bg-slateCard hover:bg-slateElevated text-slate-300 border border-slateBorder"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>2. Tabel Per Kelas (Book1)</span>
            </button>

            <button
              onClick={() => setCurrentTab("matrix")}
              className={`px-3.5 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                currentTab === "matrix"
                  ? "bg-byonBlue text-white shadow-md shadow-blue-600/20"
                  : "bg-slateCard hover:bg-slateElevated text-slate-300 border border-slateBorder"
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>3. Rekap Matriks</span>
            </button>

            <button
              onClick={() => setCurrentTab("bracket")}
              className={`px-3.5 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                currentTab === "bracket"
                  ? "bg-byonBlue text-white shadow-md shadow-blue-600/20"
                  : "bg-slateCard hover:bg-slateElevated text-slate-300 border border-slateBorder"
              }`}
            >
              <Dna className="w-4 h-4" />
              <span>4. Bagan Undian &amp; Turnamen</span>
            </button>

            <button
              onClick={() => setCurrentTab("medals")}
              className={`px-3.5 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                currentTab === "medals"
                  ? "bg-byonBlue text-white shadow-md shadow-blue-600/20"
                  : "bg-slateCard hover:bg-slateElevated text-slate-300 border border-slateBorder"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>5. Klasemen Medali</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Tersimpan di Cloud Database &amp; Siap Export Excel</span>
          </div>
        </section>

        {/* Tab Panels */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-byonBlue border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold">Memuat database atlet...</p>
          </div>
        ) : (
          <>
            {currentTab === "database" && (
              <TabDatabase
                athletes={athletes}
                onOpenDetail={handleOpenDetailModal}
                onOpenEdit={handleOpenEditModal}
                onDelete={handleDeleteAthlete}
                onInlineUpdate={handleInlineUpdate}
              />
            )}

            {currentTab === "classes" && (
              <TabBook1Classes
                athletes={athletes}
                onOpenDetail={handleOpenDetailModal}
                onOpenAddWithClass={handleOpenAddModal}
                onOpenExcelModal={() => setIsExcelModalOpen(true)}
              />
            )}

            {currentTab === "matrix" && (
              <TabMatrix
                athletes={athletes}
                onSelectContingentFilter={handleSelectContingentFromMatrix}
              />
            )}

            {currentTab === "bracket" && <TabBracket athletes={athletes} />}

            {currentTab === "medals" && <TabMedals />}
          </>
        )}
      </main>

      {/* Floating Bottom Navigation Bar for Mobile (iPhone & Android) */}
      <BottomBar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenAddModal={() => handleOpenAddModal()}
      />

      {/* Modals */}
      <ModalAthleteForm
        isOpen={isFormModalOpen}
        athlete={editingAthlete}
        initialClass={initialClassForAdd}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveAthlete}
      />

      <ModalAthleteDetail
        isOpen={isDetailModalOpen}
        athlete={detailAthlete}
        allAthletes={athletes}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteAthlete}
        onInlineUpdate={handleInlineUpdate}
      />

      <ModalExcelExport
        isOpen={isExcelModalOpen}
        athletes={athletes}
        onClose={() => setIsExcelModalOpen(false)}
      />

      <ModalWeighInPrint
        isOpen={isWeighInModalOpen}
        athletes={athletes}
        onClose={() => setIsWeighInModalOpen(false)}
      />
    </div>
  );
}
