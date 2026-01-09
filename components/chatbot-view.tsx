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
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Create a guide message object
  const guideMessage: Message = {
    id: "guide-mission",
    role: "assistant",
    content: "GUIDE_WIDGET"
  }

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await getChatHistoryAction();
        const formattedHistory = history.map(msg => ({
          id: msg.id.toString(),
          role: msg.role as "user" | "assistant",
          content: msg.content
        }));

        if (formattedHistory.length === 0) {
          // If no history, just show guide
          setMessages([guideMessage]);
        } else {
          // If history exists, prepend guide or re-insert if not present
          const hasGuide = formattedHistory.some(m => m.id === "guide-mission");
          if (!hasGuide) {
            setMessages([guideMessage, ...formattedHistory]);
          } else {
            setMessages(formattedHistory);
          }
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
        setMessages([guideMessage]);
      }
    };
    loadHistory();
  }, []);

  const prevTasksRef = useRef<TaskId[]>(completedTasks)

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Append a new guide message when tasks change (e.g., user completes a mission)
  useEffect(() => {
    // Only append if there's a real change in completed tasks count
    // and it's not the initial mount (where history is loaded)
    if (completedTasks.length > prevTasksRef.current.length) {
      const updateMessage: Message = {
        id: `guide-update-${Date.now()}`,
        role: "assistant",
        content: "GUIDE_WIDGET"
      }
      setMessages(prev => [...prev, updateMessage])
    }
    prevTasksRef.current = completedTasks
  }, [completedTasks]);

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

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm md:text-base">
            <MessageSquare className="w-4 h-4 text-primary" />
            AI 보험 전문가
          </h3>
        </div>
      </div>


      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
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
                  message.role === "user" ? "bg-gray-200" : "bg-primary"
                )}
              >
                {message.role === "user" ? (
                  <User className="w-5 h-5 text-gray-500" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Message Bubble or Widget */}
              {message.content === "GUIDE_WIDGET" ? (
                <div className="bg-white border border-primary/10 p-5 rounded-2xl rounded-tl-none shadow-sm max-w-[90%] w-full">
                  <ChatGuide isMessage={true} />
                </div>
              ) : (
                <div
                  className={cn(
                    "px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
                    message.role === "user"
                      ? "bg-gray-100 text-gray-900 rounded-tr-none"
                      : "bg-white border border-primary/10 text-slate-800 rounded-tl-none"
                  )}
                >
                  {message.content}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex w-full items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white border border-primary/10 rounded-tl-none shadow-sm flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Section (Fixed Bottom) */}
      <div className="p-4 pt-2 border-t border-gray-100 bg-white/80 backdrop-blur-sm shrink-0">
        <div className="relative flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="궁금한 내용을 입력해주세요"
            className="h-14 rounded-2xl bg-muted/60 border-transparent text-lg placeholder:text-muted-foreground/70 focus-visible:bg-white focus-visible:ring-primary transition-all shadow-sm pr-12 pl-4"
          />

          <Button
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90"
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
