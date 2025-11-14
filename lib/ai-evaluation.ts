export interface WritingEvaluation {
  score: number
  grammar: {
    assessment: string
    errors: string[]
    examples: string[]
  }
  vocabulary: {
    assessment: string
    strengths: string[]
    suggestions: string[]
  }
  structure: {
    assessment: string
    strengths: string[]
    improvements: string[]
  }
  content: {
    assessment: string
    relevance: string
  }
  overall: {
    strengths: string[]
    improvements: string[]
    nextSteps: string[]
  }
  feedback: string
}

export interface SpeakingEvaluation {
  score: number
  pronunciation: {
    assessment: string
    strengths: string[]
    issues: string[]
    suggestions: string[]
  }
  fluency: {
    assessment: string
    pace: string
    hesitations: string
    suggestions: string[]
  }
  grammar: {
    assessment: string
    errors: string[]
    suggestions: string[]
  }
  vocabulary: {
    assessment: string
    strengths: string[]
    suggestions: string[]
  }
  content: {
    assessment: string
    relevance: string
    ideas: string
  }
  overall: {
    strengths: string[]
    improvements: string[]
    practiceSuggestions: string[]
  }
  feedback: string
}

export async function evaluateWriting(
  content: string,
  prompt: string,
  level: string
): Promise<WritingEvaluation> {
  try {
    const response = await fetch('/api/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'writing',
        content,
        prompt,
        level,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Evaluation failed with status ${response.status}`)
    }

    const data = await response.json()
    if (!data.evaluation) {
      throw new Error('Invalid response format from server')
    }
    return data.evaluation
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unexpected error occurred during evaluation')
  }
}

export async function evaluateSpeaking(
  transcript: string,
  prompt: string,
  level: string
): Promise<SpeakingEvaluation> {
  try {
    const response = await fetch('/api/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'speaking',
        content: transcript,
        prompt,
        level,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Evaluation failed with status ${response.status}`)
    }

    const data = await response.json()
    if (!data.evaluation) {
      throw new Error('Invalid response format from server')
    }
    return data.evaluation
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unexpected error occurred during evaluation')
  }
}

