"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Upload, X, Image as ImageIcon, Video, Camera, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useProgress } from "@/components/progress-provider"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { registerPhotoAction } from "@/actions/photos"
import { getLatestClaimAction } from "@/actions/claims"

export default function PhotoUploadPage() {
  const router = useRouter()
  const { completeTask } = useProgress()
  const [files, setFiles] = useState<File[]>([])
  const [comment, setComment] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>("")
  const [latestCaseId, setLatestCaseId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Fetch latest caseId for the user using server action
  useEffect(() => {
    async function fetchLatestCase() {
      console.log("최신 청구서 정보 불러오는 중...");
      const result = await getLatestClaimAction();

      if (result.success && result.data) {
        console.log("최신 청구서 ID 발견:", result.data.id);
        setLatestCaseId(result.data.id);
        setCurrentUserId(result.userId || null);
      } else {
        console.warn("청구서 정보를 가져오지 못했습니다:", result.message);
      }
    }
    fetchLatestCase()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    if (isUploading) return
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (files.length === 0 || isUploading) return

    if (!latestCaseId || !currentUserId) {
      setUploadStatus("청구서 정보 또는 사용자 인증 정보를 찾을 수 없습니다. 다시 시도해 주세요.")
      return
    }

    setIsUploading(true)
    setUploadStatus("파일 업로드 준비 중...")

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadStatus(`${files.length}개 중 ${i + 1}번째 파일 업로드 중...`)

        // 1. Storage 업로드 (경로: accidents/{user_id}/{case_id}/{timestamp}_{filename})
        const timestamp = Date.now()
        const cleanFileName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase()
        const storagePath = `${currentUserId}/${latestCaseId}/${timestamp}_${cleanFileName}`

        const { error: uploadError } = await supabase.storage
          .from("accidents")
          .upload(storagePath, file)

        if (uploadError) throw uploadError

        // 2. DB 메타데이터 저장
        const result = await registerPhotoAction({
          caseId: latestCaseId,
          storagePath,
          fileName: file.name,
          fileSize: file.size
        })

        if (!result.success) throw new Error(result.message)
      }

      setUploadStatus("모든 파일 업로드 완료!")
      completeTask("photo-upload")

      // 잠깐 대기 후 대시보드로 이동
      setTimeout(() => {
        router.push("/")
      }, 1500)

    } catch (error: any) {
      console.error("업로드 오류:", error)
      setUploadStatus(`오류 발생: ${error.message}`)
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    if (isUploading) return
    fileInputRef.current?.click()
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="-ml-2 bg-transparent hover:bg-transparent shadow-none" disabled={isUploading}>
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </Button>
          </Link>
          <h1 className="font-bold text-lg">사고 사진/동영상 등록</h1>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-xl mx-auto w-full space-y-6 pb-40">
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
          className={cn(
            "bg-white border-2 border-dashed border-stone-300 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary hover:bg-slate-50 transition-all group min-h-[240px]",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />

          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center group-hover:scale-110 transition-transform">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <Camera className="w-8 h-8 text-stone-400 group-hover:text-primary" />
            )}
          </div>
          <div className="text-center space-y-1">
            <p className="font-bold text-slate-700 group-hover:text-primary">
              {isUploading ? "업로드 중..." : "사진/동영상 추가하기"}
            </p>
            <p className="text-xs text-stone-400">터치하여 앨범에서 선택하거나 촬영하세요</p>
          </div>
        </div>

        {/* Status Message */}
        {uploadStatus && (
          <p className={cn(
            "text-sm text-center font-medium",
            uploadStatus.includes("오류") ? "text-red-500" : "text-primary"
          )}>
            {uploadStatus}
          </p>
        )}

        {/* File Preview List */}
        {files.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {files.map((file, index) => (
              <div key={index} className="relative aspect-square bg-black/5 rounded-xl overflow-hidden border border-stone-200 group">
                {file.type.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`preview-${index}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
                    <Video className="w-8 h-8 text-stone-400" />
                  </div>
                )}

                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/60 to-transparent p-2 pt-6">
                  <p className="text-[10px] text-white truncate text-center px-1 font-medium">{file.name}</p>
                </div>

                {!isUploading && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
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
              className="resize-none h-24 rounded-xl bg-stone-50 border-stone-200 focus-visible:ring-primary text-base"
              disabled={isUploading}
            />
          </div>

          <Button
            className={cn(
              "w-full h-14 text-lg font-bold rounded-xl shadow-lg transition-all",
              files.length > 0 && !isUploading
                ? "bg-primary hover:opacity-90 shadow-primary/20 text-white"
                : "bg-stone-200 text-stone-400 hover:bg-stone-200 shadow-none cursor-not-allowed"
            )}
            onClick={handleSubmit}
            disabled={files.length === 0 || isUploading}
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                업로드 중...
              </span>
            ) : (
              `${files.length}개 파일 등록하기`
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
