import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Runtime configuration for Vercel
export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds max duration for Vercel

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // 60 second timeout
  maxRetries: 2, // Retry up to 2 times on failure
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, content, prompt, level } = body

    // Validate request body
    if (!type || !content || !prompt || !level) {
      return NextResponse.json(
        { error: 'Missing required fields: type, content, prompt, or level' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.' },
        { status: 500 }
      )
    }

    let evaluationPrompt = ''

    if (type === 'writing') {
      evaluationPrompt = `You are an English language teacher evaluating a student's writing. 
      
Student Level: ${level}
Writing Prompt: ${prompt}
Student's Writing: ${content}

Please provide a comprehensive evaluation in Turkish (for the student) that includes:
1. Overall Score (0-100)
2. Grammar Assessment (with specific examples of errors)
3. Vocabulary Assessment (word choice and variety)
4. Structure and Organization
5. Content Quality (how well they addressed the prompt)
6. Specific Strengths
7. Areas for Improvement
8. Suggestions for next steps

Format your response as JSON with the following structure:
{
  "score": number,
  "grammar": {
    "assessment": "string",
    "errors": ["string"],
    "examples": ["string"]
  },
  "vocabulary": {
    "assessment": "string",
    "strengths": ["string"],
    "suggestions": ["string"]
  },
  "structure": {
    "assessment": "string",
    "strengths": ["string"],
    "improvements": ["string"]
  },
  "content": {
    "assessment": "string",
    "relevance": "string"
  },
  "overall": {
    "strengths": ["string"],
    "improvements": ["string"],
    "nextSteps": ["string"]
  },
  "feedback": "string (overall feedback in Turkish)"
}`
    } else if (type === 'speaking') {
      evaluationPrompt = `You are an English language teacher evaluating a student's speaking practice. 

Student Level: ${level}
Speaking Prompt: ${prompt}
Student's Transcript: ${content}

Please provide a comprehensive evaluation in Turkish (for the student) that includes:
1. Overall Score (0-100)
2. Pronunciation Assessment
3. Fluency Assessment
4. Grammar and Vocabulary Usage
5. Content and Ideas
6. Specific Strengths
7. Areas for Improvement
8. Practice Suggestions

Format your response as JSON with the following structure:
{
  "score": number,
  "pronunciation": {
    "assessment": "string",
    "strengths": ["string"],
    "issues": ["string"],
    "suggestions": ["string"]
  },
  "fluency": {
    "assessment": "string",
    "pace": "string",
    "hesitations": "string",
    "suggestions": ["string"]
  },
  "grammar": {
    "assessment": "string",
    "errors": ["string"],
    "suggestions": ["string"]
  },
  "vocabulary": {
    "assessment": "string",
    "strengths": ["string"],
    "suggestions": ["string"]
  },
  "content": {
    "assessment": "string",
    "relevance": "string",
    "ideas": "string"
  },
  "overall": {
    "strengths": ["string"],
    "improvements": ["string"],
    "practiceSuggestions": ["string"]
  },
  "feedback": "string (overall feedback in Turkish)"
}`
    } else {
      return NextResponse.json(
        { error: 'Invalid evaluation type' },
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional English language teacher. Always respond in valid JSON format.',
        },
        {
          role: 'user',
          content: evaluationPrompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    if (!completion.choices || completion.choices.length === 0 || !completion.choices[0]?.message) {
      return NextResponse.json(
        { error: 'Invalid response from AI model' },
        { status: 500 }
      )
    }

    const responseContent = completion.choices[0].message.content
    if (!responseContent) {
      return NextResponse.json(
        { error: 'No response from AI model' },
        { status: 500 }
      )
    }

    let evaluation
    try {
      evaluation = JSON.parse(responseContent)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json(
        { error: 'Invalid response format from AI model' },
        { status: 500 }
      )
    }

    // Validate evaluation structure
    if (typeof evaluation.score !== 'number' || evaluation.score < 0 || evaluation.score > 100) {
      return NextResponse.json(
        { error: 'Invalid evaluation response: score must be a number between 0 and 100' },
        { status: 500 }
      )
    }

    return NextResponse.json({ evaluation })
  } catch (error: any) {
    console.error('Evaluation error:', error)
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      // Network/Connection errors
      if (error.message.includes('fetch') || 
          error.message.includes('network') || 
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('ENOTFOUND') ||
          error.message.includes('ETIMEDOUT') ||
          error.message.includes('timeout') ||
          error.name === 'TypeError' && error.message.includes('fetch')) {
        return NextResponse.json(
          { error: 'Bağlantı hatası. Lütfen internet bağlantınızı veya VPN ayarlarınızı kontrol edin ve tekrar deneyin.' },
          { status: 503 }
        )
      }
      
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        return NextResponse.json(
          { error: 'Invalid OpenAI API key. Please check your configuration.' },
          { status: 401 }
        )
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Değerlendirme başarısız oldu. Lütfen tekrar deneyin.'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

