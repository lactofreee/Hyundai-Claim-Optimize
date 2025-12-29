"use server";

import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/actions/auth";
import { TaskId } from "@/components/progress-provider";
import { cookies } from "next/headers";

export async function updateProgressAction(currentStep: number, completedTasks: TaskId[]) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    throw new Error("Unauthorized");
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("progress")
    .upsert({
      user_id: session.userId,
      current_step: currentStep,
      completed_tasks: completedTasks,
      updated_at: new Date().toISOString(),
    })
    .select();

  if (error) {
    console.error("Failed to update progress:", error);
    throw new Error("Failed to save progress");
  }
}

export async function getProgressAction() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return null;
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data } = await supabase
    .from("progress")
    .select("current_step, completed_tasks")
    .eq("user_id", session.userId)
    .single();

  return data;
}
