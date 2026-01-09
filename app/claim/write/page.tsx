"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ChevronLeft, CheckCircle2, User, Car, FileText, Stethoscope } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useProgress } from "@/components/progress-provider"
import { createClaimAction } from "@/actions/claims"

export default function ClaimWritePage() {
  const router = useRouter()
  const { completeTask, userName, caseNumber } = useProgress()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    name: userName || "김현대",
    rrnFront: "",
    rrnBack: "",
    address: "",
    job: "",
    // Step 2: Accident
    accidentDate: "2025-12-15T11:11", // Default from context
    accidentLocation: "",
    accidentType: "",
    accidentDesc: "",
    // Step 3: Damage
    injuryPart: "",
    hospitalName: "",
    hospitalLocation: "",
    treatmentType: "outpatient",
    firstVisitDate: "",
  })

  // Sync name if userName becomes available later
  useEffect(() => {
    if (userName && formData.name !== userName) {
      setFormData(prev => ({ ...prev, name: userName }))
    }
  }, [userName])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleNext = async () => {
    if (step === 3) {
      setIsSubmitting(true)
      setSubmitError(null)
      try {
        const result = await createClaimAction({
          ...formData,
          caseNumber
        } as any);
        if (result.success) {
          completeTask("claim-write")
          setStep(4)
        } else {
          if (result.errors) {
            setFieldErrors(result.errors)
            // Show the first error as a summary
            const firstError = Object.values(result.errors)[0]?.[0]
            setSubmitError(firstError || "입력 정보를 다시 확인해 주세요.")

            // If there are errors in previous steps, alert the user
            console.log("Validation errors:", result.errors)
          } else {
            setSubmitError(result.message || "입력 정보를 다시 확인해 주세요.");
          }
        }
      } catch (err) {
        setSubmitError("서버와의 통신 중 오류가 발생했습니다.");
      } finally {
        setIsSubmitting(false)
      }
      return
    }
    setStep(prev => prev + 1)
    window.scrollTo(0, 0)
  }

  const handlePrev = () => {
    setStep(prev => prev - 1)
    window.scrollTo(0, 0)
  }

  // Progress Bar Component
  const ProgressBar = () => {
    return (
      <div className="w-full bg-stone-100 h-1.5 fixed top-14 left-0 z-40">
        <div
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-slate-900 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-stone-100 px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          {step < 4 ? (
            step > 1 ? (
              <Button variant="ghost" size="icon" className="-ml-2 bg-transparent hover:bg-transparent shadow-none" onClick={handlePrev}>
                <ChevronLeft className="w-6 h-6 text-slate-600" />
              </Button>
            ) : (
              <Link href="/">
                <Button variant="ghost" size="icon" className="-ml-2 bg-transparent hover:bg-transparent shadow-none">
                  <ChevronLeft className="w-6 h-6 text-slate-600" />
                </Button>
              </Link>
            )
          ) : null}
          <h1 className="font-bold text-lg tracking-tight">{step === 4 ? "청구 완료" : "보험금 청구"}</h1>
        </div>
        <div className="text-sm font-bold text-primary">
          {step < 4 && `${step} / 3`}
        </div>
      </header>

      {step < 4 && <ProgressBar />}

      <main className={cn(
        "flex-1 p-6 max-w-xl mx-auto w-full",
        step === 4 ? "flex flex-col justify-center pt-0" : "space-y-8 pt-8"
      )}>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-snug">
                본인 정보를<br />확인해 주세요
              </h2>
              <p className="text-slate-500 text-sm">원활한 보상 처리를 위해 정확한 정보가 필요합니다.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold text-slate-700">접수 번호</Label>
                <div className="h-14 w-full rounded-xl bg-white border border-stone-200 shadow-sm flex items-center px-4 font-bold text-slate-500 text-lg">
                  {caseNumber}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold text-slate-700">이름</Label>
                <div className="h-14 w-full rounded-xl bg-white border border-stone-200 shadow-sm flex items-center px-4 font-bold text-slate-500 text-lg">
                  {formData.name}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="rrn" className="text-base font-semibold text-slate-700">주민등록번호</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={formData.rrnFront}
                    onChange={(e) => handleChange("rrnFront", e.target.value)}
                    className="h-14 rounded-xl text-lg text-center tracking-widest bg-white shadow-sm border-stone-200 focus:border-primary focus:ring-primary"
                    placeholder="생년월일 6자리"
                    maxLength={6}
                    inputMode="numeric"
                  />
                  <span className="text-stone-300 font-bold text-lg">-</span>
                  <div className="flex items-center gap-1 flex-1">
                    <Input
                      value={formData.rrnBack}
                      onChange={(e) => handleChange("rrnBack", e.target.value)}
                      className="h-14 rounded-xl text-lg text-center tracking-widest w-14 px-0 bg-white shadow-sm border-stone-200 focus:border-primary focus:ring-primary"
                      placeholder="1"
                      maxLength={1}
                      inputMode="numeric"
                    />
                    <div className="flex-1 flex gap-1 justify-center">
                      {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-stone-300" />)}
                    </div>
                  </div>
                </div>
                {fieldErrors.rrnFront && <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.rrnFront[0]}</p>}
                {fieldErrors.rrnBack && !fieldErrors.rrnFront && <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.rrnBack[0]}</p>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="address" className="text-base font-semibold text-slate-700">주소</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="h-14 rounded-xl text-base bg-white shadow-sm border-stone-200 focus:border-primary focus:ring-primary"
                  placeholder="예) 서울시 강남구 테헤란로 123"
                />
                {fieldErrors.address && <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.address[0]}</p>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="job" className="text-base font-semibold text-slate-700">직업 (직장명)</Label>
                <Input
                  id="job"
                  value={formData.job}
                  onChange={(e) => handleChange("job", e.target.value)}
                  className="h-14 rounded-xl text-base bg-white shadow-sm border-stone-200 focus:border-primary focus:ring-primary"
                  placeholder="직장명을 입력해 주세요"
                />
                {fieldErrors.job && <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.job[0]}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Accident Info */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-snug">
                사고 내용을<br />상세히 알려주세요
              </h2>
              <p className="text-slate-500 text-sm">정확한 사고 경위 파악에 도움이 됩니다.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="accidentDate" className="text-base font-semibold text-slate-700">사고 일시</Label>
                <Input
                  id="accidentDate"
                  type="datetime-local"
                  value={formData.accidentDate}
                  onChange={(e) => handleChange("accidentDate", e.target.value)}
                  className="h-14 rounded-xl text-base bg-white shadow-sm border-stone-200 focus:border-primary focus:ring-primary block w-full"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="accidentLocation" className="text-base font-semibold text-slate-700">사고 장소</Label>
                <Input
                  id="accidentLocation"
                  value={formData.accidentLocation}
                  onChange={(e) => handleChange("accidentLocation", e.target.value)}
                  className="h-14 rounded-xl text-base bg-white shadow-sm border-stone-200 focus:border-primary focus:ring-primary"
                  placeholder="예) 강남역 사거리"
                />
                {fieldErrors.accidentLocation && <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.accidentLocation[0]}</p>}
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold text-slate-700 mb-1 block">사고 형태</Label>
                <Select onValueChange={(val) => handleChange("accidentType", val)}>
                  <SelectTrigger className="h-14 rounded-xl text-base bg-white shadow-sm border-stone-200 focus:ring-primary">
                    <SelectValue placeholder="사고 유형 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-xl border-stone-200 z-50">
                    <SelectItem value="car_to_car">차대차</SelectItem>
                    <SelectItem value="car_to_person">차대인</SelectItem>
                    <SelectItem value="solo">단독사고</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.accidentType && <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.accidentType[0]}</p>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="accidentDesc" className="text-base font-semibold text-slate-700">사고 내용</Label>
                <Textarea
                  id="accidentDesc"
                  value={formData.accidentDesc}
                  onChange={(e) => handleChange("accidentDesc", e.target.value)}
                  className="min-h-[140px] rounded-xl text-base resize-none bg-white shadow-sm border-stone-200 focus:border-primary focus:ring-primary p-4 leading-relaxed"
                  placeholder="사고 상황을 구체적으로 설명해 주세요."
                />
                {fieldErrors.accidentDesc && <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.accidentDesc[0]}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Damage Info */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-snug">
                피해 및 치료 내용을<br />입력해 주세요
              </h2>
              <p className="text-slate-500 text-sm">치료 정보를 바탕으로 향후 절차를 안내해 드립니다.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold text-slate-700 mb-1 block">부상 부위</Label>
                <Select onValueChange={(val) => handleChange("injuryPart", val)}>
                  <SelectTrigger className="h-14 rounded-xl text-base bg-white shadow-sm border-stone-200 focus:ring-primary">
                    <SelectValue placeholder="주요 부상 부위 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-xl border-stone-200 z-50">
                    <SelectItem value="neck">목 (경추)</SelectItem>
                    <SelectItem value="waist">허리 (요추)</SelectItem>
                    <SelectItem value="leg">다리/무릎</SelectItem>
                    <SelectItem value="arm">팔/어깨</SelectItem>
                    <SelectItem value="head">머리</SelectItem>
                    <SelectItem value="etc">기타</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.injuryPart && <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.injuryPart[0]}</p>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="hospitalName" className="text-base font-semibold text-slate-700">치료 병원</Label>
                <Input
                  id="hospitalName"
                  value={formData.hospitalName}
                  onChange={(e) => handleChange("hospitalName", e.target.value)}
                  className="h-14 rounded-xl text-base bg-white shadow-sm border-stone-200 focus:border-primary focus:ring-primary"
                  placeholder="병원 이름 입력"
                />
                {fieldErrors.hospitalName && <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.hospitalName[0]}</p>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="hospitalLocation" className="text-base font-semibold text-slate-700">병원 소재지</Label>
                <Input
                  id="hospitalLocation"
                  value={formData.hospitalLocation}
                  onChange={(e) => handleChange("hospitalLocation", e.target.value)}
                  className="h-14 rounded-xl text-base bg-white shadow-sm border-stone-200 focus:border-primary focus:ring-primary"
                  placeholder="예) 서울 강남구"
                />
                {fieldErrors.hospitalLocation && <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.hospitalLocation[0]}</p>}
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold text-slate-700">치료 형태</Label>
                <RadioGroup
                  defaultValue="outpatient"
                  onValueChange={(val) => handleChange("treatmentType", val)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2 border border-stone-200 bg-white rounded-xl p-4 flex-1 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 transition-all cursor-pointer shadow-sm">
                    <RadioGroupItem value="outpatient" id="outpatient" />
                    <Label htmlFor="outpatient" className="flex-1 cursor-pointer font-medium">통원</Label>
                  </div>
                  <div className="flex items-center space-x-2 border border-stone-200 bg-white rounded-xl p-4 flex-1 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 transition-all cursor-pointer shadow-sm">
                    <RadioGroupItem value="inpatient" id="inpatient" />
                    <Label htmlFor="inpatient" className="flex-1 cursor-pointer font-medium">입원</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label htmlFor="firstVisitDate" className="text-base font-semibold text-slate-700">최초 진료일</Label>
                <Input
                  id="firstVisitDate"
                  type="date"
                  value={formData.firstVisitDate}
                  onChange={(e) => handleChange("firstVisitDate", e.target.value)}
                  className="h-14 rounded-xl text-base bg-white shadow-sm border-stone-200 focus:border-primary focus:ring-primary block w-full"
                />
                {fieldErrors.firstVisitDate && <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.firstVisitDate[0]}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Completion */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            {/* Icon Section with smooth fade and pop */}
            <div className="relative mb-6 animate-in fade-in zoom-in-75 duration-700 ease-out">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <div className="absolute inset-0 bg-success/20 rounded-full animate-ping duration-1000 opacity-20" />
            </div>

            {/* Title Section with staggered slide-up */}
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">
                접수가 완료되었습니다
              </h2>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                신속하게 검토 후 연락드리겠습니다.
              </p>
            </div>

            {/* Details Card with subtle appearance */}
            <div className="w-full mt-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
              <Card className="border-none bg-white shadow-sm overflow-hidden rounded-3xl">
                <div className="bg-stone-50/50 px-6 py-3 border-b border-stone-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">청구 상세 정보</p>
                </div>
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500 text-sm font-medium">접수 번호</span>
                    <span className="font-bold text-slate-900 tabular-nums">{caseNumber}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-t border-stone-50 pt-3">
                    <span className="text-slate-500 text-sm font-medium">청구인</span>
                    <span className="font-bold text-slate-900">{formData.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-t border-stone-50 pt-3">
                    <span className="text-slate-500 text-sm font-medium">의료기관</span>
                    <span className="font-bold text-slate-900 truncate max-w-[150px]">{formData.hospitalName || "정보 없음"}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-[11px] text-primary font-bold leading-normal">
                  💡 사고 사진을 등록하시면 보상 처리가 빨라집니다.
                </p>
              </div>

              {/* Action Button moved inside for step 4 balance */}
              <Button
                className="w-full h-14 bg-primary text-lg font-bold rounded-2xl hover:bg-primary/40 shadow-xl mt-12 mb-8"
                onClick={() => router.push("/")}
              >
                메인으로 돌아가기
              </Button>
            </div>
          </div>
        )}

      </main>

      {/* Bottom CTA (Navigation) - Only for steps 1-3 */}
      {step < 4 && (
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-stone-200 p-4 safe-area-bottom">
          <Button
            className="w-full h-14 text-lg font-bold rounded-xl bg-primary hover:opacity-90 shadow-xl shadow-primary/20"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? "제출 중..." : (step === 3 ? "제출하기" : "다음")}
          </Button>
          {submitError && (
            <p className="text-red-500 text-sm mt-2 text-center font-medium animate-in fade-in slide-in-from-top-1">
              {submitError}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
