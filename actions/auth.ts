'use server'

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, UserSession } from "@/lib/session";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function loginAction(authData: { name: string, phone: string, ci: string }) {
  const cookieStore = await cookies();
  const session = await getIronSession<UserSession>(cookieStore, sessionOptions);
  
  // Clear any existing session to prevent cross-user data contamination
  session.destroy();
  
  const supabase = createClient(cookieStore);

  // 1. Check if user exists in Supabase
  let userId = "";
  console.log(`[Login] Attempting login for: ${authData.phone}`);
  
  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("id, name")
    .eq("phone", authData.phone)
    .single();

  if (existingUser) {
    userId = existingUser.id;
    // Optional: Update name if changed
    if (existingUser.name !== authData.name) {
      await supabase.from("users").update({ name: authData.name }).eq("id", userId);
    }
  } else {
    // 2. Create new user if not exists
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        phone: authData.phone,
        name: authData.name,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase User Creation Error (Likely RLS):", insertError);
      throw new Error("Failed to create user record");
    }
    userId = newUser.id;

    // 2-1. Initialize progress record for the new user
    const { error: progressError } = await supabase
      .from("progress")
      .insert({
        user_id: userId,
        current_step: 0,
        completed_tasks: [],
      });

    if (progressError) {
      console.error("Supabase Progress Initialization Error:", progressError);
      // We don't necessarily throw here to let the user log in, 
      // but it's good to log for debugging.
    }
  }

  // 3. Setup Session
  session.isLoggedIn = true;
  session.name = authData.name;
  session.phone = authData.phone;
  session.ci = authData.ci;
  session.userId = userId;

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
