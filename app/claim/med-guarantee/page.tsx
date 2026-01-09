"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Building2, User, FileText, CheckCircle2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { useProgress } from "@/components/progress-provider"
import { cn } from "@/lib/utils"

// ----------------------------------------------------------------------
// 1. 화면 레이아웃 구조 설명
// ----------------------------------------------------------------------
// 전체 레이아웃은 모바일 친화적인 Single Column Layout입니다.
// - Header: 뒤로가기 버튼과 페이지 제목을 포함한 상단바 (sticky)
// - Main Content:
//   - Info Section: 접수번호, 이름 등 읽기 전용 정보 (회색 배경 카드로 구분)
//   - Form Section: 입력 필드들이 적절한 간격(spacing)으로 배치됨
// - Footer: 입력을 완료하는 고정 하단 버튼 (CTA)

export default function MedGuaranteePage() {
  const router = useRouter()
  const { completeTask, userName } = useProgress()

  // Form State
  const [treatmentMethod, setTreatmentMethod] = useState<"outpatient" | "inpatient" | "">("")
  const [hospitalName, setHospitalName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [faxNumber, setFaxNumber] = useState("")

  // Validation State
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({})

  // Mock Data (Read-only)
  const caseNumber = "2023-1215-0045"
  const defaultUser = userName || "김현대"

  // ----------------------------------------------------------------------
  // 3. 유효성 검사 로직
  // ----------------------------------------------------------------------
  const validateForm = () => {
    const newErrors: { [key: string]: boolean } = {}
    let isValid = true

    // 필수 항목: 치료방법
    if (!treatmentMethod) {
      newErrors.treatmentMethod = true
      isValid = false
    }

    // 필수 항목: 의료기관명
    if (!hospitalName.trim()) {
      newErrors.hospitalName = true
      isValid = false
    }

    // 필수 항목: 팩스번호
    if (!faxNumber.trim()) {
      newErrors.faxNumber = true
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = () => {
    if (validateForm()) {
      // API call simulation
      // console.log({ treatmentMethod, hospitalName, phoneNumber, faxNumber })

      alert("진료비 지급보증서가 요청되었습니다.")
      completeTask("med-guarantee")
      router.push("/")
    } else {
      // First error focus logic could go here
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-slate-900 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="-ml-2 bg-transparent hover:bg-transparent shadow-none">
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </Button>
          </Link>
          <h1 className="font-bold text-lg">진료비 지급보증서 요청</h1>
        </div>
      </header>

      <main className="flex-1 px-5 py-6 max-w-xl mx-auto w-full space-y-8">

        {/* 1. Read-only Information Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-500 ml-1">기본 정보</h2>
          <Card className="border-stone-200 shadow-sm bg-white">
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">접수번호</label>
                  <div className="font-bold text-slate-800 text-lg">{caseNumber}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">이름</label>
                  <div className="font-bold text-slate-800 text-lg">{defaultUser}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 2. User Input Form Section */}
        <section className="space-y-6">
          <h2 className="text-sm font-bold text-slate-500 ml-1">요청 정보 입력</h2>

          <div className="space-y-6 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">

            {/* 치료방법 (Radio) */}
            <div className="space-y-3">
              <Label className="text-base font-bold flex items-center gap-1">
                치료방법 <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={treatmentMethod}
                onValueChange={(val: "outpatient" | "inpatient") => {
                  setTreatmentMethod(val)
                  setErrors(prev => ({ ...prev, treatmentMethod: false }))
                }}
                className="grid grid-cols-2 gap-3"
              >
                <div className={cn(
                  "flex items-center justify-between space-x-2 border rounded-xl p-4 cursor-pointer transition-all hover:bg-slate-50",
                  treatmentMethod === "outpatient" ? "border-primary bg-primary/5" : "border-stone-200",
                  errors.treatmentMethod && "border-red-500 bg-red-50"
                )}>
                  <Label htmlFor="r1" className="flex-1 cursor-pointer font-medium">통원 치료</Label>
                  <RadioGroupItem value="outpatient" id="r1" />
                </div>
                <div className={cn(
                  "flex items-center justify-between space-x-2 border rounded-xl p-4 cursor-pointer transition-all hover:bg-slate-50",
                  treatmentMethod === "inpatient" ? "border-primary bg-primary/5" : "border-stone-200",
                  errors.treatmentMethod && "border-red-500 bg-red-50"
                )}>
                  <Label htmlFor="r2" className="flex-1 cursor-pointer font-medium">입원 치료</Label>
                  <RadioGroupItem value="inpatient" id="r2" />
                </div>
              </RadioGroup>
              {errors.treatmentMethod && <p className="text-xs text-red-500 font-medium ml-1">치료 방법을 선택해주세요.</p>}
            </div>

            {/* 의료기관명 (Input) */}
            <div className="space-y-2">
              <Label htmlFor="hospital" className="text-base font-bold flex items-center gap-1">
                의료기관명 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="hospital"
                  placeholder="예: 현대병원"
                  value={hospitalName}
                  onChange={(e) => {
                    setHospitalName(e.target.value)
                    setErrors(prev => ({ ...prev, hospitalName: false }))
                  }}
                  className={cn(
                    "h-12 text-base rounded-xl transition-all focus-visible:ring-primary",
                    errors.hospitalName ? "border-red-500 focus-visible:ring-red-500" : "border-stone-200"
                  )}
                />
                <Building2 className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
              {errors.hospitalName && <p className="text-xs text-red-500 font-medium ml-1">의료기관명을 입력해주세요.</p>}
            </div>

            {/* 전화번호 (Input) */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base font-bold flex items-center gap-1">
                병원 전화번호
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="02-1234-5678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-12 text-base rounded-xl border-stone-200 focus-visible:ring-primary"
              />
            </div>

            {/* 팩스번호 (Input) */}
            <div className="space-y-2">
              <Label htmlFor="fax" className="text-base font-bold flex items-center gap-1">
                병원 팩스번호 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fax"
                type="tel"
                placeholder="02-1234-5679"
                value={faxNumber}
                onChange={(e) => {
                  setFaxNumber(e.target.value)
                  setErrors(prev => ({ ...prev, faxNumber: false }))
                }}
                className={cn(
                  "h-12 text-base rounded-xl transition-all focus-visible:ring-primary",
                  errors.faxNumber ? "border-red-500 focus-visible:ring-red-500" : "border-stone-200"
                )}
              />
              {errors.faxNumber && <p className="text-xs text-red-500 font-medium ml-1">팩스번호를 입력해주세요.</p>}
              <p className="text-xs text-slate-400 mt-1 ml-1">입력하신 팩스번호로 지급보증서가 즉시 발송됩니다.</p>
            </div>

          </div>
        </section>

      </main>

      {/* Footer Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-stone-100 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-xl mx-auto">
          <Button
            className="w-full h-14 text-lg font-bold bg-primary hover:opacity-90 rounded-xl shadow-lg shadow-primary/20"
            onClick={handleSubmit}
          >
            지급보증서 요청하기
          </Button>
        </div>
      </div>
    </div>
  )
}
