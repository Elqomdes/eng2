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
    const body = await request.json()
    const { text, voice } = body

    // Validate request body
    if (!text) {
      return NextResponse.json(
        { error: 'Missing required field: text' },
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

    // Available voices: alloy, echo, fable, onyx, nova, shimmer
    const selectedVoice = voice || 'alloy'

    // Generate speech using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: selectedVoice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      input: text,
      speed: 1.0, // Normal speed
    })

    // Convert the response to a buffer
    const buffer = Buffer.from(await mp3.arrayBuffer())

    // Return the audio file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    })

  } catch (error: any) {
    console.error('Error generating speech:', error)
    
    // Handle OpenAI API errors - check multiple possible error structures
    const statusCode = error?.status || error?.statusCode || error?.response?.status || error?.response?.statusCode
    
    if (statusCode === 429) {
      return NextResponse.json(
        { error: 'OpenAI API kotası aşıldı. Lütfen OpenAI hesabınızın faturalama ayarlarını kontrol edin ve tekrar deneyin.' },
        { status: 429 }
      )
    }
    
    if (statusCode === 401) {
      return NextResponse.json(
        { error: 'OpenAI API anahtarı geçersiz. Lütfen API anahtarınızı kontrol edin.' },
        { status: 401 }
      )
    }
    
    if (statusCode === 500 || statusCode === 503) {
      return NextResponse.json(
        { error: 'OpenAI servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.' },
        { status: 503 }
      )
    }
    
    if (error instanceof Error) {
      const errorMessage = error.message || ''
      
      // Check for quota exceeded in error message (case insensitive)
      if (errorMessage.toLowerCase().includes('quota') || 
          errorMessage.toLowerCase().includes('billing') ||
          errorMessage.toLowerCase().includes('exceeded') ||
          errorMessage.includes('429')) {
        return NextResponse.json(
          { error: 'OpenAI API kotası aşıldı. Lütfen OpenAI hesabınızın faturalama ayarlarını kontrol edin ve tekrar deneyin.' },
          { status: 429 }
        )
      }
      
      return NextResponse.json(
        { error: errorMessage || 'Seslendirme oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
}

