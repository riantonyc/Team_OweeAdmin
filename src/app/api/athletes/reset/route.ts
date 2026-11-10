import { NextResponse } from "next/server";
import { resetAthletes } from "@/lib/store";

export async function POST() {
  try {
    const fresh = await resetAthletes();
    return NextResponse.json({ success: true, athletes: fresh, total: fresh.length });
  } catch (err: any) {
    return NextResponse.json({ error: "Gagal mereset data atlet." }, { status: 500 });
  }
}

