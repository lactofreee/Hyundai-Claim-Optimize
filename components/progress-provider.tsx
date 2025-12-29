"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type TaskId = "claim-write" | "photo-upload" | "docs-guide" | "med-guarantee"

interface ProgressContextType {
  currentStep: number // 0: 접수, 1: 피해, 2: 치료, 3: 보험금 지급, 4: 치료비 지급
  completedTasks: TaskId[]
  completeTask: (taskId: TaskId) => void
  resetProgress: () => void
  userName: string
  caseNumber: string
  accidentDate: string
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export function ProgressProvider({
  children,
  initialUserName,
  initialCurrentStep = 0,
  initialCompletedTasks = [],
  initialCaseNumber,
  initialAccidentDate
}: {
  children: React.ReactNode,
  initialUserName?: string,
  initialCurrentStep?: number,
  initialCompletedTasks?: TaskId[]
  initialCaseNumber?: string
  initialAccidentDate?: string
}) {
  const [currentStep, setCurrentStep] = useState(initialCurrentStep)
  const [completedTasks, setCompletedTasks] = useState<TaskId[]>(initialCompletedTasks)
  const [caseNumber] = useState(initialCaseNumber || "2512051243-02") // Fallback for dev
  const [accidentDate] = useState(initialAccidentDate || "2025-12-15T11:11") // Fallback for dev

  const completeTask = async (taskId: TaskId) => {
    if (completedTasks.includes(taskId)) return

    const newTasks = [...completedTasks, taskId]
    setCompletedTasks(newTasks)

    // Logic to advance steps based on completed tasks
    let nextStep = currentStep

    if (newTasks.includes("claim-write")) {
      nextStep = Math.max(nextStep, 1)
    }
    if (newTasks.includes("photo-upload") && newTasks.includes("docs-guide")) {
      nextStep = Math.max(nextStep, 2)
    }
    if (newTasks.includes("med-guarantee")) {
      nextStep = Math.max(nextStep, 3)
    }

    setCurrentStep(nextStep)

    // Sync to DB
    try {
      const { updateProgressAction } = await import("@/actions/progress")
      await updateProgressAction(nextStep, newTasks)
    } catch (error) {
      console.error("Failed to sync progress:", error)
    }
  }

  const resetProgress = () => {
    setCurrentStep(0)
    setCompletedTasks([])
  }

  return (
    <ProgressContext.Provider value={{
      currentStep,
      completedTasks,
      completeTask,
      resetProgress,
      userName: initialUserName || "김현대",
      caseNumber,
      accidentDate
    }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (context === undefined) {
    throw new Error("useProgress must be used within a ProgressProvider")
  }
  return context
}
