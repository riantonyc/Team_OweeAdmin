"use client";

import React, { useState, useEffect } from "react";
import { Dna, Shuffle, Trophy, Check, Award, RefreshCw, Printer } from "lucide-react";
import { Athlete } from "@/lib/types";
import { WEIGHT_CLASSES } from "@/lib/constants";
import {
  ClassBracket,
  BracketMatch,
  generateBracket,
  updateMatchWinner,
} from "@/lib/bracketUtils";
import { useToast } from "./Toast";

interface TabBracketProps {
  athletes: Athlete[];
}

export default function TabBracket({ athletes }: TabBracketProps) {
  const [selectedClass, setSelectedClass] = useState("KELAS 48 KG");
  const [selectedGender, setSelectedGender] = useState<"PUTRA" | "PUTRI">("PUTRA");
  const [bracket, setBracket] = useState<ClassBracket | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const classKey = `${selectedClass}-${selectedGender}`;

  // Filter athletes for the selected class and gender
  const currentAthletes = athletes.filter(
    (a) =>
      a.status === "Aktif" &&
      a.kelas === selectedClass &&
      a.kategori === selectedGender
  );

  // Load existing bracket from server or initialize
  const loadBracket = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/brackets?classKey=${encodeURIComponent(classKey)}`);
      const data = await res.json();
      if (data.bracket) {
        setBracket(data.bracket);
      } else {
        // Auto-generate if not existing yet
        const newBracket = generateBracket(currentAthletes, classKey);
        setBracket(newBracket);
      }
    } catch (err) {
      const fallback = generateBracket(currentAthletes, classKey);
      setBracket(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBracket();
  }, [selectedClass, selectedGender]);

  // Handle re-draw / shuffle
  const handleShuffleDraw = async () => {
    if (currentAthletes.length < 2) {
      showToast("Minimal diperlukan 2 atlet aktif untuk membuat bagan pertandingan.", "error");
      return;
    }

    if (
      bracket &&
      bracket.rounds.some((r) => r.matches.some((m) => m.winnerId && !m.isBye))
    ) {
      if (!confirm("Bagan ini sudah memiliki hasil pertandingan. Lakukan undian ulang dari awal?")) {
        return;
      }
    }

    const newBracket = generateBracket(currentAthletes, classKey);
    setBracket(newBracket);

    try {
      await fetch("/api/brackets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classKey, bracket: newBracket }),
      });
      showToast(`Undian acak berhasil dibuat untuk ${classKey}!`, "success");
    } catch (err) {
      showToast("Bagan berhasil dibuat secara lokal.", "info");
    }
  };

  // Set match winner
  const handleSetWinner = async (
    roundIndex: number,
    matchIndex: number,
    winnerId: number,
    method: "Poin" | "KO" | "RSC" | "WO" = "Poin"
  ) => {
    if (!bracket) return;
    const match = bracket.rounds[roundIndex].matches[matchIndex];
    if (!match.redAthlete || !match.blueAthlete) return;

    const updated = updateMatchWinner(bracket, roundIndex, matchIndex, winnerId, method);
    setBracket(updated);

    try {
      await fetch("/api/brackets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classKey, bracket: updated }),
      });
      const winnerName =
        winnerId === match.redAthlete.id ? match.redAthlete.nama : match.blueAthlete.nama;
      showToast(`Pemenang partai: ${winnerName} (${method})`, "success");
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate Champions & Medalists if final is finished
  const finalRound = bracket?.rounds[bracket.rounds.length - 1];
  const finalMatch = finalRound?.matches[0];
  const goldWinner =
    finalMatch?.winnerId === finalMatch?.redAthlete?.id
      ? finalMatch?.redAthlete
      : finalMatch?.winnerId === finalMatch?.blueAthlete?.id
      ? finalMatch?.blueAthlete
      : null;

  const silverWinner =
    goldWinner && finalMatch
      ? goldWinner.id === finalMatch.redAthlete?.id
        ? finalMatch.blueAthlete
        : finalMatch.redAthlete
      : null;

  return (
    <section className="space-y-5">
      {/* Selector & Action Bar */}
      <div className="bg-slateCard border border-slateBorder rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Pilih Kelas Berat
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 rounded-lg bg-carbon border border-slateBorder text-xs sm:text-sm font-bold text-amber-300 min-h-[40px]"
            >
              {WEIGHT_CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Kategori
            </label>
            <div className="flex items-center gap-1.5 h-[40px]">
              <button
                onClick={() => setSelectedGender("PUTRA")}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] ${
                  selectedGender === "PUTRA"
                    ? "bg-byonBlue text-white shadow-md shadow-blue-600/30"
                    : "bg-carbon border border-slateBorder text-slate-400 hover:text-white"
                }`}
              >
                PUTRA (PA)
              </button>
              <button
                onClick={() => setSelectedGender("PUTRI")}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] ${
                  selectedGender === "PUTRI"
                    ? "bg-putriRed text-white shadow-md shadow-rose-600/30"
                    : "bg-carbon border border-slateBorder text-slate-400 hover:text-white"
                }`}
              >
                PUTRI (PI)
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleShuffleDraw}
            className="px-3.5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-carbon font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-600/20 flex items-center gap-1.5 cursor-pointer min-h-[40px]"
            title="Acak undian atlet dan buat bagan sistem gugur otomatis"
          >
            <Shuffle className="w-4 h-4" />
            <span>Undian Acak (Drawing)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-2.5 rounded-lg bg-slateElevated hover:bg-slate-700 text-slate-300 border border-slateBorder font-semibold text-xs sm:text-sm flex items-center gap-1.5 min-h-[40px] cursor-pointer"
            title="Cetak Bagan Turnamen"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Cetak Bagan</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="px-4 py-2.5 rounded-xl bg-slateElevated/60 border border-slateBorder flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-white uppercase">{classKey}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-300 font-semibold">{currentAthletes.length} Atlet Terdaftar</span>
        </div>
        <div className="text-[11px] text-slate-400">
          💡 Klik tombol <span className="text-blue-300 font-bold">Menang</span> pada sudut petarung untuk meloloskan atlet ke babak selanjutnya.
        </div>
      </div>

      {/* Champion Podium Banner (If Final Match is Decided) */}
      {goldWinner && silverWinner && (
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-amber-950/40 via-slateCard to-amber-950/40 border-2 border-amber-500/50 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-lg shrink-0">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                JUARA KELAS {selectedClass} ({selectedGender})
              </span>
              <h3 className="text-base sm:text-xl font-extrabold text-white">
                {goldWinner.nama} ({goldWinner.kontingen})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Perak: <strong className="text-slate-200">{silverWinner.nama} ({silverWinner.kontingen})</strong>
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-500 text-carbon font-extrabold text-xs">
            FINAL SELESAI
          </span>
        </div>
      )}

      {/* Interactive Tournament Tree View */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-2">
          <div className="w-7 h-7 border-2 border-byonBlue border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs">Menyiapkan bagan turnamen...</p>
        </div>
      ) : !bracket || bracket.rounds.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slateCard border border-slateBorder rounded-xl space-y-3">
          <p className="font-bold text-white">Belum ada atlet yang terdaftar di kelas ini.</p>
          <p className="text-xs">
            Daftarkan atlet baru atau ubah kelas atlet ke {selectedClass} melalui Tab Database.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-6">
          <div className="flex items-stretch gap-6 min-w-[760px] py-2">
            {bracket.rounds.map((round, rIdx) => {
              const isFinal = rIdx === bracket.rounds.length - 1;

              return (
                <div key={rIdx} className="flex-1 min-w-[240px] flex flex-col">
                  {/* Round Header */}
                  <div className="px-3 py-2 rounded-t-xl bg-[#1F3864] border border-blue-500/30 text-center font-extrabold text-xs uppercase tracking-wider text-white shadow-md mb-4 flex items-center justify-center gap-1.5">
                    {isFinal && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{round.name}</span>
                  </div>

                  {/* Matches Column */}
                  <div className="flex-1 flex flex-col justify-around gap-4">
                    {round.matches.map((match, mIdx) => {
                      const isRedWinner = match.winnerId && match.winnerId === match.redAthlete?.id;
                      const isBlueWinner = match.winnerId && match.winnerId === match.blueAthlete?.id;

                      return (
                        <div
                          key={match.id}
                          className="bg-slateCard border border-slateBorder rounded-xl overflow-hidden shadow-lg hover:border-slate-500 transition-all flex flex-col"
                        >
                          {/* Match Bar Title */}
                          <div className="px-3 py-1 bg-carbon border-b border-slateBorder/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>Partai #{match.id}</span>
                            {match.isBye && (
                              <span className="text-amber-400 font-bold">Lolos Otomatis (BYE)</span>
                            )}
                            {match.winMethod && !match.isBye && (
                              <span className="text-emerald-400 font-bold">
                                Menang: {match.winMethod}
                              </span>
                            )}
                          </div>

                          {/* Red Corner (Sudut Merah) */}
                          <div
                            className={`p-3 border-b border-slateBorder/60 flex items-center justify-between gap-2 transition-colors ${
                              isRedWinner
                                ? "bg-red-950/40 font-bold"
                                : "hover:bg-slateElevated/40"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">
                                  {match.redAthlete ? match.redAthlete.nama : <span className="text-slate-600 italic">Menunggu Lawan...</span>}
                                </p>
                                {match.redAthlete && (
                                  <p className="text-[10px] text-slate-400 truncate">
                                    {match.redAthlete.kontingen}
                                  </p>
                                )}
                              </div>
                            </div>

                            {match.redAthlete && match.blueAthlete && !match.winnerId && (
                              <button
                                onClick={() => handleSetWinner(rIdx, mIdx, match.redAthlete!.id, "Poin")}
                                className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[10px] shrink-0 transition-transform active:scale-95"
                                title="Nyatakan Sudut Merah Menang"
                              >
                                Menang
                              </button>
                            )}
                            {isRedWinner && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-extrabold text-[10px] flex items-center gap-0.5 shrink-0">
                                <Check className="w-3 h-3" /> Lolos
                              </span>
                            )}
                          </div>

                          {/* Blue Corner (Sudut Biru) */}
                          <div
                            className={`p-3 flex items-center justify-between gap-2 transition-colors ${
                              isBlueWinner
                                ? "bg-blue-950/40 font-bold"
                                : "hover:bg-slateElevated/40"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2.5 h-2.5 rounded-full bg-byonBlue shrink-0"></span>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">
                                  {match.blueAthlete ? match.blueAthlete.nama : <span className="text-slate-600 italic">Menunggu Lawan...</span>}
                                </p>
                                {match.blueAthlete && (
                                  <p className="text-[10px] text-slate-400 truncate">
                                    {match.blueAthlete.kontingen}
                                  </p>
                                )}
                              </div>
                            </div>

                            {match.redAthlete && match.blueAthlete && !match.winnerId && (
                              <button
                                onClick={() => handleSetWinner(rIdx, mIdx, match.blueAthlete!.id, "Poin")}
                                className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] shrink-0 transition-transform active:scale-95"
                                title="Nyatakan Sudut Biru Menang"
                              >
                                Menang
                              </button>
                            )}
                            {isBlueWinner && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-extrabold text-[10px] flex items-center gap-0.5 shrink-0">
                                <Check className="w-3 h-3" /> Lolos
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
