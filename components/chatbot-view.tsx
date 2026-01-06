"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Bot, Send, User, ChevronRight, Check, BookOpen, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { useProgress, TaskId } from "@/components/progress-provider"
import { getChatHistoryAction } from "@/actions/chat";
import { ChatGuide } from "@/components/chat-guide"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export function ChatbotView() {
  const router = useRouter()
  const { completedTasks } = useProgress()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await getChatHistoryAction();
        if (history && history.length > 0) {
          setMessages(history.map(msg => ({
            id: msg.id.toString(),
            role: msg.role,
            content: msg.content
          })));
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };
    loadHistory();
  }, []);

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
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || errorData.message || '서버 응답 오류가 발생했습니다.'
        throw new Error(errorMessage)
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
    } catch (error: any) {
      console.error("Webhook error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error.message || "죄송합니다. 서버 통신 중 오류가 발생했습니다.",
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

      {/* Header with Guide Toggle */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm md:text-base">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            AI에게 물어보기
          </h3>
        </div>

        {messages.length > 0 && (
          <Sheet open={isGuideOpen} onOpenChange={setIsGuideOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-8 rounded-full border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-600">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">진행 가이드 보기</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle>사고 처리 진행 가이드</SheetTitle>
              </SheetHeader>
              <ChatGuide onActionClick={() => setIsGuideOpen(false)} />
            </SheetContent>
          </Sheet>
        )}
      </div>


      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
        {messages.length === 0 ? (
          // Empty State (Inline Guide)
          <div className="p-6">
            <ChatGuide />
          </div>
        ) : (
          // Chat Message List
          <div className="flex flex-col gap-6 p-4 pb-4">
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground bg-stone-100 inline-block px-3 py-1 rounded-full">
                상단 <span className="font-bold text-indigo-500">가이드 보기</span> 버튼을 눌러 할 일을 언제든 확인할 수 있습니다.
              </p>
            </div>

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
