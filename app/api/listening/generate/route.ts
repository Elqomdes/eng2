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
    const { level, topic, exerciseType } = body

    // Validate request body
    if (!level) {
      return NextResponse.json(
        { error: 'Missing required field: level' },
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

    // Exercise types: conversation, interview, lecture, discussion, presentation
    const exerciseTypes = [
      'conversation',
      'job interview',
      'academic lecture',
      'university discussion',
      'business presentation',
      'podcast discussion',
      'radio interview',
      'classroom discussion',
      'meeting',
      'phone conversation'
    ]

    const selectedType = exerciseType || exerciseTypes[Math.floor(Math.random() * exerciseTypes.length)]

    // Topics for variety
    const topics = [
      'daily life and routines',
      'technology and innovation',
      'education and learning',
      'environment and sustainability',
      'health and wellness',
      'travel and culture',
      'business and career',
      'science and research',
      'arts and entertainment',
      'sports and fitness',
      'food and cooking',
      'social issues',
      'history and culture',
      'psychology and behavior',
      'economics and finance',
      'climate change',
      'artificial intelligence',
      'space exploration',
      'medicine and healthcare',
      'renewable energy'
    ]

    const selectedTopic = topic || topics[Math.floor(Math.random() * topics.length)]

    const prompt = `You are an e-TEP (English Test of English Proficiency) exam content creator. Generate a realistic listening exercise with a transcript and questions.

Exercise Type: ${selectedType}
Topic: ${selectedTopic}
Level: ${level} (Beginner, Intermediate, B1, B2, B2-C1, or C1)

Requirements:
- Create a natural, realistic transcript (2-4 speakers for conversations/discussions, 1 speaker for lectures/presentations)
- Transcript length: 
  * Beginner/Intermediate: 100-150 words, 30-45 seconds
  * B1/B2: 150-250 words, 60-90 seconds
  * B2-C1/C1: 250-400 words, 90-120 seconds
- Generate 3-5 questions that test comprehension, inference, and detail recognition
- Mix question types: multiple-choice and matching (if multiple speakers)
- Questions should test understanding of main ideas, specific details, and inferences
- Make the content engaging and realistic

Format your response as JSON with this exact structure:
{
  "title": "Exercise title",
  "level": "${level}",
  "transcript": "Full transcript with speaker names (e.g., Sarah: ... Tom: ...)",
  "duration": number (in seconds, estimate based on word count),
  "questions": [
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "Question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correct": 0
    },
    {
      "id": 2,
      "type": "matching",
      "instruction": "Match each speaker with their statement/opinion",
      "speakers": ["Speaker 1", "Speaker 2", "Speaker 3"],
      "statements": ["Statement 1", "Statement 2", "Statement 3"],
      "matches": {"0": 0, "1": 1, "2": 2}
    }
  ]
}

Important:
- Make each exercise unique and different from previous ones
- Use natural, conversational language appropriate for the level
- Ensure questions are answerable based on the transcript
- For matching questions, ensure there are multiple speakers in the transcript
- Vary the question difficulty based on the level`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert e-TEP exam content creator specializing in listening comprehension exercises. You create realistic, engaging, and pedagogically sound listening exercises with appropriate questions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.9, // Higher temperature for maximum variety
      max_tokens: 3000,
      response_format: { type: 'json_object' }
    })

    const responseContent = completion.choices[0]?.message?.content

    if (!responseContent) {
      return NextResponse.json(
        { error: 'Failed to generate listening exercise' },
        { status: 500 }
      )
    }

    let exerciseData
    try {
      exerciseData = JSON.parse(responseContent)
    } catch (parseError) {
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        exerciseData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Invalid JSON response from AI')
      }
    }

    // Validate the structure
    if (!exerciseData.transcript || !exerciseData.questions || !exerciseData.title) {
      return NextResponse.json(
        { error: 'Invalid response structure from AI' },
        { status: 500 }
      )
    }

    // Add unique ID and ensure questions have proper structure
    const exercise = {
      id: Date.now(),
      title: exerciseData.title,
      level: exerciseData.level || level,
      transcript: exerciseData.transcript,
      duration: exerciseData.duration || Math.ceil(exerciseData.transcript.split(' ').length / 2.5), // Estimate: ~2.5 words per second
      questions: exerciseData.questions.map((q: any, index: number) => ({
        ...q,
        id: q.id || index + 1
      }))
    }

    return NextResponse.json(exercise, { status: 200 })

  } catch (error: any) {
    console.error('Error generating listening exercise:', error)
    
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
        { error: errorMessage || 'Dinleme görevi oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
}

