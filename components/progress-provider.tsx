"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type TaskId = "claim-write" | "photo-upload" | "docs-guide" | "med-guarantee"

interface ProgressContextType {
  currentStep: number // 0: 접수, 1: 피해, 2: 치료, 3: 보험금 지급, 4: 치료비 지급
  completedTasks: TaskId[]
  completeTask: (taskId: TaskId) => void
  resetProgress: () => void
  userName: string
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedTasks, setCompletedTasks] = useState<TaskId[]>([])

  // Load state from localStorage on mount
  useEffect(() => {
    const savedStep = localStorage.getItem("accident-step")
    const savedTasks = localStorage.getItem("accident-tasks")

    if (savedStep) setCurrentStep(parseInt(savedStep))
    if (savedTasks) setCompletedTasks(JSON.parse(savedTasks))
  }, [])

  // Save state whenever it changes
  useEffect(() => {
    localStorage.setItem("accident-step", currentStep.toString())
    localStorage.setItem("accident-tasks", JSON.stringify(completedTasks))
  }, [currentStep, completedTasks])

  const completeTask = (taskId: TaskId) => {
    if (completedTasks.includes(taskId)) return

    const newTasks = [...completedTasks, taskId]
    setCompletedTasks(newTasks)

    // Logic to advance steps based on completed tasks
    // This is a simple rule-based logic for the prototype
    let nextStep = currentStep

    if (newTasks.includes("claim-write")) {
      nextStep = Math.max(nextStep, 1) // Advance to '피해' check
    }
    if (newTasks.includes("photo-upload") && newTasks.includes("docs-guide")) {
      nextStep = Math.max(nextStep, 2) // Advance to '치료'
    }
    if (newTasks.includes("med-guarantee")) {
      nextStep = Math.max(nextStep, 3) // Advance to '보험금 지급' (simulated)
    }

    setCurrentStep(nextStep)
  }

  const resetProgress = () => {
    setCurrentStep(0)
    setCompletedTasks([])
    localStorage.removeItem("accident-step")
    localStorage.removeItem("accident-tasks")
  }

  return (
    <ProgressContext.Provider value={{
      currentStep,
      completedTasks,
      completeTask,
      resetProgress,
      userName: "김현대"
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
