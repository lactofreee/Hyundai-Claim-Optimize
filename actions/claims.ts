"use server"

import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/session";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// 1. Zod 상세 스키마 정의
export const ClaimSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  rrnFront: z.string().length(6, "주민번호 앞자리 6자리를 입력해주세요."),
  rrnBack: z.string().min(1, "주민번호 뒷자리 첫 번째 숫자를 입력해주세요."),
  address: z.string().min(1, "주소를 입력해주세요."),
  job: z.string().min(1, "직업을 입력해주세요."),
  accidentDate: z.string().min(1, "사고 일시를 선택해주세요."),
  accidentLocation: z.string().min(1, "사고 장소를 입력해주세요."),
  accidentType: z.string().min(1, "사고 형태를 선택해주세요."),
  accidentDesc: z.string().min(1, "사고 내용을 입력해주세요."),
  injuryPart: z.string().min(1, "부상 부위를 선택해주세요."),
  hospitalName: z.string().min(1, "병원 이름을 입력해주세요."),
  hospitalLocation: z.string().min(1, "병원 소재지를 입력해주세요."),
  treatmentType: z.enum(["outpatient", "inpatient"]),
  firstVisitDate: z.string().min(1, "최초 진료일을 선택해주세요."),
  caseNumber: z.string().optional(),
});

export type ClaimFormData = z.infer<typeof ClaimSchema>;

/**
 * 보험금 청구서를 DB에 생성하는 서버 액션
 */
export async function createClaimAction(formData: ClaimFormData) {
  const session = await getSession();
  if (!session.userId) {
    throw new Error("인증되지 않은 사용자입니다.");
  }

  // 데이터 유효성 검사
  const validatedFields = ClaimSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient(await cookies());

  // DB Insert
  const { data, error } = await supabase
    .from("insurance_claims")
    .insert({
      user_id: session.userId,
      name: validatedFields.data.name,
      rrn_front: validatedFields.data.rrnFront,
      rrn_back: validatedFields.data.rrnBack,
      address: validatedFields.data.address,
      job: validatedFields.data.job,
      accident_date: new Date(validatedFields.data.accidentDate).toISOString(),
      accident_location: validatedFields.data.accidentLocation,
      accident_type: validatedFields.data.accidentType,
      accident_desc: validatedFields.data.accidentDesc,
      injury_part: validatedFields.data.injuryPart,
      hospital_name: validatedFields.data.hospitalName,
      hospital_location: validatedFields.data.hospitalLocation,
      treatment_type: validatedFields.data.treatmentType,
      first_visit_date: validatedFields.data.firstVisitDate,
      case_number: validatedFields.data.caseNumber,
    })
    .select()
    .single();

  if (error) {
    console.error("보험금 청구 데이터 저장 에러:", error);
    return {
      success: false,
      message: "데이터 저장 중 오류가 발생했습니다.",
    };
  }

  revalidatePath("/");
  return {
    success: true,
    data,
  };
}
