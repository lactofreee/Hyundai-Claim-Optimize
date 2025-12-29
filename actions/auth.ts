'use server'

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, UserSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function loginAction(authData: { name: string, phone: string, ci: string }) {
  const session = await getIronSession<UserSession>(await cookies(), sessionOptions);

  session.isLoggedIn = true;
  session.name = authData.name;
  session.phone = authData.phone;
  session.ci = authData.ci;

  await session.save();
  
  redirect("/");
}

export async function logoutAction() {
  const session = await getIronSession<UserSession>(await cookies(), sessionOptions);
  session.destroy();
  redirect("/auth");
}

export async function getSession() {
  const session = await getIronSession<UserSession>(await cookies(), sessionOptions);
  return session;
}
