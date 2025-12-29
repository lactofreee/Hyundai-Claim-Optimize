"use client"

import { useRouter } from "next/navigation"
import { useProgress, TaskId } from "@/components/progress-provider"
import { Bot, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function ChatGuide({ onActionClick }: { onActionClick?: () => void }) {
  const router = useRouter()
  const { completedTasks, userName } = useProgress()

  const handleAction = (path: string) => {
    router.push(path)
    onActionClick?.()
  }

  return (
    <div className="h-full flex flex-col justify-start px-1 py-2 overflow-y-auto w-full">
      {/* Greeting Section */}
      <div className="space-y-6 mb-8">
        <div className="w-14 h-14 bg-[#5B5B8A] rounded-2xl flex items-center justify-center shadow-sm">
          <Bot className="w-7 h-7 text-white" />
        </div>
        <div className="space-y-2">
          {(() => {
            let title = <>{userName}님,<br />많이 놀라셨죠?</>;
            let desc = <>갑작스러운 사고로 경황이 없으실 텐데,<br />저희가 <span className="text-foreground font-bold">가장 먼저 도와드려야 할 일</span>을<br />찾아보았습니다.</>;

            if (completedTasks.includes("claim-write") && !completedTasks.includes("photo-upload")) {
              title = <>청구서가<br />잘 접수되었습니다.</>;
              desc = <>신속한 보상 처리를 위해<br /><span className="text-foreground font-bold">현장 상황을 확인할 수 있는 사진</span>을<br />등록해 주시면 큰 도움이 됩니다.</>;
            } else if (completedTasks.includes("photo-upload") && !completedTasks.includes("docs-guide")) {
              title = <>꼼꼼하게<br />기록해 주셨네요.</>;
              desc = <>보내주신 자료는 잘 전달되었습니다.<br />이제 <span className="text-foreground font-bold">필요한 서류</span>가 무엇인지<br />함께 확인해 볼까요?</>;
            } else if (completedTasks.includes("docs-guide") && !completedTasks.includes("med-guarantee")) {
              title = <>치료에만<br />집중해 주세요.</>;
              desc = <>복잡한 병원비 걱정 없으시도록<br /><span className="text-foreground font-bold">진료비 지급보증서</span>를<br />병원으로 바로 보내드리겠습니다.</>;
            } else if (completedTasks.includes("med-guarantee")) {
              title = <>모든 준비가<br />완료되었습니다.</>;
              desc = <>이제부터는 <span className="text-foreground font-bold">김현대 매니저</span>가<br />고객님의 든든한 파트너가 되어<br />남은 절차를 책임지겠습니다.</>;
            }

            return (
              <>
                <h2 className="text-2xl font-bold tracking-tight text-foreground leading-tight">
                  {title}
                </h2>
                <div className="pt-2 text-muted-foreground text-sm leading-relaxed">
                  {desc}
                </div>
              </>
            )
          })()}
        </div>
      </div>

      {/* Dynamic Urgent Action Card */}
      {!completedTasks.includes("claim-write") && (
        <div className="w-full bg-zinc-100 rounded-2xl p-5 mb-8 flex items-center justify-between cursor-pointer hover:bg-zinc-200 transition-colors" onClick={() => handleAction("/claim/write")}>
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
        <div className="w-full bg-zinc-100 rounded-2xl p-5 mb-8 flex items-center justify-between cursor-pointer hover:bg-zinc-200 transition-colors" onClick={() => handleAction("/claim/photo-upload")}>
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
          className="w-full bg-zinc-100 rounded-2xl p-5 mb-8 flex items-center justify-between cursor-pointer hover:bg-zinc-200 transition-colors"
          onClick={() => handleAction("/claim/docs-guide")}
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
          className="w-full bg-zinc-100 rounded-2xl p-5 mb-8 flex items-center justify-between cursor-pointer hover:bg-zinc-200 transition-colors"
          onClick={() => handleAction("/claim/med-guarantee")}
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


      {/* Next Steps List */}
      <div className="w-full border border-zinc-200 rounded-2xl p-5 space-y-5 bg-white">
        <h3 className="font-bold text-lg">다음 단계를 완료해 주세요</h3>

        <div className="space-y-4">
          {[
            { id: "claim-write", label: "보험금 청구서 작성 하기", action: () => handleAction("/claim/write") },
            { id: "photo-upload", label: "사고 사진 등록하기", action: () => handleAction("/claim/photo-upload") },
            { id: "docs-guide", label: "보험금 청구 제출 서류 안내", action: () => handleAction("/claim/docs-guide") },
            { id: "med-guarantee", label: "진료비 지급보증서 요청하기", action: () => handleAction("/claim/med-guarantee") }
          ].map((item) => {
            const isDone = completedTasks.includes(item.id as TaskId)
            return (
              <div key={item.id} className="flex items-center justify-between group cursor-pointer" onClick={() => !isDone && item.action()}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    isDone ? "bg-slate-800 border-slate-800" : "border-slate-300"
                  )}>
                    {isDone ? <Check className="w-3.5 h-3.5 text-white" /> : <span className="text-slate-300 text-xs font-bold leading-none"></span>}
                  </div>
                  <span className={cn(
                    "text-base font-bold transition-colors",
                    isDone ? "text-slate-400 line-through decoration-slate-400" : "text-slate-800"
                  )}>{item.label}</span>
                </div>
                <div className={cn("text-slate-400 transition-colors", !isDone && "group-hover:text-slate-900")}>
                  {isDone ? null : <ChevronRight className="w-5 h-5" />}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
