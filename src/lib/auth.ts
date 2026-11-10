import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const DEFAULT_SECRET = "team_oweee_muaythai_secret_jwt_key_2026_super_secure_hash";
const SECRET_KEY = new TextEncoder().encode(process.env.SESSION_SECRET || DEFAULT_SECRET);
export const COOKIE_NAME = "muaythai_admin_session";

export interface SessionPayload {
  username: string;
  role: "admin";
}

export async function createSessionToken(username: string): Promise<string> {
  return await new SignJWT({ username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch (err) {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}
