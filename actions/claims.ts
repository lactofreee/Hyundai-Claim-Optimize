"use server"

import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/session";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// 1. Zod 상세 스키마 정의 (Server Action 파일에서는 함수만 export 가능하므로 export 제거)
const ClaimSchema = z.object({
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
  console.log("createClaimAction 시작:", formData.name);
  
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      console.error("인증 실패: 세션 정보가 없습니다.");
      return {
        success: false,
        message: "인증되지 않은 사용자입니다. 다시 로그인해 주세요.",
      };
    }

    console.log("인증 확인됨. 사용자 ID:", session.userId);

    // 데이터 유효성 검사
    const validatedFields = ClaimSchema.safeParse(formData);

    if (!validatedFields.success) {
      console.error("유효성 검사 실패:", validatedFields.error.flatten().fieldErrors);
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // 환경 변수 체크
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("환경 변수 누락: Supabase 설정이 필요합니다.");
      return { success: false, message: "서버 설정 오류가 발생했습니다." };
    }

    const supabase = createClient(await cookies());

    // 날짜 처리
    let accidentDate;
    try {
      accidentDate = new Date(validatedFields.data.accidentDate).toISOString();
    } catch (e) {
      return { success: false, message: "사고 일시 형식이 올바르지 않습니다." };
    }

    console.log("DB Insert 시도...");

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
        accident_date: accidentDate,
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
      console.error("Supabase 에러:", error);
      return {
        success: false,
        message: `저장 실패: ${error.message} (코드: ${error.code})`,
      };
    }

    console.log("DB 저장 성공:", data.id);
    revalidatePath("/");
    return {
      success: true,
      data: { id: data.id }, // 필요한 최소 정보만 반환
    };
  } catch (error: any) {
    console.error("최상위 예외 발생:", error);
    return {
      success: false,
      message: "연결 중 알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}
