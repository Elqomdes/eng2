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
      // Determine if this is Task 1 (Independent) or Task 2 (Integrated)
      const isTask1 = prompt.includes('social media') || prompt.includes('post') || prompt.includes('comment')
      const isTask2 = prompt.includes('graph') || prompt.includes('podcast') || prompt.includes('visual') || prompt.includes('audio')
      
      if (isTask2) {
        // Integrated Writing Task 2 - Graph + Podcast
        evaluationPrompt = `You are an English language teacher evaluating a student's writing using the e-TEP Integrated Writing Rating Scale for Task 2.

Student Level: ${level}
Writing Prompt: ${prompt}
Student's Writing: ${content}

Evaluate the student's writing according to the e-TEP Integrated Writing Task 2 rating scale (0-5 points) across four criteria:
1. Content: How well they summarize the podcast points and connect them with the visual/graph
2. Grammar: Grammatical accuracy and control of complex structures
3. Vocabulary: Range and accuracy of vocabulary from both resources and individual repertoire
4. Coherence & Cohesion: How well ideas flow and connect

For each criterion, assign a score from 0-5 based on the e-TEP descriptors:
- 5: Addresses to fullest extent, comprehensive summary, clear connections
- 4: Addresses to large extent, well-developed summary
- 3: Addresses to adequate extent, some connections
- 2: Addresses to limited extent, weak connections
- 1: Addresses to very limited extent
- 0: Insufficient or irrelevant response

Calculate overall score (0-100) based on the average of the four criteria.

Format your response as JSON with the following structure:
{
  "score": number (0-100),
  "content": {
    "score": number (0-5),
    "assessment": "string",
    "summaryQuality": "string",
    "connectionQuality": "string"
  },
  "grammar": {
    "score": number (0-5),
    "assessment": "string",
    "errors": ["string"],
    "complexStructures": "string"
  },
  "vocabulary": {
    "score": number (0-5),
    "assessment": "string",
    "resourceUsage": "string",
    "range": "string",
    "suggestions": ["string"]
  },
  "coherence": {
    "score": number (0-5),
    "assessment": "string",
    "flow": "string",
    "cohesiveDevices": "string"
  },
  "overall": {
    "strengths": ["string"],
    "improvements": ["string"],
    "nextSteps": ["string"]
  },
  "feedback": "string (overall feedback in Turkish)"
}`
      } else {
        // Integrated Writing Task 1 - Social Media Post Response
        evaluationPrompt = `You are an English language teacher evaluating a student's writing using the e-TEP Integrated Writing Rating Scale for Task 1.

Student Level: ${level}
Writing Prompt: ${prompt}
Student's Writing: ${content}

Evaluate the student's writing according to the e-TEP Integrated Writing Task 1 rating scale (0-5 points) across four criteria:
1. Content: How well they refer to the post/comment and express personal opinion
2. Grammar: Grammatical accuracy and control of complex structures
3. Vocabulary: Range and accuracy of vocabulary, including collocational expressions
4. Coherence & Cohesion: How well ideas flow and connect

For each criterion, assign a score from 0-5 based on the e-TEP descriptors:
- 5: Addresses to fullest extent, refers explicitly to both post and comment, well-supported ideas
- 4: Addresses to large extent, refers to post/comment to large extent
- 3: Addresses to adequate extent, refers to some extent
- 2: Addresses to limited extent, limited reference
- 1: Addresses to minimal extent, very limited reference
- 0: Insufficient or completely lifted/irrelevant response

Calculate overall score (0-100) based on the average of the four criteria.

Format your response as JSON with the following structure:
{
  "score": number (0-100),
  "content": {
    "score": number (0-5),
    "assessment": "string",
    "referenceQuality": "string",
    "opinionQuality": "string"
  },
  "grammar": {
    "score": number (0-5),
    "assessment": "string",
    "errors": ["string"],
    "complexStructures": "string"
  },
  "vocabulary": {
    "score": number (0-5),
    "assessment": "string",
    "range": "string",
    "collocationalExpressions": "string",
    "suggestions": ["string"]
  },
  "coherence": {
    "score": number (0-5),
    "assessment": "string",
    "flow": "string",
    "cohesiveDevices": "string"
  },
  "overall": {
    "strengths": ["string"],
    "improvements": ["string"],
    "nextSteps": ["string"]
  },
  "feedback": "string (overall feedback in Turkish)"
}`
      }
    } else if (type === 'speaking') {
      // Determine if this is Independent or Integrated speaking task
      const isIntegrated = prompt.includes('video') || prompt.includes('watch') || prompt.includes('integrated')
      
      if (isIntegrated) {
        // Integrated Speaking - Video-based task
        evaluationPrompt = `You are an English language teacher evaluating a student's speaking using the e-TEP Integrated Speaking Rating Scale.

Student Level: ${level}
Speaking Prompt: ${prompt}
Student's Transcript: ${content}

Evaluate the student's speaking according to the e-TEP Integrated Speaking rating scale (0-5 points) across four criteria:
1. Task Completion: How well they summarize the video and discuss/reflect on the topic
2. Grammar: Control of grammatical structures
3. Vocabulary: Range and accuracy, including appropriate use of video vocabulary
4. Fluency & Pronunciation: Flow, pace, and pronunciation features

For each criterion, assign a score from 0-5 based on the e-TEP descriptors:
- 5: Addresses to fullest extent, comprehensive summary, deeply elaborated discussion
- 4: Addresses to large extent, well-developed summary, elaborated discussion
- 3: Addresses to adequate extent, some omissions, some new perspectives
- 2: Addresses to limited extent, missing/incomplete summary, limited discussion
- 1: Addresses to minimal extent, touches upon few moves
- 0: Off topic, memorized, insufficient, inaudible, technical issues

Calculate overall score (0-100) based on the average of the four criteria.

Format your response as JSON with the following structure:
{
  "score": number (0-100),
  "taskCompletion": {
    "score": number (0-5),
    "assessment": "string",
    "summaryQuality": "string",
    "discussionQuality": "string"
  },
  "grammar": {
    "score": number (0-5),
    "assessment": "string",
    "errors": ["string"],
    "complexStructures": "string"
  },
  "vocabulary": {
    "score": number (0-5),
    "assessment": "string",
    "videoVocabulary": "string",
    "range": "string",
    "suggestions": ["string"]
  },
  "fluency": {
    "score": number (0-5),
    "assessment": "string",
    "pace": "string",
    "hesitations": "string",
    "pronunciation": "string"
  },
  "overall": {
    "strengths": ["string"],
    "improvements": ["string"],
    "practiceSuggestions": ["string"]
  },
  "feedback": "string (overall feedback in Turkish)"
}`
      } else {
        // Independent Speaking
        evaluationPrompt = `You are an English language teacher evaluating a student's speaking using the e-TEP Independent Speaking Rating Scale.

Student Level: ${level}
Speaking Prompt: ${prompt}
Student's Transcript: ${content}

Evaluate the student's speaking according to the e-TEP Independent Speaking rating scale (0-5 points) across four criteria:
1. Task Completion: How well they respond to the task, develop content, and organize discourse
2. Grammar: Control of grammatical structures
3. Vocabulary: Range and accuracy of vocabulary
4. Fluency & Pronunciation: Flow, pace, and pronunciation features

For each criterion, assign a score from 0-5 based on the e-TEP descriptors:
- 5: Responds to fullest extent, content beyond personal experiences, well-organized
- 4: Responds to large extent, content beyond personal experiences, generally organized
- 3: Responds to adequate extent, some content beyond personal experiences, somewhat organized
- 2: Responds to limited extent, mainly personal experiences, partially organized
- 1: Responds to minimal extent, basic personal experiences, minimal organization
- 0: Off topic, memorized, insufficient, inaudible, technical issues

Calculate overall score (0-100) based on the average of the four criteria.

Format your response as JSON with the following structure:
{
  "score": number (0-100),
  "taskCompletion": {
    "score": number (0-5),
    "assessment": "string",
    "contentDevelopment": "string",
    "organization": "string"
  },
  "grammar": {
    "score": number (0-5),
    "assessment": "string",
    "errors": ["string"],
    "complexStructures": "string"
  },
  "vocabulary": {
    "score": number (0-5),
    "assessment": "string",
    "range": "string",
    "accuracy": "string",
    "suggestions": ["string"]
  },
  "fluency": {
    "score": number (0-5),
    "assessment": "string",
    "pace": "string",
    "hesitations": "string",
    "pronunciation": "string"
  },
  "overall": {
    "strengths": ["string"],
    "improvements": ["string"],
    "practiceSuggestions": ["string"]
  },
  "feedback": "string (overall feedback in Turkish)"
}`
      }
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

