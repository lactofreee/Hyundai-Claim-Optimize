"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, Car, AlertCircle, FileText, PenTool, Stethoscope, Building2, CreditCard, Users, Briefcase } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useProgress } from "@/components/progress-provider"

export default function DocsGuidePage() {
  const router = useRouter()
  const { completeTask } = useProgress()

  // Helper to mark task as complete and navigate if needed
  const handleAction = (action?: () => void) => {
    // For this prototype, any action on this page counts as "viewing/interacting with the guide"
    completeTask("docs-guide")
    if (action) action()
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-slate-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="-ml-2 bg-transparent hover:bg-transparent shadow-none">
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </Button>
          </Link>
          <h1 className="font-bold text-lg">제출서류 안내</h1>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 md:max-w-xl md:mx-auto w-full">
        {/* Hero Section */}
        <div className="flex justify-between items-start mb-10">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold leading-tight tracking-tight text-slate-900">
              자동차 사고처리 및<br />
              보험금 청구시 필요한 서류를<br />
              안내해드립니다.
            </h2>
          </div>
          <div className="relative">
            <Car className="w-12 h-12 text-slate-300" />
            <AlertCircle className="w-5 h-5 text-[#635BFF] absolute -top-1 -right-1 fill-white" />
          </div>
        </div>

        <div className="space-y-10">
          {/* Item 1: Photo Upload */}
          <Section
            title="사고현장, 차량파손, 부상부위 등 사고 관련사진을 등록해주세요."
            buttonText="사고사진/동영상 등록"
            onClick={() => handleAction(() => router.push("/claim/photo-upload"))}
          />

          {/* Item 2: Accident Sketch */}
          <Section
            title="사고상황을 확인 할 수 있도록 사고약도를 작성해주세요."
            buttonText="사고약도 작성"
            onClick={() => handleAction()}
          />

          {/* Item 3: Damage Details */}
          <Section
            title="보험금 지급 및 치료비 지급보증을 위해 자동차사고 피해사항을 등록해 주세요."
            buttonText="피해사항 등록"
            onClick={() => handleAction()}
          />

          {/* Item 4: Medical Certificate */}
          <Section
            title="상해급수 확정을 위해 진단서를 제출해 주세요."
            description="진단기간 만료 후 계속 치료를 받고자 하시는 경우, 추가 진단서를 제출해 주세요."
            buttonText="진단서 등록"
            onClick={() => handleAction()}
          />

          {/* Item 5: Med Guarantee Request */}
          <Section
            title="진료비 지급보증서 요청 시 병원에서 팩스로 자동발송 됩니다."
            buttonText="진료비 지급보증서 요청"
            onClick={() => handleAction(() => router.push("/claim/med-guarantee"))} // This effectively simulates the next step too
          />

          {/* Item 6: Direct Payment */}
          <Section
            title="먼저 치료비용을 지불하신 경우 등록해 주세요."
            buttonText="직불치료비 등록"
            onClick={() => handleAction()}
          />

          {/* Item 7: Family Relation */}
          <Section
            title="가족관계 확인서류 제출에 동의해주세요"
            buttonText="가족관계증명서 제출 동의"
            onClick={() => handleAction()}
          />

          {/* Item 8: Workplace */}
          <Section
            title="직장명 확인서류 제출에 동의해주세요."
            buttonText="건강보험 자격득실 확인서 제출 동의"
            onClick={() => handleAction()}
          />
        </div>

      </main>
    </div>
  )
}

function Section({ title, description, buttonText, onClick }: { title: string, description?: string, buttonText: string, onClick?: () => void }) {
  return (
    <div className="space-y-3 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-[17px] font-bold text-slate-800 leading-snug">{title}</h3>
        {description && <p className="text-sm text-slate-500 leading-relaxed mt-2">{description}</p>}
      </div>
      <Button
        variant="outline"
        className="w-full h-12 text-base font-bold text-[#635BFF] border-[#635BFF] hover:bg-indigo-50 hover:text-[#635BFF] rounded-xl mt-2"
        onClick={onClick}
      >
        {buttonText}
      </Button>
    </div>
  )
}
