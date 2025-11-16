import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Progress from '@/lib/models/Progress'

// GET - Fetch progress
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const userId = request.nextUrl.searchParams.get('userId') || 'default'

    let progress = await Progress.findOne({ userId })

    // If no progress exists, create a default one
    if (!progress) {
      progress = await Progress.create({
        userId,
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
    }

    return NextResponse.json({
      success: true,
      data: {
        totalCompleted: progress.totalCompleted,
        totalTime: progress.totalTime,
        overallProgress: progress.overallProgress,
        achievements: progress.achievements,
        skills: progress.skills,
      },
    })
  } catch (error: any) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch progress',
      },
      { status: 500 }
    )
  }
}

// POST - Update progress
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const {
      userId = 'default',
      totalCompleted,
      totalTime,
      overallProgress,
      achievements,
      skills,
    } = body

    // Find existing progress or create new one
    let progress = await Progress.findOne({ userId })

    const updateData: any = {}

    if (totalCompleted !== undefined) updateData.totalCompleted = totalCompleted
    if (totalTime !== undefined) updateData.totalTime = totalTime
    if (overallProgress !== undefined)
      updateData.overallProgress = overallProgress
    if (achievements !== undefined) updateData.achievements = achievements
    if (skills !== undefined) updateData.skills = skills

    if (progress) {
      // Update existing progress
      Object.assign(progress, updateData)
      await progress.save()
    } else {
      // Create new progress
      progress = await Progress.create({
        userId,
        totalCompleted: totalCompleted || 0,
        totalTime: totalTime || 0,
        overallProgress: overallProgress || 0,
        achievements: achievements || 0,
        skills: skills || {
          reading: 0,
          writing: 0,
          listening: 0,
          speaking: 0,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        totalCompleted: progress.totalCompleted,
        totalTime: progress.totalTime,
        overallProgress: progress.overallProgress,
        achievements: progress.achievements,
        skills: progress.skills,
      },
    })
  } catch (error: any) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update progress',
      },
      { status: 500 }
    )
  }
}

// PATCH - Partial update (for incremental updates)
export async function PATCH(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const {
      userId = 'default',
      totalCompleted,
      totalTime,
      overallProgress,
      achievements,
      skills,
    } = body

    let progress = await Progress.findOne({ userId })

    if (!progress) {
      // Create new progress if it doesn't exist
      progress = await Progress.create({
        userId,
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
    }

    // Incremental updates
    if (totalCompleted !== undefined) {
      progress.totalCompleted = Math.max(0, progress.totalCompleted + totalCompleted)
    }
    if (totalTime !== undefined) {
      progress.totalTime = Math.max(0, progress.totalTime + totalTime)
    }
    if (overallProgress !== undefined) {
      progress.overallProgress = Math.max(
        0,
        Math.min(100, overallProgress)
      )
    }
    if (achievements !== undefined) {
      progress.achievements = Math.max(progress.achievements, achievements)
    }
    if (skills) {
      if (skills.reading !== undefined) {
        progress.skills.reading = Math.max(0, Math.min(100, skills.reading))
      }
      if (skills.writing !== undefined) {
        progress.skills.writing = Math.max(0, Math.min(100, skills.writing))
      }
      if (skills.listening !== undefined) {
        progress.skills.listening = Math.max(0, Math.min(100, skills.listening))
      }
      if (skills.speaking !== undefined) {
        progress.skills.speaking = Math.max(0, Math.min(100, skills.speaking))
      }
    }

    await progress.save()

    return NextResponse.json({
      success: true,
      data: {
        totalCompleted: progress.totalCompleted,
        totalTime: progress.totalTime,
        overallProgress: progress.overallProgress,
        achievements: progress.achievements,
        skills: progress.skills,
      },
    })
  } catch (error: any) {
    console.error('Error patching progress:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update progress',
      },
      { status: 500 }
    )
  }
}

