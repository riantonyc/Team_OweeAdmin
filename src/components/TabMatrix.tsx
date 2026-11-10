"use client";

import React from "react";
import { Athlete } from "@/lib/types";
import { WEIGHT_CLASSES, KALBAR_CONTINGENTS } from "@/lib/constants";

interface TabMatrixProps {
  athletes: Athlete[];
  onSelectContingentFilter: (kontingen: string) => void;
}

export default function TabMatrix({
  athletes,
  onSelectContingentFilter,
}: TabMatrixProps) {
  const activeList = athletes.filter((a) => a.status === "Aktif");

  // Determine active contingents (or standard Kalbar ones)
  const activeContingents = KALBAR_CONTINGENTS.filter(
    (k) =>
      activeList.some((a) => a.kontingen === k) ||
      ["Mempawah", "Ketapang", "Kota Pontianak", "Kubu Raya", "Sambas"].includes(k)
  );

  const totalPa = activeList.filter((a) => a.kategori === "PUTRA").length;
  const totalPi = activeList.filter((a) => a.kategori === "PUTRI").length;

  return (
    <section className="space-y-6">
      <div className="bg-slateCard border border-slateBorder rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-white">
            Matriks Sebaran Atlet Aktif Per Kontingen &amp; Kelas Berat Badan
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Klik pada nama kontingen untuk langsung memfilter daftar atlet kontingen tersebut di Tabel Database.
          </p>
        </div>
      </div>

      <div className="bg-slateCard border border-slateBorder rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse tabular-nums text-xs sm:text-sm">
            <thead>
              <tr className="bg-slateElevated border-b border-slateBorder text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
                <th className="py-3 px-4">Kelas Berat Badan</th>
                <th className="py-3 px-3 text-center text-blue-400">Putra</th>
                <th className="py-3 px-3 text-center text-rose-400">Putri</th>
                <th className="py-3 px-3 text-center text-emerald-400">Total</th>
                {activeContingents.map((k) => (
                  <th key={k} className="py-3 px-2.5 text-center">
                    <button
                      onClick={() => onSelectContingentFilter(k)}
                      className="hover:text-blue-400 underline decoration-dotted cursor-pointer font-bold"
                      title={`Klik untuk filter ${k}`}
                    >
                      {k}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slateBorder/60">
              {WEIGHT_CLASSES.map((c) => {
                const classAthletes = activeList.filter((a) => a.kelas === c);
                const paCount = classAthletes.filter((a) => a.kategori === "PUTRA").length;
                const piCount = classAthletes.filter((a) => a.kategori === "PUTRI").length;
                const total = classAthletes.length;

                return (
                  <tr key={c} className="hover:bg-slateElevated/40 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-white">{c}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-300">
                      {paCount}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-300">
                      {piCount}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-extrabold text-emerald-300 bg-emerald-500/10">
                      {total}
                    </td>
                    {activeContingents.map((k) => {
                      const count = classAthletes.filter((a) => a.kontingen === k).length;
                      return (
                        <td
                          key={k}
                          className={`py-2.5 px-2.5 text-center font-mono ${
                            count > 0
                              ? "font-bold text-white bg-blue-500/10"
                              : "text-slate-600"
                          }`}
                        >
                          {count}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slateElevated border-t-2 border-slateBorder font-extrabold text-xs sm:text-sm text-white">
                <td className="py-3.5 px-4 uppercase">TOTAL KESELURUHAN</td>
                <td className="py-3.5 px-3 text-center font-mono text-blue-300">{totalPa}</td>
                <td className="py-3.5 px-3 text-center font-mono text-rose-300">{totalPi}</td>
                <td className="py-3.5 px-3 text-center font-mono text-emerald-300 bg-emerald-500/20">
                  {activeList.length}
                </td>
                {activeContingents.map((k) => {
                  const kTotal = activeList.filter((a) => a.kontingen === k).length;
                  return (
                    <td
                      key={k}
                      className="py-3.5 px-2.5 text-center font-mono text-amber-300"
                    >
                      {kTotal}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
}
