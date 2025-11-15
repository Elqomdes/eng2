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
    const { level, taskType, topic } = body

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

    // Determine task type (Independent or Integrated)
    const isIntegrated = taskType === 'integrated' || taskType === 'task2'
    const taskTypeToGenerate = taskType || (Math.random() > 0.5 ? 'independent' : 'integrated')

    if (taskTypeToGenerate === 'integrated') {
      // Generate Integrated Speaking Task (Video-based)
      const videoTopics = [
        'sustainable living practices',
        'renewable energy solutions',
        'urban planning and development',
        'educational technology',
        'healthcare innovation',
        'climate change adaptation',
        'artificial intelligence in daily life',
        'remote work trends',
        'sustainable agriculture',
        'digital transformation',
        'recycling and waste management',
        'public transportation systems',
        'renewable energy adoption',
        'online learning platforms',
        'telemedicine and healthcare',
        'smart city initiatives',
        'renewable energy investment',
        'sustainable food production',
        'green technology',
        'community development'
      ]

      const selectedTopic = topic || videoTopics[Math.floor(Math.random() * videoTopics.length)]

      const prompt = `You are an e-TEP (English Test of English Proficiency) exam content creator. Generate an Integrated Speaking Task that includes:
1. A realistic video transcript (like a short educational video, documentary, or presentation)
2. Clear instructions for students to summarize and discuss

Topic: ${selectedTopic}
Level: ${level} (B1/B2, B2, B2-C1, or C1)

Requirements:
- Create a video transcript (150-300 words) that presents information about the topic
- The transcript should be from a realistic video (educational, documentary, or presentation style)
- Duration requirement: 
  * B1/B2: 90-120 seconds speaking time
  * B2-C1/C1: 120-180 seconds speaking time
- Students should summarize the video and then discuss/reflect on the topic
- Make the content engaging and thought-provoking

Format your response as JSON with this exact structure:
{
  "taskType": "integrated",
  "title": "Integrated Speaking Task: [Topic Name]",
  "level": "${level}",
  "video": {
    "title": "Video title",
    "transcript": "Full transcript of the video (150-300 words, realistic educational/documentary style)",
    "mainPoints": ["Point 1", "Point 2", "Point 3", "Point 4"]
  },
  "prompt": "Full speaking prompt for students explaining what they need to do",
  "example": "Example response structure",
  "tips": [
    "Tip 1",
    "Tip 2",
    "Tip 3",
    "Tip 4",
    "Tip 5"
  ],
  "duration": 180
}

Important:
- Make the video transcript realistic and informative
- Ensure students can clearly summarize the main points
- Create a prompt that encourages discussion and reflection beyond just summarizing
- Use appropriate vocabulary for the level
- Make each task unique and different from previous ones`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert e-TEP exam content creator specializing in integrated speaking tasks. You create realistic, engaging video transcripts that prompt meaningful student responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.9, // Higher temperature for maximum variety
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })

      const responseContent = completion.choices[0]?.message?.content

      if (!responseContent) {
        return NextResponse.json(
          { error: 'Failed to generate speaking task' },
          { status: 500 }
        )
      }

      let speakingData
      try {
        speakingData = JSON.parse(responseContent)
      } catch (parseError) {
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          speakingData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('Invalid JSON response from AI')
        }
      }

      // Validate the structure
      if (!speakingData.video || !speakingData.prompt) {
        return NextResponse.json(
          { error: 'Invalid response structure from AI' },
          { status: 500 }
        )
      }

      // Add unique ID
      const task = {
        id: Date.now(),
        ...speakingData
      }

      return NextResponse.json(task, { status: 200 })

    } else {
      // Generate Independent Speaking Task
      const independentTopics = [
        'social media impact on society',
        'remote work vs office work',
        'importance of learning languages',
        'technology in education',
        'environmental protection',
        'work-life balance',
        'online shopping vs traditional shopping',
        'benefits of exercise',
        'importance of reading',
        'travel and cultural experiences',
        'healthy eating habits',
        'importance of sleep',
        'social networking',
        'online learning vs classroom learning',
        'renewable energy',
        'sustainable living',
        'mental health awareness',
        'community service',
        'artificial intelligence',
        'climate change action'
      ]

      const selectedTopic = topic || independentTopics[Math.floor(Math.random() * independentTopics.length)]

      const prompt = `You are an e-TEP (English Test of English Proficiency) exam content creator. Generate an Independent Speaking Task that prompts students to express their opinion.

Topic: ${selectedTopic}
Level: ${level} (Beginner, Intermediate, B1, B2, B2-C1, or C1)

Requirements:
- Create a thought-provoking question that requires students to express their opinion
- The question should allow for multiple perspectives and examples
- Duration requirement:
  * Beginner/Intermediate: 60-90 seconds
  * B1/B2: 90-120 seconds
  * B2-C1/C1: 120-180 seconds
- Students should provide reasons and examples to support their opinion
- Make the question engaging and relevant

Format your response as JSON with this exact structure:
{
  "taskType": "independent",
  "title": "Independent Speaking Task: [Topic]",
  "level": "${level}",
  "prompt": "The speaking question/prompt for students",
  "example": "Example response structure (e.g., 'In my opinion... I believe this because... For example...')",
  "tips": [
    "Tip 1",
    "Tip 2",
    "Tip 3",
    "Tip 4",
    "Tip 5"
  ],
  "duration": 120
}

Important:
- Make the question clear and specific
- Ensure students can provide multiple reasons and examples
- Use appropriate language for the level
- Make each task unique and different from previous ones
- The question should encourage extended speaking`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert e-TEP exam content creator specializing in independent speaking tasks. You create engaging, thought-provoking questions that prompt meaningful student responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.9, // Higher temperature for maximum variety
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      })

      const responseContent = completion.choices[0]?.message?.content

      if (!responseContent) {
        return NextResponse.json(
          { error: 'Failed to generate speaking task' },
          { status: 500 }
        )
      }

      let speakingData
      try {
        speakingData = JSON.parse(responseContent)
      } catch (parseError) {
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          speakingData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('Invalid JSON response from AI')
        }
      }

      // Validate the structure
      if (!speakingData.prompt) {
        return NextResponse.json(
          { error: 'Invalid response structure from AI' },
          { status: 500 }
        )
      }

      // Add unique ID
      const task = {
        id: Date.now(),
        ...speakingData
      }

      return NextResponse.json(task, { status: 200 })
    }

  } catch (error: any) {
    console.error('Error generating speaking task:', error)
    
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
        { error: errorMessage || 'Konuşma görevi oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
}

