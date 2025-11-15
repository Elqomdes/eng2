import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Runtime configuration for Vercel
export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds max duration for Vercel

// Lazy initialization to avoid build-time errors when API key is missing
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 60000, // 60 second timeout
    maxRetries: 2, // Retry up to 2 times on failure
  })
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    // Validate request body
    if (!audioFile) {
      return NextResponse.json(
        { error: 'Missing required field: audio file' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.' },
        { status: 500 }
      )
    }

    const openai = getOpenAIClient()

    // Convert File to Blob for OpenAI API (Node.js compatible)
    const arrayBuffer = await audioFile.arrayBuffer()
    const blob = new Blob([arrayBuffer], { type: audioFile.type })

    // Transcribe audio using OpenAI Whisper
    // OpenAI SDK accepts File, Blob, or ReadableStream
    const transcription = await openai.audio.transcriptions.create({
      file: blob as any, // Type assertion for compatibility
      model: 'whisper-1',
      language: 'en', // English
      response_format: 'text',
    })

    return NextResponse.json({ 
      transcript: transcription 
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error transcribing audio:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'Failed to transcribe audio' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

