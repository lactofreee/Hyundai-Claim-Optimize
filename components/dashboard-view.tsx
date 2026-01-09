"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronRight, FileText, Upload, RotateCcw, Phone, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useProgress } from "@/components/progress-provider"
import { useState } from "react"

export function DashboardView() {
  const router = useRouter()
  const { currentStep, resetProgress, completedTasks, completeTask, caseNumber, accidentDate } = useProgress()
  const [isCallDrawerOpen, setIsCallDrawerOpen] = useState(false)

  // Format Date for display
  const formattedDate = accidentDate ? new Date(accidentDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }) : "접수 대기 중"

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      {/* 접수 정보 카드 */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">접수 번호</span>
            <span className="font-semibold">{caseNumber || "접수 대기 중"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">사고 일시</span>
            <span className="font-semibold">{formattedDate}</span>
          </div>
        </CardContent>
      </Card>

      {/* 담당자 및 진행 상태 정보 */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-6 space-y-8">
          {/* 담당자 정보 섹션 */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">담당자 정보</h3>
            <div className="flex items-start gap-4">
              <Avatar className="w-14 h-14 border bg-zinc-50">
                <AvatarFallback className="bg-zinc-100 text-zinc-500">
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="font-medium text-lg">김현대 매니저</p>
                <div
                  className="flex items-center gap-1 text-primary cursor-pointer hover:underline"
                  onClick={() => setIsCallDrawerOpen(true)}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="font-medium">010-1234-5678</span>
                </div>
                <p className="text-muted-foreground text-sm">고객님의 빠른 일상 복귀를 돕겠습니다.</p>
              </div>
            </div>
          </div>

          {/* 사고 처리 단계 섹션 (Custom Blue Stepper) */}
          <div className="space-y-4 pt-1">
            <div className="flex justify-between items-end mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">사고 처리 단계</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:bg-slate-100 rounded-full text-slate-400"
                  onClick={resetProgress}
                  title="개발용: 진행상태 초기화"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
              <span className="text-sm font-bold text-primary">{['접수', '피해', '치료', '보험금 지급', '치료비 지급'][currentStep]} ({currentStep + 1}/5)</span>
            </div>

            <div className="relative px-2">
              {/* Background Line */}
              <div className="absolute top-[9px] left-0 w-full h-[2px] bg-slate-100" />
              {/* Active Progress Line */}
              <div className="absolute top-[9px] left-0 h-[2px] bg-primary transition-all duration-300" style={{ width: `${(currentStep / 4) * 100}%` }} />

              {/* Nodes */}
              <div className="relative flex justify-between">
                {['접수', '피해', '치료', '보험금\n지급', '치료비\n지급'].map((label, i) => {
                  const isCompleted = i <= currentStep;
                  const isCurrent = i === currentStep;

                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white z-10 transition-all box-border",
                        isCompleted ? "border-primary" : "border-slate-200"
                      )}>
                        {isCompleted && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className={cn(
                        "text-[11px] font-medium text-center whitespace-pre-line leading-tight",
                        isCompleted ? "text-primary font-bold" : "text-slate-400"
                      )}>{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Dynamic Urgent Action Card (Mirrored from Chatbot) */}
          {!completedTasks.includes("claim-write") && (
            <div
              className="w-full bg-zinc-100 rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-zinc-200 transition-colors mt-6"
              onClick={() => router.push("/claim/write")}
            >
              <div>
                <p className="font-bold text-lg text-slate-900 mb-1">보험금 청구서 작성 하기</p>
                <p className="text-sm text-slate-500 font-medium">바로가기 {'>'}</p>
              </div>
              <div className="flex gap-1 opacity-20">
                <div className="w-6 h-6 bg-slate-400 rounded-full" />
                <div className="w-6 h-6 bg-slate-400 rounded-md" />
              </div>
            </div>
          )}

          {completedTasks.includes("claim-write") && !completedTasks.includes("photo-upload") && (
            <div
              className="w-full bg-zinc-100 rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-zinc-200 transition-colors mt-6"
              onClick={() => router.push("/claim/photo-upload")}
            >
              <div>
                <p className="font-bold text-lg text-slate-900 mb-1">사고 사진 등록하기</p>
                <p className="text-sm text-slate-500 font-medium">사진 업로드 {'>'}</p>
              </div>
              <div className="flex gap-1 opacity-20">
                <div className="w-6 h-6 bg-slate-400 rounded-md" />
              </div>
            </div>
          )}

          {completedTasks.includes("photo-upload") && !completedTasks.includes("docs-guide") && (
            <div
              className="w-full bg-zinc-100 rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-zinc-200 transition-colors mt-6"
              onClick={() => router.push("/claim/docs-guide")}
            >
              <div>
                <p className="font-bold text-lg text-slate-900 mb-1">보험금 청구 제출서류 안내</p>
                <p className="text-sm text-slate-500 font-medium">서류 제출 안내 가기 {'>'}</p>
              </div>
              <div className="flex gap-1 opacity-20">
                <div className="w-6 h-6 bg-slate-400 rounded-md" />
                <div className="w-6 h-6 bg-slate-400 rounded-full" />
              </div>
            </div>
          )}

          {completedTasks.includes("docs-guide") && !completedTasks.includes("med-guarantee") && (
            <div
              className="w-full bg-zinc-100 rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-zinc-200 transition-colors mt-6"
              onClick={() => router.push("/claim/med-guarantee")}
            >
              <div>
                <p className="font-bold text-lg text-slate-900 mb-1">진료비 지급보증서 요청하기</p>
                <p className="text-sm text-slate-500 font-medium">요청 화면 가기 {'>'}</p>
              </div>
              <div className="flex gap-1 opacity-20">
                <div className="w-6 h-6 bg-slate-400 rounded-full" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 액션 카드들 (Grid Layout for Desktop) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ActionCard
          icon={<div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"><FileText className="w-5 h-5 text-gray-500" /></div>}
          title="자동차사고 및 지급결의 확인서 발급"
          description="사고 사실을 증명하거나, 다른 보험사에 지급내역을 제출하기 위한 서류"
          href="/issuance/accident-confirmation"
        />

        <ActionCard
          icon={<div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"><Upload className="w-5 h-5 text-gray-500" /></div>}
          title="보험금 청구 제출서류 안내"
          description="사고사진등록, 피해사항등록, 진단서등록, 진료비 지급 보증 요청 등"
          href="/claim/docs-guide"
        />
      </div>

      {/* Phone Call Drawer Overlay */}
      {isCallDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50 transition-opacity"
            onClick={() => setIsCallDrawerOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 pb-10 space-y-6 animate-in slide-in-from-bottom duration-300 md:max-w-md md:mx-auto md:bottom-10 md:rounded-3xl cursor-default">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xl">담당자에게 전화 걸기</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsCallDrawerOpen(false)}>
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center p-8 bg-zinc-50 rounded-full w-24 h-24 mx-auto mb-4">
                <Phone className="w-10 h-10 text-primary" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-2xl font-bold">010-1234-5678</p>
                <p className="text-muted-foreground">김현대 매니저</p>
              </div>
            </div>

            <div className="grid gap-3">
              <a href="tel:01012345678" className="w-full">
                <Button className="w-full h-14 text-lg bg-green-500 hover:bg-green-600 rounded-xl gap-2">
                  <Phone className="w-5 h-5" />
                  통화하기
                </Button>
              </a>
              <Button
                variant="outline"
                className="w-full h-14 text-lg rounded-xl border-zinc-200"
                onClick={() => setIsCallDrawerOpen(false)}
              >
                취소
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ActionCard({ title, description, icon, href }: { title: string, description: string, icon: React.ReactNode, href?: string }) {
  const Content = (
    <Card className="border-none shadow-sm bg-white hover:bg-zinc-50 transition-colors cursor-pointer group h-full">
      <CardContent className="p-5 flex items-start gap-4">
        <div className="shrink-0 pt-1">{icon}</div>
        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-foreground leading-tight">{title}</h4>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-foreground transition-colors" />
          </div>
          <p className="text-sm text-muted-foreground leading-snug">{description}</p>
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href} className="block h-full">{Content}</Link>
  }
  return Content
}
