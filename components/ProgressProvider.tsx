'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface ProgressContextType {
  progress: {
    totalCompleted: number
    totalTime: number
    overallProgress: number
    achievements: number
    skills: {
      reading: number
      writing: number
      listening: number
      speaking: number
    }
  }
  updateProgress: (skill: string, value: number) => void
  addTime: (minutes: number) => void
  completeActivity: () => void
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState({
    totalCompleted: 0,
    totalTime: 0,
    overallProgress: 0,
    achievements: 0,
    skills: {
      reading: 0,
      writing: 0,
      listening: 0,
      speaking: 0,
    },
  })

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('english-learning-progress')
    if (saved) {
      const parsed = JSON.parse(saved)
      // Calculate overall progress from saved data
      const avg = Object.values(parsed.skills).reduce((a: number, b: number) => a + b, 0) / 4
      setProgress({ ...parsed, overallProgress: Math.round(avg) })
    }
  }, [])

  useEffect(() => {
    // Calculate and update overall progress and check achievements
    setProgress(prev => {
      const avg = Object.values(prev.skills).reduce((a, b) => a + b, 0) / 4
      const newOverallProgress = Math.round(avg)
      
      let newAchievements = prev.achievements
      
      // Check skill-based achievements (100% in any skill)
      const allSkillsAt100 = Object.values(prev.skills).every(skill => skill >= 100)
      if (allSkillsAt100 && prev.achievements < 200) {
        newAchievements = 200 // Master achievement
      }
      
      // Check overall progress achievements
      if (avg >= 50 && prev.achievements < 150) {
        newAchievements = Math.max(newAchievements, 150)
      }
      if (avg >= 75 && prev.achievements < 175) {
        newAchievements = Math.max(newAchievements, 175)
      }
      
      if (newOverallProgress === prev.overallProgress && newAchievements === prev.achievements) {
        return prev
      }
      return { ...prev, overallProgress: newOverallProgress, achievements: newAchievements }
    })
  }, [progress.skills.reading, progress.skills.writing, progress.skills.listening, progress.skills.speaking])

  useEffect(() => {
    // Save to localStorage whenever key values change
    const dataToSave = {
      totalCompleted: progress.totalCompleted,
      totalTime: progress.totalTime,
      overallProgress: progress.overallProgress,
      achievements: progress.achievements,
      skills: progress.skills
    }
    localStorage.setItem('english-learning-progress', JSON.stringify(dataToSave))
  }, [progress.totalCompleted, progress.totalTime, progress.overallProgress, progress.achievements, progress.skills.reading, progress.skills.writing, progress.skills.listening, progress.skills.speaking])

  const updateProgress = (skill: string, value: number) => {
    setProgress(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skill]: Math.min(100, Math.max(0, value)),
      },
    }))
  }

  const addTime = (minutes: number) => {
    setProgress(prev => ({
      ...prev,
      totalTime: prev.totalTime + minutes,
    }))
  }

  const completeActivity = () => {
    setProgress(prev => {
      const newTotalCompleted = prev.totalCompleted + 1
      
      // Calculate achievements based on milestones
      let newAchievements = prev.achievements
      const milestones = [1, 5, 10, 25, 50, 100]
      
      // Check if we've reached a new milestone
      for (const milestone of milestones) {
        if (newTotalCompleted >= milestone && prev.totalCompleted < milestone) {
          newAchievements = Math.max(newAchievements, milestone)
        }
      }
      
      return {
        ...prev,
        totalCompleted: newTotalCompleted,
        achievements: newAchievements,
      }
    })
  }

  return (
    <ProgressContext.Provider value={{ progress, updateProgress, addTime, completeActivity }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}

