'use client'

import { useState } from 'react'
import { useCASCADEStore } from '@/lib/store/cascade-store'
import { JournalEntry, Pattern, ShadowInsight, PyramidIntegration } from '@/types/cascade'

// Brain Dump Input
function BrainDumpInput() {
  const [text, setText] = useState('')
  const [mood, setMood] = useState(5)
  const [energy, setEnergy] = useState(5)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const addJournalEntry = useCASCADEStore(state => state.addJournalEntry)
  const updatePatterns = useCASCADEStore(state => state.updatePatterns)
  const patterns = useCASCADEStore(state => state.patterns)
  
  // Simple pattern extraction (in production, this would use AI)
  const analyzeText = (rawText: string): {
    patterns: Pattern[]
    shadows: ShadowInsight[]
    integrations: PyramidIntegration[]
  } => {
    const words = rawText.toLowerCase().split(/\s+/)
    const newPatterns: Pattern[] = []
    const shadows: ShadowInsight[] = []
    const integrations: PyramidIntegration[] = []
    
    // Detect recurring themes
    const themeKeywords = {
      anxiety: ['anxious', 'worried', 'nervous', 'fear', 'panic'],
      growth: ['learning', 'growing', 'improving', 'better', 'progress'],
      shadow: ['anger', 'jealous', 'envy', 'hate', 'resentment', 'shame'],
      insight: ['realized', 'understood', 'discovered', 'insight', 'clarity'],
      question: ['why', 'how', 'what if', 'wondering', 'curious']
    }
    
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      const matches = keywords.filter(k => rawText.toLowerCase().includes(k))
      if (matches.length > 0) {
        const existing = patterns.find(p => p.content.toLowerCase().includes(theme))
        if (existing) {
          newPatterns.push({
            ...existing,
            frequency: existing.frequency + 1,
            lastSeen: Date.now()
          })
        } else {
          newPatterns.push({
            type: theme === 'shadow' ? 'COGNITIVE_DISTORTION' :
                  theme === 'insight' ? 'INSIGHT' :
                  theme === 'question' ? 'QUESTION' : 'RECURRING_THEME',
            content: `${theme}: ${matches.join(', ')}`,
            frequency: 1,
            firstSeen: Date.now(),
            lastSeen: Date.now()
          })
        }
      }
    }
    
    // Detect shadow material
    const shadowTriggers = ['should', 'must', 'never', 'always', 'can\'t', 'hate', 'blame']
    for (const trigger of shadowTriggers) {
      if (rawText.toLowerCase().includes(trigger)) {
        const sentences = rawText.split(/[.!?]+/)
        const shadowSentence = sentences.find(s => s.toLowerCase().includes(trigger))
        if (shadowSentence) {
          shadows.push({
            content: shadowSentence.trim(),
            projection: `Possible projection around "${trigger}"`,
            integration: 'Consider: What part of yourself are you rejecting?',
            lamague: {
              symbols: ['Ψ', '∇cas'],
              interpretation: 'Shadow material requiring integration',
              intensity: 0.7
            }
          })
        }
      }
    }
    
    // Suggest pyramid integrations
    if (rawText.includes('I believe') || rawText.includes('I think') || rawText.includes('I know')) {
      const beliefs = rawText.match(/I (believe|think|know)[^.!?]+/gi) || []
      for (const belief of beliefs.slice(0, 3)) {
        integrations.push({
          blockContent: belief,
          suggestedLayer: 'EDGE',
          evidenceStrength: 0.3,
          sourceEntryIds: []
        })
      }
    }
    
    return { patterns: newPatterns, shadows, integrations }
  }
  
  const handleSubmit = () => {
    if (!text.trim()) return
    
    setIsAnalyzing(true)
    
    // Simulate analysis delay
    setTimeout(() => {
      const analysis = analyzeText(text)
      
      addJournalEntry({
        rawText: text,
        extractedPatterns: analysis.patterns,
        shadowMaterial: analysis.shadows,
        suggestedIntegrations: analysis.integrations,
        mood,
        energy
      })
      
      // Update global patterns
      const allPatterns = [...patterns]
      for (const newPattern of analysis.patterns) {
        const existing = allPatterns.findIndex(p => p.content === newPattern.content)
        if (existing >= 0) {
          allPatterns[existing] = newPattern
        } else {
          allPatterns.push(newPattern)
        }
      }
      updatePatterns(allPatterns)
      
      setText('')
      setIsAnalyzing(false)
    }, 500)
  }
  
  return (
    <div className="cascade-card p-6">
      <h3 className="text-lg font-medium text-zinc-200 mb-4">Brain Dump</h3>
      
      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Let it all out... Write freely without judgment. Your thoughts, feelings, frustrations, insights, questions..."
          className="w-full h-48 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 resize-none"
        />
        
        {/* Mood & Energy */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-zinc-400">Mood</label>
              <span className="text-sm font-mono text-cyan-400">{mood}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={mood}
              onChange={(e) => setMood(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-zinc-400">Energy</label>
              <span className="text-sm font-mono text-purple-400">{energy}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={energy}
              onChange={(e) => setEnergy(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isAnalyzing}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Analyzing...
            </>
          ) : (
            'Process & Analyze'
          )}
        </button>
      </div>
    </div>
  )
}

// Journal Entry Card
function EntryCard({ entry }: { entry: JournalEntry }) {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div className="cascade-card p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs text-zinc-500">
            {new Date(entry.timestamp).toLocaleString()}
          </span>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-zinc-400">
              Mood: <span className="text-cyan-400 font-mono">{entry.mood}/10</span>
            </span>
            <span className="text-xs text-zinc-400">
              Energy: <span className="text-purple-400 font-mono">{entry.energy}/10</span>
            </span>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-zinc-500 hover:text-zinc-300"
        >
          <svg className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      <p className={`text-sm text-zinc-300 ${expanded ? '' : 'line-clamp-3'}`}>
        {entry.rawText}
      </p>
      
      {expanded && (
        <div className="mt-4 space-y-4 animate-fade-in">
          {/* Patterns */}
          {entry.extractedPatterns.length > 0 && (
            <div>
              <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Patterns Detected</h4>
              <div className="flex flex-wrap gap-2">
                {entry.extractedPatterns.map((pattern, i) => (
                  <span 
                    key={i}
                    className={`text-xs px-2 py-1 rounded ${
                      pattern.type === 'INSIGHT' ? 'bg-emerald-500/20 text-emerald-400' :
                      pattern.type === 'QUESTION' ? 'bg-blue-500/20 text-blue-400' :
                      pattern.type === 'COGNITIVE_DISTORTION' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {pattern.content}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Shadow Material */}
          {entry.shadowMaterial.length > 0 && (
            <div>
              <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Shadow Material</h4>
              <div className="space-y-2">
                {entry.shadowMaterial.map((shadow, i) => (
                  <div key={i} className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                    <p className="text-sm text-zinc-300 italic mb-2">"{shadow.content}"</p>
                    {shadow.projection && (
                      <p className="text-xs text-purple-400">{shadow.projection}</p>
                    )}
                    {shadow.integration && (
                      <p className="text-xs text-zinc-400 mt-1">{shadow.integration}</p>
                    )}
                    {shadow.lamague && (
                      <div className="flex items-center gap-2 mt-2">
                        {shadow.lamague.symbols.map((s, j) => (
                          <span key={j} className="lamague-symbol text-xs">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Suggested Integrations */}
          {entry.suggestedIntegrations.length > 0 && (
            <div>
              <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Suggested Pyramid Integrations</h4>
              <div className="space-y-2">
                {entry.suggestedIntegrations.map((integration, i) => (
                  <div key={i} className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-300">{integration.blockContent}</p>
                      <span className={`text-xs ${
                        integration.suggestedLayer === 'FOUNDATION' ? 'text-purple-400' :
                        integration.suggestedLayer === 'THEORY' ? 'text-blue-400' :
                        'text-emerald-400'
                      }`}>
                        → {integration.suggestedLayer}
                      </span>
                    </div>
                    <button className="text-xs text-cyan-400 hover:text-cyan-300 px-2 py-1 bg-cyan-500/10 rounded">
                      Add to Pyramid
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Pattern Tracker
function PatternTracker() {
  const patterns = useCASCADEStore(state => state.patterns)
  
  const sortedPatterns = [...patterns].sort((a, b) => b.frequency - a.frequency)
  
  return (
    <div className="cascade-card p-6">
      <h3 className="text-lg font-medium text-zinc-200 mb-4">Recurring Patterns</h3>
      
      {sortedPatterns.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-4">
          No patterns detected yet. Keep journaling!
        </p>
      ) : (
        <div className="space-y-3">
          {sortedPatterns.slice(0, 10).map((pattern, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                pattern.type === 'INSIGHT' ? 'bg-emerald-500/20 text-emerald-400' :
                pattern.type === 'QUESTION' ? 'bg-blue-500/20 text-blue-400' :
                pattern.type === 'COGNITIVE_DISTORTION' ? 'bg-amber-500/20 text-amber-400' :
                'bg-zinc-700 text-zinc-300'
              }`}>
                {pattern.frequency}
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-300">{pattern.content}</p>
                <p className="text-xs text-zinc-500">
                  {pattern.type.replace('_', ' ').toLowerCase()} • 
                  Last: {new Date(pattern.lastSeen).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Mood/Energy Chart (simplified)
function MoodEnergyChart() {
  const journal = useCASCADEStore(state => state.journal)
  
  const recentEntries = journal.slice(0, 14).reverse()
  
  if (recentEntries.length < 2) {
    return (
      <div className="cascade-card p-6">
        <h3 className="text-lg font-medium text-zinc-200 mb-4">Mood & Energy Trends</h3>
        <p className="text-sm text-zinc-500 text-center py-8">
          Add more journal entries to see trends
        </p>
      </div>
    )
  }
  
  const maxMood = 10
  
  return (
    <div className="cascade-card p-6">
      <h3 className="text-lg font-medium text-zinc-200 mb-4">Mood & Energy Trends</h3>
      
      <div className="h-32 flex items-end gap-1">
        {recentEntries.map((entry, i) => (
          <div key={entry.id} className="flex-1 flex flex-col gap-1">
            {/* Mood bar */}
            <div 
              className="w-full bg-cyan-500/50 rounded-t transition-all hover:bg-cyan-500"
              style={{ height: `${(entry.mood || 5) / maxMood * 50}%` }}
              title={`Mood: ${entry.mood}`}
            />
            {/* Energy bar */}
            <div 
              className="w-full bg-purple-500/50 rounded-b transition-all hover:bg-purple-500"
              style={{ height: `${(entry.energy || 5) / maxMood * 50}%` }}
              title={`Energy: ${entry.energy}`}
            />
          </div>
        ))}
      </div>
      
      <div className="flex justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-cyan-500 rounded" />
          <span className="text-zinc-400">Mood</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded" />
          <span className="text-zinc-400">Energy</span>
        </div>
      </div>
    </div>
  )
}

// Main Journal Page
export default function JournalPage() {
  const journal = useCASCADEStore(state => state.journal)
  
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Brain Dump & Journal</h1>
        <p className="text-zinc-500">Extract patterns, shadow material, and insights from your thoughts</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Input & Entries */}
        <div className="lg:col-span-2 space-y-6">
          <BrainDumpInput />
          
          <div>
            <h3 className="text-lg font-medium text-zinc-200 mb-4">Recent Entries</h3>
            {journal.length === 0 ? (
              <div className="cascade-card p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-zinc-300 mb-2">No entries yet</h3>
                <p className="text-sm text-zinc-500">
                  Start writing to discover patterns in your thoughts
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {journal.slice(0, 10).map((entry) => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Right column - Analytics */}
        <div className="space-y-6">
          <MoodEnergyChart />
          <PatternTracker />
        </div>
      </div>
    </div>
  )
}
