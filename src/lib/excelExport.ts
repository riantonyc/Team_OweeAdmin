import XLSX from "xlsx-js-style";
import { Athlete } from "./types";
import { WEIGHT_CLASSES, KALBAR_CONTINGENTS } from "./constants";

export function formatDobIndo(dobStr: string): string {
  if (!dobStr) return "-";
  const parts = dobStr.split("-");
  if (parts.length !== 3) return dobStr;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

export function calculateAge(dobStr: string): string {
  if (!dobStr) return "-";
  const birthYear = parseInt(dobStr.split("-")[0], 10);
  if (isNaN(birthYear)) return "-";
  const age = 2026 - birthYear;
  return `${age} thn`;
}

export function exportAthletesToExcel(athletes: Athlete[], mode: "formula" | "static" = "formula") {
  const wb = XLSX.utils.book_new();

  // Border and Style Definitions
  const thinBorder = {
    top: { style: "thin", color: { rgb: "BFBFBF" } },
    bottom: { style: "thin", color: { rgb: "BFBFBF" } },
    left: { style: "thin", color: { rgb: "BFBFBF" } },
    right: { style: "thin", color: { rgb: "BFBFBF" } },
  };

  const mediumBoxBorder = {
    top: { style: "medium", color: { rgb: "1F3864" } },
    bottom: { style: "medium", color: { rgb: "1F3864" } },
    left: { style: "thin", color: { rgb: "8EA9DB" } },
    right: { style: "thin", color: { rgb: "8EA9DB" } },
  };

  const styleTitle = {
    font: { name: "Arial", sz: 12, bold: true, color: { rgb: "1F3864" } },
    alignment: { horizontal: "left", vertical: "center" },
  };

  const styleSubtitle = {
    font: { name: "Arial", sz: 9, italic: true, color: { rgb: "595959" } },
    alignment: { horizontal: "left", vertical: "center" },
  };

  const styleBannerNavy = {
    fill: { patternType: "solid", fgColor: { rgb: "1F3864" } },
    font: { name: "Arial", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
    alignment: { horizontal: "left", vertical: "center" },
    border: thinBorder,
  };

  const stylePutraHeader = {
    fill: { patternType: "solid", fgColor: { rgb: "2E75B6" } },
    font: { name: "Arial", sz: 10, bold: true, color: { rgb: "FFFFFF" } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: thinBorder,
  };

  const stylePutriHeader = {
    fill: { patternType: "solid", fgColor: { rgb: "C0504D" } },
    font: { name: "Arial", sz: 10, bold: true, color: { rgb: "FFFFFF" } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: thinBorder,
  };

  const styleSumPutra = {
    fill: { patternType: "solid", fgColor: { rgb: "D9E1F2" } },
    font: { name: "Arial", sz: 10, bold: true, color: { rgb: "1F3864" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: mediumBoxBorder,
  };

  const styleSumPutri = {
    fill: { patternType: "solid", fgColor: { rgb: "F2DCDB" } },
    font: { name: "Arial", sz: 10, bold: true, color: { rgb: "7A1C1A" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: mediumBoxBorder,
  };

  const makeDataCellStyle = (isEven: boolean, align: "left" | "center" | "right" = "left", isHighlight: boolean = false) => ({
    fill: {
      patternType: "solid",
      fgColor: { rgb: isHighlight ? "FFF2CC" : isEven ? "F9FAFC" : "FFFFFF" },
    },
    font: { name: "Arial", sz: 10, bold: isHighlight, color: { rgb: "111827" } },
    alignment: { horizontal: align, vertical: "center" },
    border: thinBorder,
  });

  // Sort athletes canonically: class -> category -> contingent -> name
  const sortedAthletes = [...athletes].sort((a, b) => {
    const idxA = WEIGHT_CLASSES.indexOf(a.kelas as any);
    const idxB = WEIGHT_CLASSES.indexOf(b.kelas as any);
    if (idxA !== idxB) return idxA - idxB;
    if (a.kategori !== b.kategori) return a.kategori === "PUTRA" ? -1 : 1;
    const kCmp = a.kontingen.localeCompare(b.kontingen);
    if (kCmp !== 0) return kCmp;
    return a.nama.localeCompare(b.nama);
  });

  // =========================================================================
  // SHEET 1: Tabel_Per_Kelas (Exact Book1 Side-by-Side Styled Layout)
  // =========================================================================
  const wsClassData: any[][] = [];
  const classMerges: any[] = [];
  const classRowsMeta: any[] = [];

  // Row 1: Title
  wsClassData.push([
    { v: "DAFTAR ATLET PER KELAS BERAT BADAN — MUAYTHAI (TARUNG) PORPROV XIV KALBAR", t: "s", s: styleTitle },
    null, null, null, null, null, null, null, null, null, null,
  ]);
  classMerges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } });
  classRowsMeta.push({ hpt: 24 });

  // Row 2: Subtitle
  wsClassData.push([
    { v: "Sistem Terintegrasi: Perubahan pada sheet Database_Atlet otomatis memperbarui tabel per kelas dan rekap kontingen.", t: "s", s: styleSubtitle },
    null, null, null, null, null, null, null, null, null, null,
  ]);
  classMerges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 10 } });
  classRowsMeta.push({ hpt: 18 });

  // Row 3: Blank spacer
  wsClassData.push([]);
  classRowsMeta.push({ hpt: 10 });

  let currentRowIdx = 3;

  WEIGHT_CLASSES.forEach((kelasName) => {
    const paList = sortedAthletes.filter(
      (a) => a.status === "Aktif" && a.kelas === kelasName && a.kategori === "PUTRA"
    );
    const piList = sortedAthletes.filter(
      (a) => a.status === "Aktif" && a.kelas === kelasName && a.kategori === "PUTRI"
    );

    // Class Banner Row (Merged A:K)
    const bannerRow: any[] = [];
    for (let c = 0; c <= 10; c++) {
      bannerRow.push({
        v: c === 0 ? kelasName : "",
        t: "s",
        s: styleBannerNavy,
      });
    }
    wsClassData.push(bannerRow);
    classMerges.push({ s: { r: currentRowIdx, c: 0 }, e: { r: currentRowIdx, c: 10 } });
    classRowsMeta.push({ hpt: 24 });
    currentRowIdx++;

    // PUTRA & PUTRI Group Header Row
    const groupHeaderRow = [
      { v: "PUTRA", t: "s", s: stylePutraHeader },
      { v: "", t: "s", s: stylePutraHeader },
      { v: "", t: "s", s: stylePutraHeader },
      { v: "", t: "s", s: stylePutraHeader },
      { v: "", t: "s", s: stylePutraHeader },
      { v: "", t: "s" },
      { v: "PUTRI", t: "s", s: stylePutriHeader },
      { v: "", t: "s", s: stylePutriHeader },
      { v: "", t: "s", s: stylePutriHeader },
      { v: "", t: "s", s: stylePutriHeader },
      { v: "", t: "s", s: stylePutriHeader },
    ];
    wsClassData.push(groupHeaderRow);
    classMerges.push({ s: { r: currentRowIdx, c: 0 }, e: { r: currentRowIdx, c: 4 } });
    classMerges.push({ s: { r: currentRowIdx, c: 6 }, e: { r: currentRowIdx, c: 10 } });
    classRowsMeta.push({ hpt: 21 });
    currentRowIdx++;

    // Column Headers Row
    const colHeaderRow = [
      { v: "No", t: "s", s: stylePutraHeader },
      { v: "Nama", t: "s", s: stylePutraHeader },
      { v: "Kontingen", t: "s", s: stylePutraHeader },
      { v: "Tgl Lahir", t: "s", s: stylePutraHeader },
      { v: "Temuan", t: "s", s: stylePutraHeader },
      { v: "", t: "s" },
      { v: "No", t: "s", s: stylePutriHeader },
      { v: "Nama", t: "s", s: stylePutriHeader },
      { v: "Kontingen", t: "s", s: stylePutriHeader },
      { v: "Tgl Lahir", t: "s", s: stylePutriHeader },
      { v: "Temuan", t: "s", s: stylePutriHeader },
    ];
    wsClassData.push(colHeaderRow);
    classRowsMeta.push({ hpt: 21 });
    currentRowIdx++;

    // Slot count
    const maxActive = Math.max(paList.length, piList.length, 1);
    const slotCount = mode === "formula" ? Math.max(maxActive + 2, 4) : maxActive;
    const firstDataExcelRow = currentRowIdx + 1;
    const lastDataExcelRow = currentRowIdx + slotCount;

    for (let i = 0; i < slotCount; i++) {
      const isEven = i % 2 === 1;
      const pa = paList[i];
      const pi = piList[i];
      const slotNum = i + 1;
      const paKey = `${kelasName}|PUTRA|${slotNum}`;
      const piKey = `${kelasName}|PUTRI|${slotNum}`;

      let paCells: any[], piCells: any[];

      if (mode === "formula") {
        paCells = [
          {
            t: pa ? "n" : "s",
            v: pa ? slotNum : "",
            f: `IFERROR(IF(INDEX(Database_Atlet!$B$5:$B$200,MATCH("${paKey}",Database_Atlet!$I$5:$I$200,0))="","",${slotNum}),"")`,
            s: makeDataCellStyle(isEven, "center"),
          },
          {
            t: "s",
            v: pa ? pa.nama : "",
            f: `IFERROR(INDEX(Database_Atlet!$B$5:$B$200,MATCH("${paKey}",Database_Atlet!$I$5:$I$200,0)),"")`,
            s: makeDataCellStyle(isEven, "left"),
          },
          {
            t: "s",
            v: pa ? pa.kontingen : "",
            f: `IFERROR(INDEX(Database_Atlet!$C$5:$C$200,MATCH("${paKey}",Database_Atlet!$I$5:$I$200,0)),"")`,
            s: makeDataCellStyle(isEven, "left"),
          },
          {
            t: "s",
            v: pa ? formatDobIndo(pa.dob) : "",
            f: `IFERROR(INDEX(Database_Atlet!$F$5:$F$200,MATCH("${paKey}",Database_Atlet!$I$5:$I$200,0)),"")`,
            s: makeDataCellStyle(isEven, "center"),
          },
          {
            t: "s",
            v: pa ? pa.temuan : "",
            f: `IFERROR(INDEX(Database_Atlet!$G$5:$G$200,MATCH("${paKey}",Database_Atlet!$I$5:$I$200,0)),"")`,
            s: makeDataCellStyle(isEven, "center"),
          },
        ];

        piCells = [
          {
            t: pi ? "n" : "s",
            v: pi ? slotNum : "",
            f: `IFERROR(IF(INDEX(Database_Atlet!$B$5:$B$200,MATCH("${piKey}",Database_Atlet!$I$5:$I$200,0))="","",${slotNum}),"")`,
            s: makeDataCellStyle(isEven, "center"),
          },
          {
            t: "s",
            v: pi ? pi.nama : "",
            f: `IFERROR(INDEX(Database_Atlet!$B$5:$B$200,MATCH("${piKey}",Database_Atlet!$I$5:$I$200,0)),"")`,
            s: makeDataCellStyle(isEven, "left"),
          },
          {
            t: "s",
            v: pi ? pi.kontingen : "",
            f: `IFERROR(INDEX(Database_Atlet!$C$5:$C$200,MATCH("${piKey}",Database_Atlet!$I$5:$I$200,0)),"")`,
            s: makeDataCellStyle(isEven, "left"),
          },
          {
            t: "s",
            v: pi ? formatDobIndo(pi.dob) : "",
            f: `IFERROR(INDEX(Database_Atlet!$F$5:$F$200,MATCH("${piKey}",Database_Atlet!$I$5:$I$200,0)),"")`,
            s: makeDataCellStyle(isEven, "center"),
          },
          {
            t: "s",
            v: pi ? pi.temuan : "",
            f: `IFERROR(INDEX(Database_Atlet!$G$5:$G$200,MATCH("${piKey}",Database_Atlet!$I$5:$I$200,0)),"")`,
            s: makeDataCellStyle(isEven, "center"),
          },
        ];
      } else {
        paCells = [
          { v: pa ? slotNum : "", t: pa ? "n" : "s", s: makeDataCellStyle(isEven, "center") },
          { v: pa ? pa.nama : "", t: "s", s: makeDataCellStyle(isEven, "left") },
          { v: pa ? pa.kontingen : "", t: "s", s: makeDataCellStyle(isEven, "left") },
          { v: pa ? formatDobIndo(pa.dob) : "", t: "s", s: makeDataCellStyle(isEven, "center") },
          { v: pa ? pa.temuan : "", t: "s", s: makeDataCellStyle(isEven, "center") },
        ];
        piCells = [
          { v: pi ? slotNum : "", t: pi ? "n" : "s", s: makeDataCellStyle(isEven, "center") },
          { v: pi ? pi.nama : "", t: "s", s: makeDataCellStyle(isEven, "left") },
          { v: pi ? pi.kontingen : "", t: "s", s: makeDataCellStyle(isEven, "left") },
          { v: pi ? formatDobIndo(pi.dob) : "", t: "s", s: makeDataCellStyle(isEven, "center") },
          { v: pi ? pi.temuan : "", t: "s", s: makeDataCellStyle(isEven, "center") },
        ];
      }

      wsClassData.push([...paCells, { v: "", t: "s" }, ...piCells]);
      classRowsMeta.push({ hpt: 20 });
      currentRowIdx++;
    }

    // Summary Row
    const sumRow = [
      { v: "Jumlah", t: "s", s: styleSumPutra },
      mode === "formula"
        ? { v: paList.length, t: "n", f: `COUNT(A${firstDataExcelRow}:A${lastDataExcelRow})`, s: styleSumPutra }
        : { v: paList.length, t: "n", s: styleSumPutra },
      { v: "", t: "s", s: styleSumPutra },
      { v: "", t: "s", s: styleSumPutra },
      { v: "", t: "s", s: styleSumPutra },
      { v: "", t: "s" },
      { v: "Jumlah", t: "s", s: styleSumPutri },
      mode === "formula"
        ? { v: piList.length, t: "n", f: `COUNT(G${firstDataExcelRow}:G${lastDataExcelRow})`, s: styleSumPutri }
        : { v: piList.length, t: "n", s: styleSumPutri },
      { v: "", t: "s", s: styleSumPutri },
      { v: "", t: "s", s: styleSumPutri },
      { v: "", t: "s", s: styleSumPutri },
    ];
    wsClassData.push(sumRow);
    classRowsMeta.push({ hpt: 22 });
    currentRowIdx++;

    // Spacer
    wsClassData.push([]);
    classRowsMeta.push({ hpt: 12 });
    currentRowIdx++;
  });

  const wsClass = XLSX.utils.aoa_to_sheet(wsClassData);
  wsClass["!merges"] = classMerges;
  wsClass["!rows"] = classRowsMeta;
  wsClass["!cols"] = [
    { wch: 6 },
    { wch: 30 },
    { wch: 18 },
    { wch: 14 },
    { wch: 10 },
    { wch: 4 },
    { wch: 6 },
    { wch: 30 },
    { wch: 18 },
    { wch: 14 },
    { wch: 10 },
  ];

  // =========================================================================
  // SHEET 2: Database_Atlet
  // =========================================================================
  const wsDbData: any[][] = [];
  const dbMerges: any[] = [];
  const dbRowsMeta: any[] = [];

  // Banner
  const dbBannerRow: any[] = [];
  for (let c = 0; c < 9; c++) {
    dbBannerRow.push({
      v: c === 0 ? "DATABASE PUSAT ATLET MUAYTHAI (TARUNG) — PORPROV XIV KALBAR" : "",
      t: "s",
      s: styleBannerNavy,
    });
  }
  wsDbData.push(dbBannerRow);
  dbMerges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } });
  dbRowsMeta.push({ hpt: 26 });

  // Subtitle
  wsDbData.push([
    {
      v: "PETUNJUK: Ubah Kelas Berat Badan, Kontingen, Kategori, atau Status di tabel ini. Sheet Tabel_Per_Kelas & Rekap_Kontingen akan terupdate otomatis.",
      t: "s",
      s: styleSubtitle,
    },
    null, null, null, null, null, null, null, null,
  ]);
  dbMerges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 8 } });
  dbRowsMeta.push({ hpt: 18 });

  wsDbData.push([]);
  dbRowsMeta.push({ hpt: 8 });

  // Headers
  const dbHeaders = [
    "ID",
    "Nama Lengkap Atlet",
    "Kontingen",
    "Kategori",
    "Kelas Berat Badan",
    "Tgl Lahir",
    "Temuan THB",
    "Status Atlet",
    "Kode Urut Otomatis (Jangan Diubah)",
  ];
  wsDbData.push(dbHeaders.map((h) => ({ v: h, t: "s", s: stylePutraHeader })));
  dbRowsMeta.push({ hpt: 24 });

  const totalDbSlots = Math.max(sortedAthletes.length + 25, 100);
  const classOrderCounts: Record<string, number> = {};

  for (let i = 0; i < totalDbSlots; i++) {
    const excelRow = i + 5;
    const a = sortedAthletes[i];
    const isEven = i % 2 === 1;

    let computedKey = "";
    if (a && a.status === "Aktif") {
      const gk = `${a.kelas}|${a.kategori}`;
      classOrderCounts[gk] = (classOrderCounts[gk] || 0) + 1;
      computedKey = `${gk}|${classOrderCounts[gk]}`;
    }

    const kategoriStyle = a
      ? {
          fill: { patternType: "solid", fgColor: { rgb: a.kategori === "PUTRA" ? "DDEBF7" : "FCE4D6" } },
          font: { name: "Arial", sz: 10, bold: true, color: { rgb: a.kategori === "PUTRA" ? "1F4E78" : "C00000" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: thinBorder,
        }
      : makeDataCellStyle(isEven, "center");

    const statusStyle = a
      ? {
          fill: { patternType: "solid", fgColor: { rgb: a.status === "Aktif" ? "E2EFDA" : "F8CBAD" } },
          font: { name: "Arial", sz: 10, bold: true, color: { rgb: a.status === "Aktif" ? "375623" : "C00000" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: thinBorder,
        }
      : makeDataCellStyle(isEven, "center");

    const codeStyle = {
      fill: { patternType: "solid", fgColor: { rgb: "F2F2F2" } },
      font: { name: "Consolas", sz: 9, italic: true, color: { rgb: "595959" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: thinBorder,
    };

    wsDbData.push([
      { v: i + 1, t: "n", s: makeDataCellStyle(isEven, "center") },
      { v: a ? a.nama : "", t: "s", s: makeDataCellStyle(isEven, "left") },
      { v: a ? a.kontingen : "", t: "s", s: makeDataCellStyle(isEven, "left") },
      { v: a ? a.kategori : "", t: "s", s: kategoriStyle },
      { v: a ? a.kelas : "", t: "s", s: makeDataCellStyle(isEven, "center") },
      { v: a ? formatDobIndo(a.dob) : "", t: "s", s: makeDataCellStyle(isEven, "center") },
      { v: a ? a.temuan : "", t: "s", s: makeDataCellStyle(isEven, "center") },
      { v: a ? a.status : i < sortedAthletes.length ? "Aktif" : "", t: "s", s: statusStyle },
      {
        t: "s",
        v: computedKey,
        f: `IF(OR(B${excelRow}="",H${excelRow}<>"Aktif"),"",E${excelRow}&"|"&D${excelRow}&"|"&COUNTIFS($E$5:E${excelRow},E${excelRow},$D$5:D${excelRow},D${excelRow},$H$5:H${excelRow},"Aktif"))`,
        s: codeStyle,
      },
    ]);
    dbRowsMeta.push({ hpt: 20 });
  }

  const wsDb = XLSX.utils.aoa_to_sheet(wsDbData);
  wsDb["!merges"] = dbMerges;
  wsDb["!rows"] = dbRowsMeta;
  wsDb["!cols"] = [
    { wch: 6 },
    { wch: 32 },
    { wch: 18 },
    { wch: 12 },
    { wch: 18 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 28 },
  ];
  wsDb["!autofilter"] = { ref: `A4:I${totalDbSlots + 4}` };

  // =========================================================================
  // SHEET 3: Rekap_Kontingen
  // =========================================================================
  const activeContingents = [
    "Bengkayang",
    "Kapuas Hulu",
    "Kayong Utara",
    "Ketapang",
    "Kota Pontianak",
    "Kubu Raya",
    "Mempawah",
    "Sambas",
  ];
  const totalMatrixCols = 5 + activeContingents.length;
  const wsMatrixData: any[][] = [];
  const matrixMerges: any[] = [];
  const matrixRowsMeta: any[] = [];

  const matrixBanner: any[] = [];
  for (let c = 0; c < totalMatrixCols; c++) {
    matrixBanner.push({
      v: c === 0 ? "REKAPITULASI JUMLAH ATLET AKTIF PER KELAS & KONTINGEN — MUAYTHAI PORPROV XIV KALBAR" : "",
      t: "s",
      s: styleBannerNavy,
    });
  }
  wsMatrixData.push(matrixBanner);
  matrixMerges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalMatrixCols - 1 } });
  matrixRowsMeta.push({ hpt: 25 });

  wsMatrixData.push([]);
  matrixRowsMeta.push({ hpt: 10 });

  const matrixHeaders = [
    { v: "No", t: "s", s: stylePutraHeader },
    { v: "Kelas Berat Badan", t: "s", s: stylePutraHeader },
    { v: "Putra", t: "s", s: stylePutraHeader },
    { v: "Putri", t: "s", s: stylePutriHeader },
    { v: "Total", t: "s", s: styleBannerNavy },
    ...activeContingents.map((k) => ({ v: k, t: "s", s: stylePutraHeader })),
  ];
  wsMatrixData.push(matrixHeaders);
  matrixRowsMeta.push({ hpt: 24 });

  const activeList = sortedAthletes.filter((a) => a.status === "Aktif");

  WEIGHT_CLASSES.forEach((kelasName, idx) => {
    const rNum = idx + 4;
    const isEven = idx % 2 === 1;
    const paCnt = activeList.filter((a) => a.kelas === kelasName && a.kategori === "PUTRA").length;
    const piCnt = activeList.filter((a) => a.kelas === kelasName && a.kategori === "PUTRI").length;
    const totCnt = paCnt + piCnt;

    const rowCells = [
      { v: idx + 1, t: "n", s: makeDataCellStyle(isEven, "center") },
      { v: kelasName, t: "s", s: makeDataCellStyle(isEven, "left", true) },
      {
        v: paCnt,
        t: "n",
        f: `COUNTIFS(Database_Atlet!$E$5:$E$200,B${rNum},Database_Atlet!$D$5:$D$200,"PUTRA",Database_Atlet!$H$5:$H$200,"Aktif")`,
        s: makeDataCellStyle(isEven, "center"),
      },
      {
        v: piCnt,
        t: "n",
        f: `COUNTIFS(Database_Atlet!$E$5:$E$200,B${rNum},Database_Atlet!$D$5:$D$200,"PUTRI",Database_Atlet!$H$5:$H$200,"Aktif")`,
        s: makeDataCellStyle(isEven, "center"),
      },
      {
        v: totCnt,
        t: "n",
        f: `C${rNum}+D${rNum}`,
        s: styleSumPutra,
      },
    ];

    activeContingents.forEach((kName, kIdx) => {
      const colLetter = XLSX.utils.encode_col(5 + kIdx);
      const kCnt = activeList.filter((a) => a.kelas === kelasName && a.kontingen === kName).length;
      rowCells.push({
        v: kCnt,
        t: "n",
        f: `COUNTIFS(Database_Atlet!$E$5:$E$200,$B${rNum},Database_Atlet!$C$5:$C$200,${colLetter}$3,Database_Atlet!$H$5:$H$200,"Aktif")`,
        s: makeDataCellStyle(isEven, "center"),
      });
    });

    wsMatrixData.push(rowCells);
    matrixRowsMeta.push({ hpt: 20 });
  });

  const totalPutraAll = activeList.filter((a) => a.kategori === "PUTRA").length;
  const totalPutriAll = activeList.filter((a) => a.kategori === "PUTRI").length;
  const grandTotalRow = [
    { v: "", t: "s", s: styleSumPutra },
    { v: "TOTAL KESELURUHAN", t: "s", s: styleSumPutra },
    { v: totalPutraAll, t: "n", f: "SUM(C4:C14)", s: styleSumPutra },
    { v: totalPutriAll, t: "n", f: "SUM(D4:D14)", s: styleSumPutri },
    { v: activeList.length, t: "n", f: "SUM(E4:E14)", s: styleSumPutra },
  ];

  activeContingents.forEach((kName, kIdx) => {
    const colLetter = XLSX.utils.encode_col(5 + kIdx);
    const kTotal = activeList.filter((a) => a.kontingen === kName).length;
    grandTotalRow.push({
      v: kTotal,
      t: "n",
      f: `SUM(${colLetter}4:${colLetter}14)`,
      s: styleSumPutra,
    });
  });

  wsMatrixData.push(grandTotalRow);
  matrixRowsMeta.push({ hpt: 23 });

  const wsMatrix = XLSX.utils.aoa_to_sheet(wsMatrixData);
  wsMatrix["!merges"] = matrixMerges;
  wsMatrix["!rows"] = matrixRowsMeta;
  wsMatrix["!cols"] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    ...activeContingents.map(() => ({ wch: 15 })),
  ];

  // =========================================================================
  // SHEET 4: Referensi_Data
  // =========================================================================
  const wsRefData: any[][] = [
    [
      { v: "DAFTAR KELAS BERAT BADAN", t: "s", s: stylePutraHeader },
      { v: "", t: "s" },
      { v: "DAFTAR KONTINGEN KABUPATEN / KOTA", t: "s", s: stylePutraHeader },
    ],
  ];
  const maxRefLen = Math.max(WEIGHT_CLASSES.length, KALBAR_CONTINGENTS.length);
  for (let i = 0; i < maxRefLen; i++) {
    wsRefData.push([
      { v: WEIGHT_CLASSES[i] || "", t: "s", s: makeDataCellStyle(i % 2 === 1, "left") },
      { v: "", t: "s" },
      { v: KALBAR_CONTINGENTS[i] || "", t: "s", s: makeDataCellStyle(i % 2 === 1, "left") },
    ]);
  }
  const wsRef = XLSX.utils.aoa_to_sheet(wsRefData);
  wsRef["!cols"] = [{ wch: 24 }, { wch: 6 }, { wch: 28 }];

  // Append sheets
  XLSX.utils.book_append_sheet(wb, wsClass, "Tabel_Per_Kelas");
  XLSX.utils.book_append_sheet(wb, wsDb, "Database_Atlet");
  XLSX.utils.book_append_sheet(wb, wsMatrix, "Rekap_Kontingen");
  XLSX.utils.book_append_sheet(wb, wsRef, "Referensi_Data");

  const fileName =
    mode === "formula"
      ? "Book1_Muaythai_Porprov_Berwarna_Otomatis.xlsx"
      : "Book1_Muaythai_Porprov_Siap_Cetak.xlsx";

  XLSX.writeFile(wb, fileName);
}
