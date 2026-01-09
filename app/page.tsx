import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Menu } from "lucide-react"
import { DashboardView } from "@/components/dashboard-view"
import { ChatbotView } from "@/components/chatbot-view"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getSession } from "@/lib/session"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  // 1. Check claim existence
  const session = await getSession();
  const supabase = createClient(await cookies());

  if (session?.userId) {
    const { data: hasClaim } = await supabase
      .from("insurance_claims")
      .select("id")
      .eq("user_id", session.userId)
      .limit(1)
      .maybeSingle();

    if (!hasClaim) {
      console.log(`[Home] User ${session.userId} has no claims. Redirecting to /claim/write`);
      redirect("/claim/write");
    }
  }

  return (
    <main className="h-[100dvh] bg-stone-100 flex flex-col font-sans text-slate-900 overflow-hidden md:h-screen">

      {/* Decorative Header Background */}
      <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#FDE4E4] to-[#F2DGD9]/0 -z-10 opacity-60" />

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto md:p-6 lg:p-8 flex-1 flex flex-col h-full overflow-hidden">

        {/* Note: Global Header Removed */}

        {/* Desktop View (md+) - Split Screen */}
        <div className="hidden md:grid md:grid-cols-12 gap-6 lg:gap-8 flex-1 min-h-[600px] h-full overflow-hidden">
          {/* Dashboard Panel (Left) */}
          <section className="col-span-12 md:col-span-7 lg:col-span-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/50 p-6 overflow-y-auto flex flex-col">
            {/* Desktop Dashboard Header */}
            <header className="flex justify-between items-center mb-6 px-1 shrink-0">
              <h1 className="text-2xl font-black tracking-tight">현대해상</h1>
              <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
                <Menu className="w-6 h-6" />
              </button>
            </header>

            <h2 className="text-lg font-bold mb-4 px-1 shrink-0">사고 처리 현황</h2>
            <DashboardView />
          </section>

          {/* AI Assistant Panel (Right) */}
          <section className="col-span-12 md:col-span-5 lg:col-span-4 bg-white rounded-3xl shadow-lg border border-indigo-50 flex flex-col overflow-hidden relative">
            <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-indigo-50/30 to-white overflow-hidden">
              <ChatbotView />
            </div>
          </section>
        </div>

        {/* Mobile View (< md) - Tabs */}
        <div className="md:hidden flex-1 bg-white flex flex-col h-full overflow-hidden">
          <Tabs defaultValue="dashboard" className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="sticky top-0 z-50 bg-white border-b border-stone-200 shrink-0">
              <TabsList className="w-full h-12 bg-transparent p-0 flex">
                <TabsTrigger
                  value="dashboard"
                  className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:font-bold data-[state=active]:text-primary text-gray-400 hover:text-gray-600 bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  사고 처리 현황
                </TabsTrigger>
                <TabsTrigger
                  value="ai-assistant"
                  className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:font-bold data-[state=active]:text-primary text-gray-400 hover:text-gray-600 bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  AI 비서
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden bg-zinc-50/50 relative">
              <TabsContent value="dashboard" className="p-4 m-0 h-full overflow-y-auto animate-in slide-in-from-left-2 duration-300">
                {/* Mobile Dashboard Header */}
                <header className="flex justify-between items-center mb-6 px-1">
                  <h1 className="text-2xl font-black tracking-tight">현대해상</h1>
                  <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
                    <Menu className="w-6 h-6" />
                  </button>
                </header>
                <DashboardView />
              </TabsContent>

              <TabsContent value="ai-assistant" className="p-0 m-0 h-full overflow-hidden animate-in slide-in-from-right-2 duration-300 flex flex-col">
                <ChatbotView />
              </TabsContent>
            </div>
          </Tabs>
        </div>

      </div>
    </main>
  );
}
