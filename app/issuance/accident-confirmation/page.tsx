"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, FileCheck, FileText, CheckCircle2, Car, MapPin, Calendar, Hash } from "lucide-react"
import { useProgress } from "@/components/progress-provider"
import Link from "next/link"

export default function AccidentConfirmationPage() {
  const { caseNumber } = useProgress()

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="-ml-2 bg-transparent hover:bg-transparent shadow-none">
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </Button>
          </Link>
          <h1 className="font-bold text-lg">증명서 발급</h1>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Top Message */}
        <div className="space-y-2 text-center py-4">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            지급결의서 발급을<br />요청해주세요
          </h2>
          <p className="text-muted-foreground">
            필요한 서류를 선택하여 발급받으실 수 있습니다.
          </p>
        </div>

        {/* Accident Info Card */}
        <Card className="border-none shadow-lg bg-white overflow-hidden rounded-3xl">
          <div className="h-2 bg-[#635BFF] w-full" />
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#635BFF]" />
              사고 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 px-6 pb-6">
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> 사고 일시
                </p>
                <p className="font-bold text-slate-800 text-sm">2025-12-15 11:11</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" /> 접수 번호
                </p>
                <p className="font-bold text-slate-800 text-sm">{caseNumber}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Car className="w-3.5 h-3.5" /> 사고 차량
                </p>
                <p className="font-bold text-slate-800 text-sm">12가 3456 (K5)</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> 사고 장소
                </p>
                <p className="font-bold text-slate-800 text-sm truncate">서울 강남구 테헤란로 123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issuance Items */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg px-1">발급 항목</h3>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">자동차 사고 사실 확인</p>
                <p className="text-xs text-blue-600 font-medium mt-0.5">발급 가능</p>
              </div>
            </div>
            <CheckCircle2 className="w-6 h-6 text-blue-500" />
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between opacity-60">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-stone-500" />
              </div>
              <div>
                <p className="font-bold text-slate-900">진료비 지급 확인</p>
                <p className="text-xs text-stone-500 font-medium mt-0.5">처리 중 (지급 내역 없음)</p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full border-2 border-stone-200" />
          </div>
        </div>

      </main>

      {/* Bottom CTA */}
      <div className="sticky bottom-0 bg-white border-t border-stone-100 p-4 safe-area-bottom">
        <Button className="w-full h-14 text-lg font-bold rounded-xl bg-[#635BFF] hover:bg-[#534be0] shadow-lg shadow-indigo-200">
          선택한 증명서 발급하기
        </Button>
      </div>
    </div>
  )
}
