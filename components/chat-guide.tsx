"use client"

import { useRouter } from "next/navigation"
import { useProgress, TaskId } from "@/components/progress-provider"
import { Bot, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function ChatGuide({ onActionClick, isMessage = false }: { onActionClick?: () => void, isMessage?: boolean }) {
  const router = useRouter()
  const { completedTasks, userName } = useProgress()

  const handleAction = (path: string) => {
    router.push(path)
    onActionClick?.()
  }

  return (
    <div className={cn(
      "flex flex-col justify-start w-full",
      isMessage ? "gap-4 p-0" : "h-full px-1 py-2 overflow-y-auto"
    )}>
      {/* Greeting Section */}
      <div className={cn("space-y-4", isMessage ? "mb-2" : "mb-8")}>
        {!isMessage && (
          <div className="mb-8 flex justify-start">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Bot className="w-7 h-7 text-white" />
            </div>
          </div>
        )}
        <div className="space-y-2">
          {(() => {
            let title = <>{userName}님,<br />많이 놀라셨죠?</>;
            let desc = <>갑작스러운 사고로 경황이 없으실 텐데,<br />저희가 <span className="text-primary font-bold">가장 먼저 도와드려야 할 일</span>을<br />찾아보았습니다.</>;

            if (completedTasks.includes("claim-write") && !completedTasks.includes("photo-upload")) {
              title = <>청구서가<br />잘 접수되었습니다.</>;
              desc = <>신속한 보상 처리를 위해<br /><span className="text-primary font-bold">현장 상황을 확인할 수 있는 사진</span>을<br />등록해 주시면 큰 도움이 됩니다.</>;
            } else if (completedTasks.includes("photo-upload") && !completedTasks.includes("docs-guide")) {
              title = <>꼼꼼하게<br />기록해 주셨네요.</>;
              desc = <>보내주신 자료는 잘 전달되었습니다.<br />이제 <span className="text-primary font-bold">필요한 서류</span>가 무엇인지<br />함께 확인해 볼까요?</>;
            } else if (completedTasks.includes("docs-guide") && !completedTasks.includes("med-guarantee")) {
              title = <>치료에만<br />집중해 주세요.</>;
              desc = <>복잡한 병원비 걱정 없으시도록<br /><span className="text-primary font-bold">진료비 지급보증서</span>를<br />병원으로 바로 보내드리겠습니다.</>;
            } else if (completedTasks.includes("med-guarantee")) {
              title = <>모든 준비가<br />완료되었습니다.</>;
              desc = <>이제부터는 <span className="text-primary font-bold">김현대 매니저</span>가<br />고객님의 든든한 파트너가 되어<br />남은 절차를 책임지겠습니다.</>;
            }

            return (
              <>
                <h2 className={cn(
                  "font-bold tracking-tight text-slate-900 leading-tight",
                  isMessage ? "text-xl" : "text-2xl"
                )}>
                  {title}
                </h2>
                <div className={cn(
                  "text-slate-500 leading-relaxed",
                  isMessage ? "text-xs" : "text-sm pt-2"
                )}>
                  {desc}
                </div>
              </>
            )
          })()}
        </div>
      </div>

      {/* Dynamic Urgent Action Card */}
      {!completedTasks.includes("claim-write") && (
        <div className="w-full bg-slate-50 rounded-2xl p-4 mb-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors border border-slate-100" onClick={() => handleAction("/claim/write")}>
          <div className="flex-1">
            <p className="font-bold text-base text-slate-900 mb-0.5">보험금 청구서 작성 하기</p>
            <p className="text-xs text-primary font-bold">바로가기 {'>'}</p>
          </div>
          <div className="flex gap-1 opacity-20 shrink-0 ml-2">
            <div className="w-5 h-5 bg-slate-400 rounded-full" />
            <div className="w-5 h-5 bg-slate-400 rounded-md" />
          </div>
        </div>
      )}

      {completedTasks.includes("claim-write") && !completedTasks.includes("photo-upload") && (
        <div className="w-full bg-slate-50 rounded-2xl p-4 mb-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors border border-slate-100" onClick={() => handleAction("/claim/photo-upload")}>
          <div className="flex-1">
            <p className="font-bold text-base text-slate-900 mb-0.5">사고 사진 등록하기</p>
            <p className="text-xs text-primary font-bold">사진 업로드 {'>'}</p>
          </div>
          <div className="flex gap-1 opacity-20 shrink-0 ml-2">
            <div className="w-5 h-5 bg-slate-400 rounded-md" />
          </div>
        </div>
      )}

      {completedTasks.includes("photo-upload") && !completedTasks.includes("docs-guide") && (
        <div className="w-full bg-slate-50 rounded-2xl p-4 mb-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors border border-slate-100" onClick={() => handleAction("/claim/docs-guide")}>
          <div className="flex-1">
            <p className="font-bold text-base text-slate-900 mb-0.5">보험금 청구 제출서류 안내</p>
            <p className="text-xs text-primary font-bold">서류 제출 안내 가기 {'>'}</p>
          </div>
          <div className="flex gap-1 opacity-20 shrink-0 ml-2">
            <div className="w-5 h-5 bg-slate-400 rounded-md" />
            <div className="w-5 h-5 bg-slate-400 rounded-full" />
          </div>
        </div>
      )}

      {completedTasks.includes("docs-guide") && !completedTasks.includes("med-guarantee") && (
        <div className="w-full bg-slate-50 rounded-2xl p-4 mb-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors border border-slate-100" onClick={() => handleAction("/claim/med-guarantee")}>
          <div className="flex-1">
            <p className="font-bold text-base text-slate-900 mb-0.5">진료비 지급보증서 요청하기</p>
            <p className="text-xs text-primary font-bold">요청 화면 가기 {'>'}</p>
          </div>
          <div className="flex gap-1 opacity-20 shrink-0 ml-2">
            <div className="w-5 h-5 bg-slate-400 rounded-full" />
          </div>
        </div>
      )}

      {/* Next Steps List */}
      <div className={cn(
        "w-full border border-stone-100 rounded-2xl p-4 bg-white",
        isMessage ? "shadow-none" : "shadow-sm"
      )}>
        <h3 className="font-bold text-sm mb-4">전체 진행 단계</h3>

        <div className="relative space-y-0">
          {(() => {
            let activeTask = "";
            if (!completedTasks.includes("claim-write")) activeTask = "claim-write";
            else if (!completedTasks.includes("photo-upload")) activeTask = "photo-upload";
            else if (!completedTasks.includes("docs-guide")) activeTask = "docs-guide";
            else if (!completedTasks.includes("med-guarantee")) activeTask = "med-guarantee";

            const allSteps = [
              { id: "claim-write", label: "보험금 청구서 작성 하기", action: () => handleAction("/claim/write") },
              { id: "photo-upload", label: "사고 사진 등록하기", action: () => handleAction("/claim/photo-upload") },
              { id: "docs-guide", label: "보험금 청구 제출 서류 안내", action: () => handleAction("/claim/docs-guide") },
              { id: "med-guarantee", label: "진료비 지급보증서 요청하기", action: () => handleAction("/claim/med-guarantee") }
            ];

            const filteredSteps = allSteps.filter(item => item.id !== activeTask);

            return filteredSteps.map((item, index) => {
              const isDone = completedTasks.includes(item.id as TaskId);
              const isLast = index === filteredSteps.length - 1;

              return (
                <div key={item.id} className="relative flex items-start gap-3 pb-4 last:pb-0 group cursor-pointer" onClick={() => !isDone && item.action()}>
                  {!isLast && (
                    <div className={cn(
                      "absolute left-[9px] top-[18px] w-[0.5px] bg-stone-100",
                      isDone && "bg-slate-800"
                    )} style={{ height: 'calc(100% - 12px)' }} />
                  )}

                  <div className={cn(
                    "relative z-10 w-5 h-5 rounded-full border flex items-center justify-center transition-colors bg-white",
                    isDone ? "border-primary bg-primary" : "border-stone-200"
                  )}>
                    {isDone ? (
                      <Check className="w-2.5 h-2.5 text-white" />
                    ) : (
                      <div className="w-1 h-1 rounded-full bg-stone-200" />
                    )}
                  </div>

                  <div className="flex-1 flex items-center justify-between pt-0">
                    <span className={cn(
                      "text-xs transition-colors",
                      isDone ? "text-stone-400 font-medium" : "text-slate-800 font-bold"
                    )}>
                      {item.label}
                    </span>
                    {!isDone && (
                      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-slate-900 transition-colors" />
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  )
}
