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

    // OpenAI SDK accepts File objects directly from FormData in Next.js
    // The File from FormData should work, but we'll handle it properly
    const result = await openai.audio.transcriptions.create({
      file: audioFile as any, // Type assertion for compatibility
      model: 'whisper-1',
      language: 'en', // English
      response_format: 'text',
    })

    // Handle response - OpenAI returns string when response_format is 'text'
    const transcription = typeof result === 'string' 
      ? result 
      : (result as any)?.text || String(result || '')

    if (!transcription || transcription.trim() === '') {
      throw new Error('Boş transkript alındı. Lütfen tekrar deneyin.')
    }

    return NextResponse.json({ 
      transcript: transcription 
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error transcribing audio:', error)
    
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
        { error: errorMessage || 'Ses transkripti oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
}

