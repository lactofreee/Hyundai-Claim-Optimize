"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Upload, X, Image as ImageIcon, Video, Camera } from "lucide-react"
import Link from "next/link"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useProgress } from "@/components/progress-provider"
import { cn } from "@/lib/utils"

export default function PhotoUploadPage() {
  const router = useRouter()
  const { completeTask } = useProgress()
  const [files, setFiles] = useState<File[]>([])
  const [comment, setComment] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    completeTask("photo-upload") // Mark task as complete
    router.push("/") // Go back to dashboard (or maybe show success first?)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="-ml-2 hover:bg-stone-100 rounded-full">
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </Button>
          </Link>
          <h1 className="font-bold text-lg">사고 사진/동영상 등록</h1>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-xl mx-auto w-full space-y-6 pb-40"> {/* pb-40 for bottom fixed area */}

        {/* Guide Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            사고 현장 기록을<br />등록해 주세요
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            차량 파손 부위, 사고 현장 전경, 블랙박스 영상 등을<br />
            최대한 자세히 올려주시면 보상 처리에 도움이 됩니다.
          </p>
        </div>

        {/* Upload Area */}
        <div
          onClick={triggerFileInput}
          className="bg-white border-2 border-dashed border-stone-300 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-[#635BFF] hover:bg-slate-50 transition-all group min-h-[240px]"
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
          />

          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Camera className="w-8 h-8 text-stone-400 group-hover:text-[#635BFF]" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-bold text-slate-700 group-hover:text-[#635BFF]">사진/동영상 추가하기</p>
            <p className="text-xs text-stone-400">터치하여 앨범에서 선택하거나 촬영하세요</p>
          </div>
        </div>

        {/* File Preview List */}
        {files.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {files.map((file, index) => (
              <div key={index} className="relative aspect-square bg-black/5 rounded-xl overflow-hidden border border-stone-200">
                {/* Simplified preview logic - ideally would use URL.createObjectURL */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {file.type.startsWith('video') ? (
                    <Video className="w-8 h-8 text-slate-400" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="absolute bottom-0 w-full bg-black/50 p-1">
                  <p className="text-[10px] text-white truncate text-center px-1">{file.name}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Bottom Comment & Submit Area */}
      <div className="sticky bottom-0 bg-white border-t border-stone-100 p-4 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">상세 내용 (선택)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="사고 현장, 접촉 부위, 손상 범위 등에 대해 설명해 주세요."
              className="resize-none h-24 rounded-xl bg-stone-50 border-stone-200 focus-visible:ring-[#635BFF] text-base"
            />
          </div>

          <Button
            className={cn(
              "w-full h-14 text-lg font-bold rounded-xl shadow-lg transition-all",
              files.length > 0
                ? "bg-[#635BFF] hover:bg-[#534be0] shadow-indigo-200 text-white"
                : "bg-stone-200 text-stone-400 hover:bg-stone-200 shadow-none cursor-not-allowed"
            )}
            onClick={handleSubmit}
            disabled={files.length === 0}
          >
            {files.length}개 파일 등록하기
          </Button>
        </div>
      </div>
    </div>
  )
}
