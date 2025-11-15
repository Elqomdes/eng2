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
    const { level, topic } = body

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

    // Generate a random academic topic if not provided
    const academicTopics = [
      'cognitive psychology and memory',
      'environmental science and sustainability',
      'artificial intelligence and machine learning',
      'neuroscience and brain function',
      'social psychology and behavior',
      'educational technology',
      'climate change adaptation',
      'bilingualism and language acquisition',
      'urban planning and development',
      'public health and epidemiology',
      'renewable energy systems',
      'data science and analytics',
      'biotechnology and genetics',
      'economic development',
      'sociology and culture',
      'marine biology and oceanography',
      'space exploration and astronomy',
      'philosophy of science',
      'digital transformation',
      'sustainable agriculture'
    ]

    const selectedTopic = topic || academicTopics[Math.floor(Math.random() * academicTopics.length)]

    const prompt = `You are an academic content generator creating reading passages for the e-TEP (English Test of English Proficiency) exam. Generate a high-quality academic reading passage with questions similar to those found in Google Scholar articles or open-access academic journals.

Requirements:
1. Create a reading passage with 4-5 paragraphs (labeled as Paragraph A, B, C, D, and optionally E)
2. Each paragraph should be 80-120 words
3. The content should be academic, research-based, and similar to articles found in Google Scholar
4. Topic: ${selectedTopic}
5. Level: ${level} (B2, C1, or B2-C1)
6. Include citations and references to research studies (use realistic researcher names and years)
7. Use academic vocabulary appropriate for the level

Generate 5-6 questions of different types:
- 2-3 multiple-choice questions (testing comprehension, inference, and detail)
- 1-2 matching questions (matching statements to paragraphs)
- 1 ordering question (arranging sentences in logical order)

Format your response as JSON with this exact structure:
{
  "title": "Academic title of the passage",
  "level": "${level}",
  "content": "Paragraph A: [content]\\n\\nParagraph B: [content]\\n\\nParagraph C: [content]\\n\\nParagraph D: [content]\\n\\nParagraph E: [content if needed]",
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
      "instruction": "Match each statement with the correct paragraph (A, B, C, D, or E).",
      "items": ["Statement 1", "Statement 2", "Statement 3", "Statement 4"],
      "paragraphs": ["Paragraph A", "Paragraph B", "Paragraph C", "Paragraph D"],
      "matches": {"0": 0, "1": 2, "2": 1, "3": 3}
    },
    {
      "id": 3,
      "type": "ordering",
      "instruction": "Arrange the following sentences to form a coherent paragraph.",
      "parts": ["Sentence 1", "Sentence 2", "Sentence 3", "Sentence 4"],
      "correctOrder": [1, 0, 3, 2]
    }
  ]
}

Important:
- Make sure the content is original and academic in nature
- Questions should test understanding of the passage, not just memorization
- For matching questions, ensure items clearly relate to specific paragraphs
- For ordering questions, create sentences that form a logical sequence
- Use realistic academic language and research terminology
- Include specific data, percentages, or findings where appropriate`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert academic content creator specializing in English language proficiency testing. You create high-quality, research-based reading passages similar to those found in academic journals and Google Scholar articles.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8, // Higher temperature for more variety
      max_tokens: 3000,
      response_format: { type: 'json_object' }
    })

    const responseContent = completion.choices[0]?.message?.content

    if (!responseContent) {
      return NextResponse.json(
        { error: 'Failed to generate reading passage' },
        { status: 500 }
      )
    }

    let readingData
    try {
      readingData = JSON.parse(responseContent)
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        readingData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Invalid JSON response from AI')
      }
    }

    // Validate the structure
    if (!readingData.title || !readingData.content || !readingData.questions) {
      return NextResponse.json(
        { error: 'Invalid response structure from AI' },
        { status: 500 }
      )
    }

    // Add a unique ID and ensure questions have proper structure
    const passage = {
      id: Date.now(), // Unique ID based on timestamp
      title: readingData.title,
      level: readingData.level || level,
      content: readingData.content,
      questions: readingData.questions.map((q: any, index: number) => ({
        ...q,
        id: q.id || index + 1
      }))
    }

    return NextResponse.json(passage, { status: 200 })

  } catch (error: any) {
    console.error('Error generating reading passage:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'Failed to generate reading passage' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

