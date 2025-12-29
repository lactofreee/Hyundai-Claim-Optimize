"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Bot, Send, User, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useProgress, TaskId } from "@/components/progress-provider"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export function ChatbotView() {
  const router = useRouter()
  const { completedTasks, completeTask, userName } = useProgress()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const suggestions = [
    "서류 발급 하기",
    "진행 현황 조회하기",
    "담당자 조회하기 (비가입자)",
    "계약 조회하기 (가입자)"
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Use local Next.js API route as a proxy to avoid CORS errors
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      // Prioritize 'msg' field as requested, fallback to other common fields or stringified JSON
      const aiContent = typeof data === 'string' ? data : (data.msg || data.output || data.message || data.text || data.response || JSON.stringify(data, null, 2))

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiContent,
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Webhook error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "죄송합니다. 서버 통신 중 오류가 발생했습니다.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSendMessage(inputValue)
    }
  }

  return (
    <div className="flex flex-col h-full w-full relative bg-white md:bg-transparent">

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto w-full">
        {messages.length === 0 ? (
          // Empty State (Greeting & Suggestions)
          <div className="h-full flex flex-col justify-start px-6 py-8 overflow-y-auto w-full">
            {/* Greeting Section */}
            <div className="space-y-6 mb-8">
              <div className="w-14 h-14 bg-[#5B5B8A] rounded-2xl flex items-center justify-center shadow-sm">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-foreground leading-tight">
                  {userName}님<br />
                  인증 감사합니다.
                </h2>
                <div className="pt-2 text-muted-foreground text-base leading-relaxed whitespace-pre-line">
                  고객님!
                  <br />
                  12월 15일 사고 건을 확인해 보니,
                  <br />
                  지금은 치료를 위한
                  <br />
                  <span className="text-foreground font-semibold">
                    {!completedTasks.includes("claim-write") ? "보험금 청구서 작성이 가장 시급합니다" :
                      !completedTasks.includes("photo-upload") ? "사고 현장 사진 등록이 필요합니다" :
                        "담당자 배정을 기다리고 있습니다"}
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Urgent Action Card */}
            {!completedTasks.includes("claim-write") && (
              <div className="w-full bg-zinc-100 rounded-2xl p-5 mb-8 flex items-center justify-between cursor-pointer hover:bg-zinc-200 transition-colors" onClick={() => router.push("/claim/write")}>
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
              <div className="w-full bg-zinc-100 rounded-2xl p-5 mb-8 flex items-center justify-between cursor-pointer hover:bg-zinc-200 transition-colors" onClick={() => router.push("/claim/photo-upload")}>
                <div>
                  <p className="font-bold text-lg text-slate-900 mb-1">사고 사진 등록하기</p>
                  <p className="text-sm text-slate-500 font-medium">사진 업로드 {'>'}</p>
                </div>
                <div className="flex gap-1 opacity-20">
                  <div className="w-6 h-6 bg-slate-400 rounded-md" />
                </div>
              </div>
            )}


            {/* Next Steps List */}
            <div className="w-full border border-zinc-200 rounded-2xl p-5 space-y-5 bg-white">
              <h3 className="font-bold text-lg">다음 단계를 완료해 주세요</h3>

              <div className="space-y-4">
                {[
                  { id: "claim-write", label: "보험금 청구서 작성 하기", action: () => router.push("/claim/write") },
                  { id: "photo-upload", label: "사고 사진 등록하기", action: () => router.push("/claim/photo-upload") },
                  { id: "docs-guide", label: "보험금 청구 제출 서류 안내", action: () => { completeTask("docs-guide"); handleSendMessage("필요 서류 안내해주세요") } },
                  { id: "med-guarantee", label: "진료비 지급보증서 요청하기", action: () => { completeTask("med-guarantee"); handleSendMessage("지급 보증서 발급 요청") } }
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
        ) : (
          // Chat Message List
          <div className="flex flex-col gap-6 p-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex w-full items-start gap-3",
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                    message.role === "user" ? "bg-gray-200" : "bg-[#635BFF]"
                  )}
                >
                  {message.role === "user" ? (
                    <User className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={cn(
                    "px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
                    message.role === "user"
                      ? "bg-gray-100 text-gray-900 rounded-tr-none"
                      : "bg-white border border-indigo-100 text-slate-800 rounded-tl-none"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex w-full items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#635BFF] flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white border border-indigo-100 rounded-tl-none shadow-sm flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Section (Fixed Bottom) */}
      <div className="p-4 pt-2 border-t border-gray-100 bg-white/80 backdrop-blur-sm shrink-0">
        <div className="relative flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="궁금한 내용을 입력해주세요"
            className="h-14 rounded-2xl bg-muted/60 border-transparent text-lg placeholder:text-muted-foreground/70 focus-visible:bg-white focus-visible:ring-purple-500 transition-all shadow-sm pr-12 pl-4"
          />

          <Button
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-[#635BFF] hover:bg-[#534be0]"
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
          >
            <Send className="w-5 h-5 text-white" />
          </Button>
        </div>
      </div>
    </div>
  )
}
