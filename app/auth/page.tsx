"use client"

import { useState } from "react"
import { loginAction } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Phone } from "lucide-react"

export default function AuthPage() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone) return

    setIsLoading(true)
    try {
      // In a real app, this would trigger an SMS verification flow.
      // Here, we simulate a successful verification and login.
      const mockCI = "mock_ci_" + Date.now()
      await loginAction({ name, phone, ci: mockCI })
    } catch (error) {
      console.error("Login failed:", error)
      setIsLoading(false)
    }
  }

  // Format phone number
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    if (value.length <= 11) {
      setPhone(value)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-8">

        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-[#635BFF]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">본인인증</h1>
          <p className="text-slate-500">
            서비스 이용을 위해<br />
            휴대폰 본인인증을 진행해 주세요.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-bold">이름</Label>
            <Input
              id="name"
              type="text"
              placeholder="이름을 입력하세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-lg rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base font-bold">휴대폰 번호</Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                placeholder="01012345678"
                value={phone}
                onChange={handlePhoneChange}
                className="h-12 text-lg rounded-xl pl-12 tracking-wide"
                required
              />
              <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 rounded-xl shadow-lg mt-4"
            disabled={isLoading || !name || phone.length < 10}
          >
            {isLoading ? "인증 중..." : "인증하고 시작하기"}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400 leading-relaxed">
          본인인증 시 수집된 정보는<br />
          서비스 이용 기간 동안 안전하게 보관되며,<br />
          이용 목적 달성 후 즉시 파기됩니다.
        </p>
      </div>
    </div>
  )
}
