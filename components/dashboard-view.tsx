"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronRight, FileText, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function DashboardView() {
  return (
    <div className="space-y-4 pb-20 md:pb-0">
      {/* 접수 정보 카드 */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">접수 번호</span>
            <span className="font-semibold">2512051243 대인 02</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">사고 일시</span>
            <span className="font-semibold">2025-12-15(월) 11:11</span>
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
              <Avatar className="w-14 h-14 border">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback className="bg-purple-100 text-purple-600">김</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="font-medium text-lg">이름</p>
                <p className="text-muted-foreground">연락처 <span className="text-foreground ml-2">010 1234 5678</span></p>
                <p className="text-muted-foreground text-sm">소개 문구</p>
              </div>
            </div>
          </div>

          {/* 사고 처리 단계 섹션 (Custom Blue Stepper) */}
          <div className="space-y-4 pt-1">
            <div className="flex justify-between items-end mb-2">
              <h3 className="font-medium text-foreground/80">사고 처리 단계</h3>
              <span className="text-sm font-bold text-blue-600">접수 (1/5)</span>
            </div>

            <div className="relative px-2">
              {/* Background Line */}
              <div className="absolute top-[9px] left-0 w-full h-[2px] bg-slate-100" />
              {/* Active Progress Line (Empty for Step 1 start) */}
              <div className="absolute top-[9px] left-0 h-[2px] bg-blue-500 transition-all duration-300" style={{ width: '0%' }} />

              {/* Nodes */}
              <div className="relative flex justify-between">
                {['접수', '피해', '치료', '보험금\n지급', '치료비\n지급'].map((label, i) => {
                  const currentStep = 0; // 0-indexed (접수)
                  const isCompleted = i < currentStep;
                  const isCurrent = i === currentStep;

                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white z-10 transition-all box-border",
                        (isCompleted || isCurrent) ? "border-blue-500" : "border-slate-200"
                      )}>
                        {(isCompleted || isCurrent) && (
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <span className={cn(
                        "text-[11px] font-medium text-center whitespace-pre-line leading-tight",
                        (isCompleted || isCurrent) ? "text-blue-600 font-bold" : "text-slate-400"
                      )}>{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
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
        />
      </div>
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
