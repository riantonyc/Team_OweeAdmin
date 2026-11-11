import XLSX from "xlsx-js-style";
import { Athlete } from "./types";
import { WEIGHT_CLASSES, KALBAR_CONTINGENTS } from "./constants";
import { formatDobIndo, calculateAge } from "./excelExport";

export interface CustomExportConfig {
  groupBy: "class" | "contingent" | "flat";
  genderLayout: "sideBySide" | "merged" | "putraOnly" | "putriOnly";
  selectedClasses: string[]; // ["ALL"] or array of weight classes
  selectedContingents: string[]; // ["ALL"] or array of contingents
  statusFilter: "Aktif" | "ALL";
  columns: {
    no: boolean;
    nama: boolean;
    kontingen: boolean;
    kelas: boolean;
    kategori: boolean;
    dob: boolean;
    usia: boolean;
    temuan: boolean;
    catatan: boolean;
  };
  title: string;
  sheetName: string;
  themeColor: "navy" | "emerald" | "monochrome" | "slate";
}

interface ThemePalette {
  primary: string;
  secondary: string;
  accent: string;
  summaryBg: string;
  summaryText: string;
  zebraBg: string;
  border: string;
}

const THEMES: Record<string, ThemePalette> = {
  navy: {
    primary: "1F3864",
    secondary: "2E75B6",
    accent: "C0504D",
    summaryBg: "D9E1F2",
    summaryText: "1F3864",
    zebraBg: "F2F5F9",
    border: "BFBFBF",
  },
  emerald: {
    primary: "065F46",
    secondary: "059669",
    accent: "047857",
    summaryBg: "D1FAE5",
    summaryText: "065F46",
    zebraBg: "F0FDF4",
    border: "A7F3D0",
  },
  monochrome: {
    primary: "1F2937",
    secondary: "374151",
    accent: "4B5563",
    summaryBg: "E5E7EB",
    summaryText: "111827",
    zebraBg: "F9FAFB",
    border: "9CA3AF",
  },
  slate: {
    primary: "0F172A",
    secondary: "1E293B",
    accent: "334155",
    summaryBg: "E2E8F0",
    summaryText: "0F172A",
    zebraBg: "F8FAFC",
    border: "CBD5E1",
  },
};

export function exportCustomClassTableToExcel(
  athletes: Athlete[],
  config: CustomExportConfig
) {
  const theme = THEMES[config.themeColor] || THEMES.navy;

  // Filter base list
  let filtered = athletes.filter((a) => {
    if (config.statusFilter === "Aktif" && a.status !== "Aktif") return false;
    if (
      config.selectedClasses.length > 0 &&
      !config.selectedClasses.includes("ALL") &&
      !config.selectedClasses.includes(a.kelas)
    ) {
      return false;
    }
    if (
      config.selectedContingents.length > 0 &&
      !config.selectedContingents.includes("ALL") &&
      !config.selectedContingents.includes(a.kontingen)
    ) {
      return false;
    }
    if (config.genderLayout === "putraOnly" && a.kategori !== "PUTRA") return false;
    if (config.genderLayout === "putriOnly" && a.kategori !== "PUTRI") return false;
    return true;
  });

  // Reusable cell styles (typed as any to prevent strict style variance errors)
  const thinBorder: any = {
    top: { style: "thin", color: { rgb: theme.border } },
    bottom: { style: "thin", color: { rgb: theme.border } },
    left: { style: "thin", color: { rgb: theme.border } },
    right: { style: "thin", color: { rgb: theme.border } },
  };

  const styleMainTitle: any = {
    font: { name: "Arial", sz: 14, bold: true, color: { rgb: theme.primary } },
    alignment: { horizontal: "left", vertical: "center" },
  };

  const styleSubtitle: any = {
    font: { name: "Arial", sz: 9, italic: true, color: { rgb: "595959" } },
    alignment: { horizontal: "left", vertical: "center" },
  };

  const styleBanner: any = {
    fill: { patternType: "solid", fgColor: { rgb: theme.primary } },
    font: { name: "Arial", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
    alignment: { horizontal: "left", vertical: "center" },
    border: thinBorder,
  };

  const styleSubHeader: any = {
    fill: { patternType: "solid", fgColor: { rgb: theme.secondary } },
    font: { name: "Arial", sz: 10, bold: true, color: { rgb: "FFFFFF" } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: thinBorder,
  };

  const stylePutriSubHeader: any = {
    fill: { patternType: "solid", fgColor: { rgb: theme.accent } },
    font: { name: "Arial", sz: 10, bold: true, color: { rgb: "FFFFFF" } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: thinBorder,
  };

  const styleSummary: any = {
    fill: { patternType: "solid", fgColor: { rgb: theme.summaryBg } },
    font: { name: "Arial", sz: 10, bold: true, color: { rgb: theme.summaryText } },
    alignment: { horizontal: "center", vertical: "center" },
    border: thinBorder,
  };

  const styleBlank: any = {
    fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } },
  };

  const getDataStyle = (isEven: boolean, align: "left" | "center" | "right" = "left"): any => ({
    fill: {
      patternType: "solid",
      fgColor: { rgb: isEven ? theme.zebraBg : "FFFFFF" },
    },
    font: { name: "Arial", sz: 9.5, color: { rgb: "111827" } },
    alignment: { horizontal: align, vertical: "center" },
    border: thinBorder,
  });

  const wsData: any[][] = [];
  const merges: any[] = [];
  const rowMeta: any[] = [];
  let colWidths: { wch: number }[] = [];

  // 1. Title & Metadata
  wsData.push([{ v: config.title.toUpperCase(), t: "s", s: styleMainTitle }]);
  rowMeta.push({ hpt: 26 });

  const nowFormatted = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  wsData.push([
    {
      v: `Format: 1 Sheet Khusus | Diekspor pada: ${nowFormatted} WIB | Total: ${filtered.length} Atlet`,
      t: "s",
      s: styleSubtitle,
    },
  ]);
  rowMeta.push({ hpt: 18 });
  wsData.push([]); // Empty spacer
  rowMeta.push({ hpt: 10 });

  // Determine active classes and contingents
  const activeClasses = (
    config.selectedClasses.includes("ALL") || config.selectedClasses.length === 0
      ? WEIGHT_CLASSES
      : WEIGHT_CLASSES.filter((c) => config.selectedClasses.includes(c))
  ).filter((c) => filtered.some((a) => a.kelas === c));

  const activeContingents = (
    config.selectedContingents.includes("ALL") || config.selectedContingents.length === 0
      ? KALBAR_CONTINGENTS
      : KALBAR_CONTINGENTS.filter((k) => config.selectedContingents.includes(k))
  ).filter((k) => filtered.some((a) => a.kontingen === k));

  // =========================================================================
  // CASE A: GROUP BY CLASS + GENDER BERDAMPINGAN (Book1 Style)
  // =========================================================================
  if (config.groupBy === "class" && config.genderLayout === "sideBySide") {
    colWidths = [
      { wch: 5 }, // No PA
      { wch: 25 }, // Nama PA
      { wch: 18 }, // Kontingen PA
      { wch: 13 }, // Tgl Lahir PA
      { wch: 8 }, // THB PA
      { wch: 3 }, // Spacer
      { wch: 5 }, // No PI
      { wch: 25 }, // Nama PI
      { wch: 18 }, // Kontingen PI
      { wch: 13 }, // Tgl Lahir PI
      { wch: 8 }, // THB PI
    ];

    activeClasses.forEach((kelasName) => {
      const startRowIdx = wsData.length;
      const paList = filtered
        .filter((a) => a.kelas === kelasName && a.kategori === "PUTRA")
        .sort((a, b) => a.kontingen.localeCompare(b.kontingen) || a.nama.localeCompare(b.nama));
      const piList = filtered
        .filter((a) => a.kelas === kelasName && a.kategori === "PUTRI")
        .sort((a, b) => a.kontingen.localeCompare(b.kontingen) || a.nama.localeCompare(b.nama));

      const maxRows = Math.max(paList.length, piList.length, 1);

      // Class Banner
      const bannerRow: any[] = new Array(11).fill(null).map(() => ({ v: "", t: "s", s: styleBanner }));
      bannerRow[0] = {
        v: `  KELAS: ${kelasName} (Putra: ${paList.length} | Putri: ${piList.length} | Total: ${paList.length + piList.length})`,
        t: "s",
        s: styleBanner,
      };
      wsData.push(bannerRow);
      merges.push({ s: { r: startRowIdx, c: 0 }, e: { r: startRowIdx, c: 10 } });
      rowMeta.push({ hpt: 24 });

      // Gender Subheader
      const genderSubRow: any[] = new Array(11).fill(null).map(() => ({ v: "", t: "s", s: styleSubHeader }));
      genderSubRow[0] = { v: "PUTRA", t: "s", s: styleSubHeader };
      genderSubRow[5] = { v: "", t: "s", s: styleBlank };
      for (let c = 6; c <= 10; c++) genderSubRow[c] = { v: "", t: "s", s: stylePutriSubHeader };
      genderSubRow[6] = { v: "PUTRI", t: "s", s: stylePutriSubHeader };

      wsData.push(genderSubRow);
      merges.push({ s: { r: startRowIdx + 1, c: 0 }, e: { r: startRowIdx + 1, c: 4 } });
      merges.push({ s: { r: startRowIdx + 1, c: 6 }, e: { r: startRowIdx + 1, c: 10 } });
      rowMeta.push({ hpt: 20 });

      // Column Headers
      wsData.push([
        { v: "No", t: "s", s: styleSubHeader },
        { v: "Nama Atlet", t: "s", s: styleSubHeader },
        { v: "Kontingen", t: "s", s: styleSubHeader },
        { v: "Tgl Lahir", t: "s", s: styleSubHeader },
        { v: "THB", t: "s", s: styleSubHeader },
        { v: "", t: "s", s: styleBlank },
        { v: "No", t: "s", s: stylePutriSubHeader },
        { v: "Nama Atlet", t: "s", s: stylePutriSubHeader },
        { v: "Kontingen", t: "s", s: stylePutriSubHeader },
        { v: "Tgl Lahir", t: "s", s: stylePutriSubHeader },
        { v: "THB", t: "s", s: stylePutriSubHeader },
      ]);
      rowMeta.push({ hpt: 20 });

      // Athletes Data Rows
      for (let i = 0; i < maxRows; i++) {
        const pa = paList[i];
        const pi = piList[i];
        const isEven = i % 2 === 1;

        wsData.push([
          { v: pa ? i + 1 : "", t: pa ? "n" : "s", s: getDataStyle(isEven, "center") },
          { v: pa ? pa.nama : "-", t: "s", s: getDataStyle(isEven, "left") },
          { v: pa ? pa.kontingen : "-", t: "s", s: getDataStyle(isEven, "left") },
          { v: pa ? formatDobIndo(pa.dob) : "-", t: "s", s: getDataStyle(isEven, "center") },
          { v: pa ? pa.temuan : "-", t: "s", s: getDataStyle(isEven, "center") },
          { v: "", t: "s", s: styleBlank },
          { v: pi ? i + 1 : "", t: pi ? "n" : "s", s: getDataStyle(isEven, "center") },
          { v: pi ? pi.nama : "-", t: "s", s: getDataStyle(isEven, "left") },
          { v: pi ? pi.kontingen : "-", t: "s", s: getDataStyle(isEven, "left") },
          { v: pi ? formatDobIndo(pi.dob) : "-", t: "s", s: getDataStyle(isEven, "center") },
          { v: pi ? pi.temuan : "-", t: "s", s: getDataStyle(isEven, "center") },
        ]);
        rowMeta.push({ hpt: 19 });
      }

      // Summary Footer Row
      const sumRow: any[] = new Array(11).fill(null).map(() => ({ v: "", t: "s", s: styleSummary }));
      sumRow[0] = { v: "Jumlah Putra", t: "s", s: styleSummary };
      sumRow[1] = { v: paList.length, t: "n", s: styleSummary };
      sumRow[6] = { v: "Jumlah Putri", t: "s", s: styleSummary };
      sumRow[7] = { v: piList.length, t: "n", s: styleSummary };
      sumRow[5] = { v: "", t: "s", s: styleBlank };

      wsData.push(sumRow);
      rowMeta.push({ hpt: 21 });

      // Spacing between classes
      wsData.push([]);
      rowMeta.push({ hpt: 12 });
    });
  }

  // =========================================================================
  // CASE B: GROUP BY KELAS (PUTRA & PUTRI DIGABUNG / VERTICAL LIST)
  // =========================================================================
  else if (config.groupBy === "class") {
    const activeCols: { key: string; label: string; width: number; align: "left" | "center" }[] = [];
    if (config.columns.no) activeCols.push({ key: "no", label: "No", width: 6, align: "center" });
    if (config.columns.nama) activeCols.push({ key: "nama", label: "Nama Atlet", width: 26, align: "left" });
    if (config.columns.kontingen) activeCols.push({ key: "kontingen", label: "Kontingen", width: 20, align: "left" });
    if (config.columns.kategori && config.genderLayout === "merged") {
      activeCols.push({ key: "kategori", label: "Gender", width: 12, align: "center" });
    }
    if (config.columns.dob) activeCols.push({ key: "dob", label: "Tgl Lahir", width: 14, align: "center" });
    if (config.columns.usia) activeCols.push({ key: "usia", label: "Usia", width: 10, align: "center" });
    if (config.columns.temuan) activeCols.push({ key: "temuan", label: "THB", width: 10, align: "center" });
    if (config.columns.catatan) activeCols.push({ key: "catatan", label: "Catatan", width: 24, align: "left" });

    colWidths = activeCols.map((c) => ({ wch: c.width }));
    const totalColSpan = activeCols.length;

    activeClasses.forEach((kelasName) => {
      const startRowIdx = wsData.length;
      const classAthletes = filtered
        .filter((a) => a.kelas === kelasName)
        .sort((a, b) => {
          if (a.kategori !== b.kategori) return a.kategori === "PUTRA" ? -1 : 1;
          const kCmp = a.kontingen.localeCompare(b.kontingen);
          if (kCmp !== 0) return kCmp;
          return a.nama.localeCompare(b.nama);
        });

      const paCount = classAthletes.filter((a) => a.kategori === "PUTRA").length;
      const piCount = classAthletes.filter((a) => a.kategori === "PUTRI").length;

      // Class Banner
      const bannerRow: any[] = new Array(totalColSpan).fill(null).map(() => ({ v: "", t: "s", s: styleBanner }));
      bannerRow[0] = {
        v: `  KELAS: ${kelasName} — (Total: ${classAthletes.length} Atlet | Putra: ${paCount}, Putri: ${piCount})`,
        t: "s",
        s: styleBanner,
      };
      wsData.push(bannerRow);
      merges.push({ s: { r: startRowIdx, c: 0 }, e: { r: startRowIdx, c: totalColSpan - 1 } });
      rowMeta.push({ hpt: 24 });

      // Header Row
      const headerRow = activeCols.map((col) => ({
        v: col.label,
        t: "s",
        s: styleSubHeader,
      }));
      wsData.push(headerRow);
      rowMeta.push({ hpt: 20 });

      // Athletes Rows
      if (classAthletes.length === 0) {
        const emptyRow: any[] = new Array(totalColSpan).fill(null).map(() => ({
          v: "-",
          t: "s",
          s: getDataStyle(false, "center"),
        }));
        emptyRow[1] = {
          v: "Tidak ada atlet terdaftar di kelas ini",
          t: "s",
          s: getDataStyle(false, "left"),
        };
        wsData.push(emptyRow);
        rowMeta.push({ hpt: 19 });
      } else {
        classAthletes.forEach((ath, idx) => {
          const isEven = idx % 2 === 1;
          const row = activeCols.map((col) => {
            let val: any = "";
            let t: string = "s";
            if (col.key === "no") {
              val = idx + 1;
              t = "n";
            } else if (col.key === "nama") val = ath.nama;
            else if (col.key === "kontingen") val = ath.kontingen;
            else if (col.key === "kategori") val = ath.kategori;
            else if (col.key === "dob") val = formatDobIndo(ath.dob);
            else if (col.key === "usia") val = calculateAge(ath.dob);
            else if (col.key === "temuan") val = ath.temuan;
            else if (col.key === "catatan") val = ath.catatan || "-";

            return { v: val, t, s: getDataStyle(isEven, col.align) };
          });
          wsData.push(row);
          rowMeta.push({ hpt: 19 });
        });
      }

      // Summary Footer Row
      const sumRow: any[] = new Array(totalColSpan).fill(null).map(() => ({ v: "", t: "s", s: styleSummary }));
      sumRow[0] = { v: "Total Atlet Kelas", t: "s", s: styleSummary };
      sumRow[1] = { v: `${classAthletes.length} Atlet`, t: "s", s: styleSummary };
      wsData.push(sumRow);
      rowMeta.push({ hpt: 21 });

      // Spacer
      wsData.push([]);
      rowMeta.push({ hpt: 12 });
    });
  }

  // =========================================================================
  // CASE C: GROUP BY KONTINGEN (TABEL TERPISAH ANTAR KONTINGEN)
  // =========================================================================
  else if (config.groupBy === "contingent") {
    const activeCols: { key: string; label: string; width: number; align: "left" | "center" }[] = [];
    if (config.columns.no) activeCols.push({ key: "no", label: "No", width: 6, align: "center" });
    if (config.columns.nama) activeCols.push({ key: "nama", label: "Nama Atlet", width: 26, align: "left" });
    if (config.columns.kelas) activeCols.push({ key: "kelas", label: "Kelas Berat", width: 18, align: "center" });
    if (config.columns.kategori) activeCols.push({ key: "kategori", label: "Gender", width: 12, align: "center" });
    if (config.columns.dob) activeCols.push({ key: "dob", label: "Tgl Lahir", width: 14, align: "center" });
    if (config.columns.usia) activeCols.push({ key: "usia", label: "Usia", width: 10, align: "center" });
    if (config.columns.temuan) activeCols.push({ key: "temuan", label: "THB", width: 10, align: "center" });
    if (config.columns.catatan) activeCols.push({ key: "catatan", label: "Catatan", width: 24, align: "left" });

    colWidths = activeCols.map((c) => ({ wch: c.width }));
    const totalColSpan = activeCols.length;

    activeContingents.forEach((kontingenName) => {
      const startRowIdx = wsData.length;
      const kAthletes = filtered
        .filter((a) => a.kontingen === kontingenName)
        .sort((a, b) => {
          const idxA = WEIGHT_CLASSES.indexOf(a.kelas as any);
          const idxB = WEIGHT_CLASSES.indexOf(b.kelas as any);
          if (idxA !== idxB) return idxA - idxB;
          if (a.kategori !== b.kategori) return a.kategori === "PUTRA" ? -1 : 1;
          return a.nama.localeCompare(b.nama);
        });

      const paCount = kAthletes.filter((a) => a.kategori === "PUTRA").length;
      const piCount = kAthletes.filter((a) => a.kategori === "PUTRI").length;

      // Contingent Header Banner
      const bannerRow: any[] = new Array(totalColSpan).fill(null).map(() => ({ v: "", t: "s", s: styleBanner }));
      bannerRow[0] = {
        v: `  KONTINGEN: ${kontingenName.toUpperCase()} — (Total: ${kAthletes.length} Atlet | Putra: ${paCount}, Putri: ${piCount})`,
        t: "s",
        s: styleBanner,
      };
      wsData.push(bannerRow);
      merges.push({ s: { r: startRowIdx, c: 0 }, e: { r: startRowIdx, c: totalColSpan - 1 } });
      rowMeta.push({ hpt: 24 });

      // Column Headers
      const headerRow = activeCols.map((col) => ({
        v: col.label,
        t: "s",
        s: styleSubHeader,
      }));
      wsData.push(headerRow);
      rowMeta.push({ hpt: 20 });

      // Data Rows
      if (kAthletes.length === 0) {
        const emptyRow: any[] = new Array(totalColSpan).fill(null).map(() => ({
          v: "-",
          t: "s",
          s: getDataStyle(false, "center"),
        }));
        emptyRow[1] = {
          v: "Tidak ada atlet terdaftar dari kontingen ini",
          t: "s",
          s: getDataStyle(false, "left"),
        };
        wsData.push(emptyRow);
        rowMeta.push({ hpt: 19 });
      } else {
        kAthletes.forEach((ath, idx) => {
          const isEven = idx % 2 === 1;
          const row = activeCols.map((col) => {
            let val: any = "";
            let t: string = "s";
            if (col.key === "no") {
              val = idx + 1;
              t = "n";
            } else if (col.key === "nama") val = ath.nama;
            else if (col.key === "kelas") val = ath.kelas;
            else if (col.key === "kategori") val = ath.kategori;
            else if (col.key === "dob") val = formatDobIndo(ath.dob);
            else if (col.key === "usia") val = calculateAge(ath.dob);
            else if (col.key === "temuan") val = ath.temuan;
            else if (col.key === "catatan") val = ath.catatan || "-";

            return { v: val, t, s: getDataStyle(isEven, col.align) };
          });
          wsData.push(row);
          rowMeta.push({ hpt: 19 });
        });
      }

      // Summary Footer Row
      const sumRow: any[] = new Array(totalColSpan).fill(null).map(() => ({ v: "", t: "s", s: styleSummary }));
      sumRow[0] = { v: "Total Atlet Kontingen", t: "s", s: styleSummary };
      sumRow[1] = { v: `${kAthletes.length} Atlet`, t: "s", s: styleSummary };
      wsData.push(sumRow);
      rowMeta.push({ hpt: 21 });

      // Spacer between contingents
      wsData.push([]);
      rowMeta.push({ hpt: 14 });
    });
  }

  // =========================================================================
  // CASE D: FLAT UNIFIED TABLE (1 TABEL MASTER SELURUH ATLET)
  // =========================================================================
  else {
    const activeCols: { key: string; label: string; width: number; align: "left" | "center" }[] = [];
    if (config.columns.no) activeCols.push({ key: "no", label: "No", width: 6, align: "center" });
    if (config.columns.nama) activeCols.push({ key: "nama", label: "Nama Atlet", width: 26, align: "left" });
    if (config.columns.kontingen) activeCols.push({ key: "kontingen", label: "Kontingen", width: 20, align: "left" });
    if (config.columns.kelas) activeCols.push({ key: "kelas", label: "Kelas Berat", width: 18, align: "center" });
    if (config.columns.kategori) activeCols.push({ key: "kategori", label: "Gender", width: 12, align: "center" });
    if (config.columns.dob) activeCols.push({ key: "dob", label: "Tgl Lahir", width: 14, align: "center" });
    if (config.columns.usia) activeCols.push({ key: "usia", label: "Usia", width: 10, align: "center" });
    if (config.columns.temuan) activeCols.push({ key: "temuan", label: "THB", width: 10, align: "center" });
    if (config.columns.catatan) activeCols.push({ key: "catatan", label: "Catatan", width: 24, align: "left" });

    colWidths = activeCols.map((c) => ({ wch: c.width }));
    const totalColSpan = activeCols.length;

    // Header
    const headerRow = activeCols.map((col) => ({
      v: col.label,
      t: "s",
      s: styleSubHeader,
    }));
    wsData.push(headerRow);
    rowMeta.push({ hpt: 22 });

    // Sorted Flat List
    const sortedList = [...filtered].sort((a, b) => {
      const idxA = WEIGHT_CLASSES.indexOf(a.kelas as any);
      const idxB = WEIGHT_CLASSES.indexOf(b.kelas as any);
      if (idxA !== idxB) return idxA - idxB;
      if (a.kategori !== b.kategori) return a.kategori === "PUTRA" ? -1 : 1;
      const kCmp = a.kontingen.localeCompare(b.kontingen);
      if (kCmp !== 0) return kCmp;
      return a.nama.localeCompare(b.nama);
    });

    sortedList.forEach((ath, idx) => {
      const isEven = idx % 2 === 1;
      const row = activeCols.map((col) => {
        let val: any = "";
        let t: string = "s";
        if (col.key === "no") {
          val = idx + 1;
          t = "n";
        } else if (col.key === "nama") val = ath.nama;
        else if (col.key === "kontingen") val = ath.kontingen;
        else if (col.key === "kelas") val = ath.kelas;
        else if (col.key === "kategori") val = ath.kategori;
        else if (col.key === "dob") val = formatDobIndo(ath.dob);
        else if (col.key === "usia") val = calculateAge(ath.dob);
        else if (col.key === "temuan") val = ath.temuan;
        else if (col.key === "catatan") val = ath.catatan || "-";

        return { v: val, t, s: getDataStyle(isEven, col.align) };
      });
      wsData.push(row);
      rowMeta.push({ hpt: 19 });
    });

    // Grand total
    const sumRow: any[] = new Array(totalColSpan).fill(null).map(() => ({ v: "", t: "s", s: styleSummary }));
    sumRow[0] = { v: "TOTAL KESELURUHAN", t: "s", s: styleSummary };
    sumRow[1] = { v: `${sortedList.length} Atlet`, t: "s", s: styleSummary };
    wsData.push(sumRow);
    rowMeta.push({ hpt: 22 });
  }

  // Create Workbook with EXACTLY 1 Sheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws["!cols"] = colWidths;
  ws["!rows"] = rowMeta;
  if (merges.length > 0) {
    ws["!merges"] = merges;
  }

  // Clean sheet name (Excel limits sheet names to 31 chars and no invalid chars)
  const cleanSheetName = (config.sheetName || "Tabel_Per_Kelas")
    .replace(/[:\\/?*\[\]]/g, "")
    .substring(0, 31);

  XLSX.utils.book_append_sheet(wb, ws, cleanSheetName);

  // Generate Filename
  const dateStamp = new Date().toISOString().split("T")[0];
  const fileSafeTitle = config.title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .substring(0, 35);
  const fileName = `${fileSafeTitle}_1sheet_${dateStamp}.xlsx`;

  XLSX.writeFile(wb, fileName);
}
