'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type SkillType = 'reading' | 'writing' | 'listening' | 'speaking'

interface ProgressData {
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

interface ProgressContextType {
  progress: ProgressData
  updateProgress: (skill: SkillType, value: number) => void
  addTime: (minutes: number) => void
  completeActivity: () => void
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

function ProgressProvider({ children }: { children: React.ReactNode }) {
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
    // Load from MongoDB first, then fallback to localStorage (only on client side)
    if (typeof window === 'undefined') return
    
    const loadProgress = async () => {
      try {
        // Try to load from MongoDB first
        const response = await fetch('/api/progress?userId=default')
        if (response.ok) {
          const result = await response.json() as { success: boolean; data?: ProgressData }
          if (result.success && result.data) {
            const data: ProgressData = result.data
            const avg = Object.values(data.skills).reduce((a: number, b: number) => a + b, 0) / 4
            setProgress({
              totalCompleted: data.totalCompleted || 0,
              totalTime: data.totalTime || 0,
              overallProgress: data.overallProgress || Math.round(avg),
              achievements: data.achievements || 0,
              skills: {
                reading: Math.max(0, Math.min(100, data.skills.reading || 0)),
                writing: Math.max(0, Math.min(100, data.skills.writing || 0)),
                listening: Math.max(0, Math.min(100, data.skills.listening || 0)),
                speaking: Math.max(0, Math.min(100, data.skills.speaking || 0)),
              },
            })
            // Also save to localStorage for offline access
            localStorage.setItem('english-learning-progress', JSON.stringify(data))
            return
          }
        }
      } catch (error) {
        console.error('Error loading progress from MongoDB:', error)
      }

      // Fallback to localStorage
      try {
        const saved = localStorage.getItem('english-learning-progress')
        if (saved) {
          const parsed = JSON.parse(saved)
          // Validate and calculate overall progress from saved data
          if (parsed && parsed.skills && typeof parsed.skills === 'object') {
            const skills = parsed.skills as { reading: number; writing: number; listening: number; speaking: number }
            const avg = Object.values(skills).reduce((a: number, b: number) => a + b, 0) / 4
            setProgress({
              totalCompleted: parsed.totalCompleted || 0,
              totalTime: parsed.totalTime || 0,
              overallProgress: Math.round(avg),
              achievements: parsed.achievements || 0,
              skills: {
                reading: Math.max(0, Math.min(100, skills.reading || 0)),
                writing: Math.max(0, Math.min(100, skills.writing || 0)),
                listening: Math.max(0, Math.min(100, skills.listening || 0)),
                speaking: Math.max(0, Math.min(100, skills.speaking || 0)),
              },
            })
            // Sync to MongoDB in background
            fetch('/api/progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: 'default',
                ...parsed,
              }),
            }).catch(err => console.error('Error syncing to MongoDB:', err))
          }
        }
      } catch (error) {
        console.error('Error loading progress from localStorage:', error)
        // If there's an error, start with default values
      }
    }

    loadProgress()
  }, [])

  // Destructure skills for explicit dependencies
  const { reading, writing, listening, speaking } = progress.skills

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
  }, [reading, writing, listening, speaking])

  useEffect(() => {
    // Save to localStorage and MongoDB whenever key values change (only on client side)
    if (typeof window === 'undefined') return
    
    try {
      const dataToSave = {
        totalCompleted: progress.totalCompleted,
        totalTime: progress.totalTime,
        overallProgress: progress.overallProgress,
        achievements: progress.achievements,
        skills: progress.skills
      }
      // Save to localStorage for immediate access
      localStorage.setItem('english-learning-progress', JSON.stringify(dataToSave))
      
      // Save to MongoDB in background (debounced)
      const timeoutId = setTimeout(() => {
        fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'default',
            ...dataToSave,
          }),
        }).catch(err => console.error('Error saving progress to MongoDB:', err))
      }, 1000) // Debounce: wait 1 second before saving to DB

      return () => clearTimeout(timeoutId)
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }, [progress.totalCompleted, progress.totalTime, progress.overallProgress, progress.achievements, reading, writing, listening, speaking])

  const updateProgress = (skill: SkillType, value: number) => {
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

// Export ProgressProvider - default export first for better TypeScript compatibility
export default ProgressProvider
export { ProgressProvider }
export type { SkillType }