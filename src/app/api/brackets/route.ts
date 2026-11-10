import { NextResponse } from "next/server";
import { getBrackets, saveBracket } from "@/lib/store";
import { ClassBracket } from "@/lib/bracketUtils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classKey = searchParams.get("classKey");
    const all = await getBrackets();

    if (classKey) {
      return NextResponse.json({ bracket: all[classKey] || null });
    }

    return NextResponse.json({ brackets: all });
  } catch (err: any) {
    return NextResponse.json({ error: "Gagal memuat bagan pertandingan." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { classKey, bracket } = body as { classKey: string; bracket: ClassBracket };

    if (!classKey || !bracket) {
      return NextResponse.json({ error: "Parameter tidak lengkap." }, { status: 400 });
    }

    await saveBracket(classKey, bracket);
    return NextResponse.json({ success: true, bracket });
  } catch (err: any) {
    return NextResponse.json({ error: "Gagal menyimpan bagan pertandingan." }, { status: 500 });
  }
}
