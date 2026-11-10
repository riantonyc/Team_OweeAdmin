export interface Athlete {
  id: number;
  nama: string;
  kontingen: string;
  kategori: "PUTRA" | "PUTRI";
  kelas: string;
  dob: string; // YYYY-MM-DD
  temuan: "Ya" | "-";
  status: "Aktif" | "Dicabut";
  catatan?: string;
}

export interface KpiData {
  totalAktif: number;
  totalAll: number;
  putraAktif: number;
  putriAktif: number;
  kontingenAktif: number;
  totalKelas: number;
}
