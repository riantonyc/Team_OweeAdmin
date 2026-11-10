"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Medal, Award, MapPin } from "lucide-react";
import { KALBAR_CONTINGENTS } from "@/lib/constants";
import { ClassBracket } from "@/lib/bracketUtils";

interface ContingentMedal {
  kontingen: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

export default function TabMedals() {
  const [standings, setStandings] = useState<ContingentMedal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBracketsAndCalculate = async () => {
    try {
      const res = await fetch("/api/brackets");
      const data = await res.json();
      const brackets: Record<string, ClassBracket> = data.brackets || {};

      // Initialize counter for each contingent
      const counts: Record<string, { gold: number; silver: number; bronze: number }> = {};
      KALBAR_CONTINGENTS.forEach((k) => {
        counts[k] = { gold: 0, silver: 0, bronze: 0 };
      });

      // Scan all brackets
      Object.values(brackets).forEach((bracket) => {
        if (!bracket.rounds || bracket.rounds.length === 0) return;

        const finalRound = bracket.rounds[bracket.rounds.length - 1];
        const finalMatch = finalRound.matches[0];

        if (finalMatch && finalMatch.winnerId) {
          const goldWinner =
            finalMatch.winnerId === finalMatch.redAthlete?.id
              ? finalMatch.redAthlete
              : finalMatch.blueAthlete;

          const silverWinner =
            finalMatch.winnerId === finalMatch.redAthlete?.id
              ? finalMatch.blueAthlete
              : finalMatch.redAthlete;

          if (goldWinner && counts[goldWinner.kontingen]) {
            counts[goldWinner.kontingen].gold += 1;
          }
          if (silverWinner && counts[silverWinner.kontingen]) {
            counts[silverWinner.kontingen].silver += 1;
          }

          // Bronze medals to semifinalists if semifinal exists
          if (bracket.rounds.length >= 2) {
            const sfRound = bracket.rounds[bracket.rounds.length - 2];
            sfRound.matches.forEach((sf) => {
              if (sf.winnerId) {
                const loser =
                  sf.winnerId === sf.redAthlete?.id ? sf.blueAthlete : sf.redAthlete;
                if (loser && counts[loser.kontingen]) {
                  counts[loser.kontingen].bronze += 1;
                }
              }
            });
          }
        }
      });

      // Convert to array and sort by Gold -> Silver -> Bronze
      const list: ContingentMedal[] = Object.entries(counts).map(([kontingen, med]) => ({
        kontingen,
        gold: med.gold,
        silver: med.silver,
        bronze: med.bronze,
        total: med.gold + med.silver + med.bronze,
      }));

      list.sort((a, b) => {
        if (b.gold !== a.gold) return b.gold - a.gold;
        if (b.silver !== a.silver) return b.silver - a.silver;
        if (b.bronze !== a.bronze) return b.bronze - a.bronze;
        return a.kontingen.localeCompare(b.kontingen);
      });

      setStandings(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBracketsAndCalculate();
  }, []);

  return (
    <section className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slateCard border border-slateBorder rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">
              Klasemen Perolehan Medali Porprov XIV Kalbar
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Diperbarui secara otomatis berdasarkan hasil babak Semifinal dan Final pada Tab Bagan Pertandingan.
            </p>
          </div>
        </div>
      </div>

      {/* Standings Table */}
      <div className="bg-slateCard border border-slateBorder rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slateElevated border-b border-slateBorder text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
                <th className="py-3 px-3 text-center w-12">Peringkat</th>
                <th className="py-3 px-4">Kontingen Kabupaten / Kota</th>
                <th className="py-3 px-3 text-center text-amber-400 w-24">🥇 Emas</th>
                <th className="py-3 px-3 text-center text-slate-300 w-24">🥈 Perak</th>
                <th className="py-3 px-3 text-center text-amber-600 w-24">🥉 Perunggu</th>
                <th className="py-3 px-4 text-center text-emerald-400 w-24">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slateBorder/60">
              {standings.map((c, idx) => {
                const isTop3 = idx < 3 && c.total > 0;
                return (
                  <tr
                    key={c.kontingen}
                    className={`hover:bg-slateElevated/50 transition-colors ${
                      idx === 0 && c.total > 0 ? "bg-amber-500/10" : ""
                    }`}
                  >
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-400 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <span>{c.kontingen}</span>
                      {idx === 0 && c.gold > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-carbon">
                          Peringkat 1
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-amber-300 tabular-nums">
                      {c.gold}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-200 tabular-nums">
                      {c.silver}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-amber-600/90 tabular-nums">
                      {c.bronze}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-extrabold text-emerald-300 tabular-nums bg-emerald-500/10">
                      {c.total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
