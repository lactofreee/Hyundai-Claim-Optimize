import { SessionOptions } from "iron-session";

export interface UserSession {
  isLoggedIn: boolean;
  ci: string;    // 연계정보 (고유 식별자)
  name: string;
  phone: string;
}

// In a real application, SECRET_COOKIE_PASSWORD should be an environment variable.
// For this MVP, we are hardcoding a 32+ character string.
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
