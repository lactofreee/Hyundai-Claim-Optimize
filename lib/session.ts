import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface UserSession {
  isLoggedIn: boolean;
  ci: string;    // 연계정보 (고유 식별자)
  name: string;
  phone: string;
  userId?: string; // Supabase UUID
}

export const sessionOptions: SessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || "complex_password_at_least_32_characters_long",
  cookieName: "auth_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 30, // 30 minutes
  },
};

export async function getSession() {
  const session = await getIronSession<UserSession>(await cookies(), sessionOptions);

  if (!session.isLoggedIn) {
    session.isLoggedIn = false;
    session.ci = "";
    session.name = "";
    session.phone = "";
  }

  return session;
}
