import { NextResponse } from "next/server";
import { createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const validUser = process.env.ADMIN_USERNAME || "teamowee";
    const validPass = process.env.ADMIN_PASSWORD || "12345678";

    if (username !== validUser || password !== validPass) {
      return NextResponse.json(
        { error: "Username atau Password salah. Silakan coba kembali." },
        { status: 401 }
      );
    }

    const token = await createSessionToken(username);
    const response = NextResponse.json({ success: true, message: "Login berhasil!" });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: "Terjadi kesalahan server saat login." }, { status: 500 });
  }
}

