import { NextResponse } from "next/server";
import { getAthletes, addAthlete } from "@/lib/store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.toLowerCase() || "";
    const kontingen = searchParams.get("kontingen") || "ALL";
    const kelas = searchParams.get("kelas") || "ALL";
    const kategori = searchParams.get("kategori") || "ALL";
    const status = searchParams.get("status") || "ALL";

    let athletes = await getAthletes();

    if (q || kontingen !== "ALL" || kelas !== "ALL" || kategori !== "ALL" || status !== "ALL") {
      athletes = athletes.filter((a) => {
        const matchQ =
          !q ||
          a.nama.toLowerCase().includes(q) ||
          a.kontingen.toLowerCase().includes(q) ||
          a.kelas.toLowerCase().includes(q);
        const matchKontingen = kontingen === "ALL" || a.kontingen === kontingen;
        const matchKelas = kelas === "ALL" || a.kelas === kelas;
        const matchKategori = kategori === "ALL" || a.kategori === kategori;
        const matchStatus = status === "ALL" || a.status === status;

        return matchQ && matchKontingen && matchKelas && matchKategori && matchStatus;
      });
    }

    return NextResponse.json({ athletes, total: athletes.length });
  } catch (err: any) {
    return NextResponse.json({ error: "Gagal mengambil data atlet." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, kontingen, kategori, kelas, dob, temuan, status, catatan } = body;

    if (!nama || !kontingen || !kategori || !kelas || !dob) {
      return NextResponse.json({ error: "Mohon lengkapi semua bidang wajib." }, { status: 400 });
    }

    const newAthlete = await addAthlete({
      nama: nama.trim(),
      kontingen,
      kategori,
      kelas,
      dob,
      temuan: temuan || "Ya",
      status: status || "Aktif",
      catatan: catatan?.trim() || "",
    });

    return NextResponse.json({ success: true, athlete: newAthlete }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Gagal menambahkan atlet baru." }, { status: 500 });
  }
}
