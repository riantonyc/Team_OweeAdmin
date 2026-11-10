export const WEIGHT_CLASSES = [
  "KELAS 48 KG",
  "KELAS 51 KG",
  "KELAS 54 KG",
  "KELAS 57 KG",
  "KELAS 61 KG",
  "KELAS 63 KG",
  "KELAS 66 KG",
  "KELAS 69 KG",
  "KELAS 71 KG",
  "KELAS 75 KG",
  "KELAS 80+ KG"
] as const;

export type WeightClass = (typeof WEIGHT_CLASSES)[number];

export const KALBAR_CONTINGENTS = [
  "Bengkayang",
  "Kapuas Hulu",
  "Kayong Utara",
  "Ketapang",
  "Kota Pontianak",
  "Kota Singkawang",
  "Kubu Raya",
  "Landak",
  "Melawi",
  "Mempawah",
  "Sambas",
  "Sanggau",
  "Sekadau",
  "Sintang"
] as const;

export type Contingent = (typeof KALBAR_CONTINGENTS)[number];
