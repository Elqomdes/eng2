import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProgress extends Document {
  userId?: string // Optional for now, can be added later for multi-user support
  totalCompleted: number
  totalTime: number // in minutes
  overallProgress: number // percentage
  achievements: number
  skills: {
    reading: number // percentage
    writing: number // percentage
    listening: number // percentage
    speaking: number // percentage
  }
  createdAt: Date
  updatedAt: Date
}

const ProgressSchema = new Schema<IProgress>(
  {
    userId: {
      type: String,
      default: 'default', // For single-user mode
      index: true,
    },
    totalCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    achievements: {
      type: Number,
      default: 0,
      min: 0,
    },
    skills: {
      reading: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      writing: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      listening: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      speaking: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
  },
  {
    timestamps: true,
  }
)

// Create index for userId
ProgressSchema.index({ userId: 1 })

const Progress: Model<IProgress> =
  mongoose.models.Progress || mongoose.model<IProgress>('Progress', ProgressSchema)

export default Progress

