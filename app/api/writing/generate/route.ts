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

    // Determine task type (Task 1: Social Media Post, Task 2: Graph + Podcast)
    const isTask2 = taskType === 'task2' || taskType === 'integrated'
    const taskTypeToGenerate = taskType || (Math.random() > 0.5 ? 'task1' : 'task2')

    if (taskTypeToGenerate === 'task2') {
      // Generate Task 2: Integrated Writing (Graph + Podcast)
      const graphTopics = [
        'renewable energy adoption',
        'online learning trends',
        'remote work statistics',
        'electric vehicle sales',
        'social media usage',
        'e-commerce growth',
        'urban population growth',
        'healthcare technology adoption',
        'sustainable agriculture practices',
        'digital payment systems',
        'climate change indicators',
        'telemedicine usage',
        'recycling rates',
        'solar panel installations',
        'public transportation usage',
        'organic food consumption',
        'cybersecurity incidents',
        'renewable energy investment',
        'carbon emissions reduction',
        'smartphone penetration'
      ]

      const selectedTopic = topic || graphTopics[Math.floor(Math.random() * graphTopics.length)]

      const prompt = `You are an e-TEP (English Test of English Proficiency) exam content creator. Generate an Integrated Writing Task 2 that includes:
1. A realistic graph/chart with data points
2. A podcast transcript related to the graph topic
3. Clear instructions for students

Topic: ${selectedTopic}
Level: ${level} (B1/B2, B2, B2-C1, or C1)

Requirements:
- Create a graph with 4-6 data points showing a trend over time (2010-2024 or similar range)
- Generate realistic data that makes sense for the topic
- Create a podcast transcript (3-4 main points, 150-200 words) that discusses the topic
- The podcast should connect with the graph data but also provide additional context
- Word count requirement: 200-250 words for B2-C1/C1, 150-200 words for B1/B2

Format your response as JSON with this exact structure:
{
  "taskType": "task2",
  "title": "Integrated Writing Task 2: [Topic Name]",
  "level": "${level}",
  "graph": {
    "title": "Graph title",
    "type": "line" or "bar" or "pie",
    "xAxis": "Time period (e.g., Years)",
    "yAxis": "Measurement unit (e.g., Percentage, Millions)",
    "dataPoints": [
      {"label": "2010", "value": 15, "unit": "%"},
      {"label": "2015", "value": 22, "unit": "%"},
      {"label": "2020", "value": 35, "unit": "%"},
      {"label": "2023", "value": 48, "unit": "%"}
    ],
    "description": "Brief description of what the graph shows"
  },
  "podcast": {
    "title": "Podcast title",
    "transcript": "Full transcript of the podcast (3-4 main points, 150-200 words)",
    "mainPoints": ["Point 1", "Point 2", "Point 3", "Point 4"]
  },
  "prompt": "Full writing prompt for students",
  "tips": [
    "Tip 1",
    "Tip 2",
    "Tip 3",
    "Tip 4"
  ],
  "wordCount": 200
}

Important:
- Make the graph data realistic and meaningful
- Ensure the podcast transcript connects with the graph but adds new information
- Create a prompt that clearly instructs students to summarize the podcast and connect it with the graph
- Use appropriate vocabulary for the level
- Make each task unique and different from previous ones`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert e-TEP exam content creator specializing in integrated writing tasks. You create realistic, engaging, and pedagogically sound writing prompts with graphs and podcast transcripts.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.9, // Higher temperature for maximum variety
        max_tokens: 2500,
        response_format: { type: 'json_object' }
      })

      const responseContent = completion.choices[0]?.message?.content

      if (!responseContent) {
        return NextResponse.json(
          { error: 'Failed to generate writing task' },
          { status: 500 }
        )
      }

      let writingData
      try {
        writingData = JSON.parse(responseContent)
      } catch (parseError) {
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          writingData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('Invalid JSON response from AI')
        }
      }

      // Validate the structure
      if (!writingData.graph || !writingData.podcast || !writingData.prompt) {
        return NextResponse.json(
          { error: 'Invalid response structure from AI' },
          { status: 500 }
        )
      }

      // Add unique ID
      const task = {
        id: Date.now(),
        ...writingData
      }

      return NextResponse.json(task, { status: 200 })

    } else {
      // Generate Task 1: Social Media Post Response
      const socialMediaTopics = [
        'climate change and sustainability',
        'technology and daily life',
        'education and learning',
        'health and wellness',
        'travel and culture',
        'work-life balance',
        'social media impact',
        'environmental protection',
        'mental health awareness',
        'remote work experiences',
        'sustainable living',
        'digital detox',
        'community engagement',
        'personal development',
        'cultural diversity',
        'food and nutrition',
        'exercise and fitness',
        'reading and books',
        'music and arts',
        'volunteering and charity'
      ]

      const selectedTopic = topic || socialMediaTopics[Math.floor(Math.random() * socialMediaTopics.length)]

      const prompt = `You are an e-TEP (English Test of English Proficiency) exam content creator. Generate an Integrated Writing Task 1 (Social Media Post Response) that includes:
1. A realistic social media post (Facebook, Twitter/X, Instagram style)
2. A comment responding to the post
3. Clear instructions for students

Topic: ${selectedTopic}
Level: ${level} (B1/B2, B2, B2-C1, or C1)

Requirements:
- Create an engaging social media post (2-3 sentences) that expresses an opinion or shares an experience
- Create a comment (1-2 sentences) that responds to the post
- The post and comment should be natural and realistic
- Word count requirement: 100-150 words for B2-C1/C1, 80-120 words for B1/B2
- Students should respond to both the post and the comment, expressing their own opinion

Format your response as JSON with this exact structure:
{
  "taskType": "task1",
  "title": "Integrated Writing Task 1: Social Media Response",
  "level": "${level}",
  "post": {
    "author": "Realistic name",
    "platform": "Facebook" or "Twitter" or "Instagram",
    "content": "The social media post content (2-3 sentences)",
    "timestamp": "Realistic timestamp"
  },
  "comment": {
    "author": "Different realistic name",
    "content": "The comment responding to the post (1-2 sentences)"
  },
  "prompt": "Full writing prompt for students explaining what they need to do",
  "tips": [
    "Tip 1",
    "Tip 2",
    "Tip 3",
    "Tip 4"
  ],
  "wordCount": 120
}

Important:
- Make the post and comment natural and engaging
- Ensure students can clearly express their opinion about the topic
- Use appropriate language for the level
- Make each task unique and different from previous ones
- The post should be thought-provoking enough to generate a meaningful response`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert e-TEP exam content creator specializing in integrated writing tasks. You create realistic, engaging social media posts and comments that prompt meaningful student responses.'
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
          { error: 'Failed to generate writing task' },
          { status: 500 }
        )
      }

      let writingData
      try {
        writingData = JSON.parse(responseContent)
      } catch (parseError) {
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          writingData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('Invalid JSON response from AI')
        }
      }

      // Validate the structure
      if (!writingData.post || !writingData.comment || !writingData.prompt) {
        return NextResponse.json(
          { error: 'Invalid response structure from AI' },
          { status: 500 }
        )
      }

      // Add unique ID
      const task = {
        id: Date.now(),
        ...writingData
      }

      return NextResponse.json(task, { status: 200 })
    }

  } catch (error: any) {
    console.error('Error generating writing task:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'Failed to generate writing task' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

