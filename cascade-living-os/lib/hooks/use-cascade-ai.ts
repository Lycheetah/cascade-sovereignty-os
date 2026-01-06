// CASCADE Living OS - Claude API Hook
// Client-side hook for interacting with Claude

import { useState, useCallback } from 'react'

interface AnalysisContext {
  mood?: number
  energy?: number
  recentPatterns?: string[]
  sovereigntyScore?: number
}

interface Pattern {
  type: 'RECURRING_THEME' | 'COGNITIVE_DISTORTION' | 'INSIGHT' | 'QUESTION' | 'GROWTH'
  content: string
  significance: 'low' | 'medium' | 'high'
}

interface ShadowMaterial {
  content: string
  projection?: string
  integration?: string
}

interface PyramidSuggestion {
  content: string
  suggestedLayer: 'FOUNDATION' | 'THEORY' | 'EDGE'
  evidenceStrength: number
  reasoning: string
}

interface JournalAnalysis {
  patterns: Pattern[]
  shadowMaterial: ShadowMaterial[]
  pyramidSuggestions: PyramidSuggestion[]
  sovereigntyInsight: string
  lamagueMood: {
    symbols: string[]
    interpretation: string
  }
  followUpQuestions: string[]
}

interface UseCascadeAIReturn {
  // Journal analysis
  analyzeJournal: (content: string, context?: AnalysisContext) => Promise<JournalAnalysis | null>
  
  // Chat
  chat: (message: string, context?: AnalysisContext) => Promise<string>
  
  // Oracle
  consultOracle: (query: string, context?: AnalysisContext) => Promise<string>
  
  // State
  isLoading: boolean
  error: string | null
  lastResponse: string | null
}

export function useCascadeAI(): UseCascadeAIReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResponse, setLastResponse] = useState<string | null>(null)

  const callAPI = useCallback(async (
    type: 'journal' | 'chat' | 'oracle',
    content: string,
    context?: AnalysisContext
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          content,
          context
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'API request failed')
      }

      setLastResponse(data.response || JSON.stringify(data.analysis))
      return data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const analyzeJournal = useCallback(async (
    content: string,
    context?: AnalysisContext
  ): Promise<JournalAnalysis | null> => {
    try {
      const data = await callAPI('journal', content, context)
      return data.analysis || null
    } catch {
      return null
    }
  }, [callAPI])

  const chat = useCallback(async (
    message: string,
    context?: AnalysisContext
  ): Promise<string> => {
    try {
      const data = await callAPI('chat', message, context)
      return data.response || ''
    } catch {
      return 'I encountered an error. Please check your API configuration.'
    }
  }, [callAPI])

  const consultOracle = useCallback(async (
    query: string,
    context?: AnalysisContext
  ): Promise<string> => {
    try {
      const data = await callAPI('oracle', query, context)
      return data.response || ''
    } catch {
      return 'The Oracle is unavailable. Please check your API configuration.'
    }
  }, [callAPI])

  return {
    analyzeJournal,
    chat,
    consultOracle,
    isLoading,
    error,
    lastResponse
  }
}

// Fallback analysis when API is not available
export function fallbackJournalAnalysis(text: string): Partial<JournalAnalysis> {
  const patterns: Pattern[] = []
  const shadowMaterial: ShadowMaterial[] = []
  const pyramidSuggestions: PyramidSuggestion[] = []
  
  // Simple keyword detection
  const keywords = {
    anxiety: ['anxious', 'worried', 'nervous', 'fear', 'panic', 'stress'],
    growth: ['learning', 'growing', 'improving', 'better', 'progress', 'realized'],
    shadow: ['anger', 'jealous', 'envy', 'hate', 'resentment', 'shame', 'guilt'],
    insight: ['understand', 'clarity', 'discovered', 'insight', 'aware'],
    question: ['why', 'how', 'wonder', 'curious', 'what if']
  }

  const lowerText = text.toLowerCase()

  for (const [theme, words] of Object.entries(keywords)) {
    const matches = words.filter(w => lowerText.includes(w))
    if (matches.length > 0) {
      patterns.push({
        type: theme === 'insight' ? 'INSIGHT' : 
              theme === 'question' ? 'QUESTION' :
              theme === 'growth' ? 'GROWTH' :
              theme === 'shadow' ? 'COGNITIVE_DISTORTION' : 'RECURRING_THEME',
        content: `${theme}: detected keywords (${matches.join(', ')})`,
        significance: matches.length > 2 ? 'high' : matches.length > 1 ? 'medium' : 'low'
      })
    }
  }

  // Shadow triggers
  const shadowTriggers = ['should', 'must', 'never', 'always', "can't", 'hate', 'blame']
  for (const trigger of shadowTriggers) {
    if (lowerText.includes(trigger)) {
      const sentences = text.split(/[.!?]+/)
      const shadowSentence = sentences.find(s => s.toLowerCase().includes(trigger))
      if (shadowSentence) {
        shadowMaterial.push({
          content: shadowSentence.trim(),
          projection: `Possible projection around "${trigger}"`,
          integration: 'Consider: What part of yourself are you resisting?'
        })
      }
    }
  }

  // Belief extraction
  const beliefPatterns = text.match(/I (believe|think|know|feel)[^.!?]+/gi) || []
  for (const belief of beliefPatterns.slice(0, 3)) {
    pyramidSuggestions.push({
      content: belief,
      suggestedLayer: 'EDGE',
      evidenceStrength: 0.3,
      reasoning: 'Personal belief - needs validation'
    })
  }

  return {
    patterns,
    shadowMaterial,
    pyramidSuggestions,
    sovereigntyInsight: patterns.length > 0 
      ? 'Your entry shows active self-reflection - this is sovereignty in action.'
      : 'Keep exploring your thoughts. Every entry builds self-awareness.',
    lamagueMood: {
      symbols: shadowMaterial.length > 0 ? ['Ψ', '∇cas'] : ['Ao', 'Φ↑'],
      interpretation: shadowMaterial.length > 0 
        ? 'Integration work emerging' 
        : 'Grounded and ascending'
    },
    followUpQuestions: [
      'What felt most true as you wrote this?',
      'What are you avoiding looking at?'
    ]
  }
}
