"use server";

import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/actions/auth";
import { cookies } from "next/headers";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export async function getChatHistoryAction(): Promise<ChatMessage[]> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return [];
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: true });

  return (data as ChatMessage[]) || [];
}
