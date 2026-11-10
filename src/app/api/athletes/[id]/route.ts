import { NextResponse } from "next/server";
import { updateAthlete, deleteAthlete, getAthleteById } from "@/lib/store";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

    const athlete = await getAthleteById(id);
    if (!athlete) return NextResponse.json({ error: "Atlet tidak ditemukan" }, { status: 404 });

    return NextResponse.json({ athlete });
  } catch (err: any) {
    return NextResponse.json({ error: "Gagal memuat data atlet." }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

    const body = await request.json();
    const updated = await updateAthlete(id, body);

    if (!updated) {
      return NextResponse.json({ error: "Atlet tidak ditemukan untuk diperbarui." }, { status: 404 });
    }

    return NextResponse.json({ success: true, athlete: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Gagal memperbarui data atlet." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

    const success = await deleteAthlete(id);
    if (!success) {
      return NextResponse.json({ error: "Atlet tidak ditemukan untuk dihapus." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Atlet berhasil dihapus." });
  } catch (err: any) {
    return NextResponse.json({ error: "Gagal menghapus atlet." }, { status: 500 });
  }
}

