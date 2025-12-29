"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/session"

/**
 * 업로드된 사고 사진의 메타데이터를 DB에 저장합니다.
 */
export async function registerPhotoAction(params: {
  caseId: string,
  storagePath: string,
  fileName: string,
  fileSize: number
}) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, message: "인증이 필요합니다." };
    }

    const supabase = createClient(await cookies());

    // DB에 메타데이터 저장
    const { data, error } = await supabase
      .from("accident_images")
      .insert({
        case_id: params.caseId,
        user_id: session.userId,
        storage_path: params.storagePath,
        file_name: params.fileName,
        file_size: params.fileSize
      })
      .select()
      .single();

    if (error) {
      console.error("DB 기록 실패:", error);
      return { success: false, message: error.message };
    }

    revalidatePath("/claim/photo-upload");
    return { success: true, data };
  } catch (error: any) {
    console.error("registerPhotoAction 예외 발생:", error);
    return { success: false, message: error.message || "서버 내부 오류가 발생했습니다." };
  }
}

/**
 * 특정 사고(caseId)의 사진 목록을 가져옵니다.
 */
export async function getAccidentPhotosAction(caseId: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, message: "인증이 필요합니다." };
    }

    const supabase = createClient(await cookies());

    const { data, error } = await supabase
      .from("accident_images")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("사진 목록 조회 실패:", error);
      return { success: false, message: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: "사진 목록을 불러오는 중 오류가 발생했습니다." };
  }
}
