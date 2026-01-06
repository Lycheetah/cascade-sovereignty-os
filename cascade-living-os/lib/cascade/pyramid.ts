// CASCADE Living OS - Knowledge Pyramid
// Self-reorganizing knowledge structure with cascade capability

import {
  KnowledgeBlock,
  PyramidLayer,
  CascadeEvent,
  KnowledgePyramidState,
  LAMAGUEExpression,
  LAMAGUESymbol
} from '@/types/cascade'

// ============================================================================
// CONSTANTS
// ============================================================================

const CASCADE_THRESHOLD = 0.85 // Π below this triggers reorganization
const FOUNDATION_THRESHOLD = 1.5 // Π >= this = foundation
const THEORY_THRESHOLD = 1.2 // 1.2 <= Π < 1.5 = theory
// Π < 1.2 = edge

// ============================================================================
// TRUTH PRESSURE (Π) CALCULATIONS
// ============================================================================

/**
 * Calculate truth pressure (compression score)
 * Π = evidence_strength × (1 + explanatory_power)
 * 
 * Where explanatory_power = supports_count / (supports_count + 1)
 */
export function calculateTruthPressure(block: KnowledgeBlock): number {
  const explanatoryPower = block.supports.length / (block.supports.length + 1)
  return block.evidenceStrength * (1 + explanatoryPower)
}

/**
 * Determine appropriate layer based on truth pressure
 */
export function determineLayer(truthPressure: number): PyramidLayer {
  if (truthPressure >= FOUNDATION_THRESHOLD) {
    return 'FOUNDATION'
  } else if (truthPressure >= THEORY_THRESHOLD) {
    return 'THEORY'
  }
  return 'EDGE'
}

/**
 * Check if a block should trigger a cascade
 */
export function shouldTriggerCascade(
  newBlock: KnowledgeBlock,
  existingFoundations: KnowledgeBlock[]
): boolean {
  const π = calculateTruthPressure(newBlock)
  
  // Must have contradictions with foundations
  const hasContradictions = newBlock.contradicts.some(id =>
    existingFoundations.some(f => f.id === id)
  )
  
  // Must have high enough truth pressure
  const hasHighPressure = π >= CASCADE_THRESHOLD
  
  return hasContradictions && hasHighPressure
}

// ============================================================================
// CASCADE OPERATIONS
// ============================================================================

/**
 * Execute a cascade reorganization
 * 
 * 1. Old foundations compress upward → become theories
 * 2. New truth expands downward → becomes foundation
 * 3. Dependent knowledge reorganizes automatically
 */
export function executeCascade(
  state: KnowledgePyramidState,
  triggerBlock: KnowledgeBlock
): { newState: KnowledgePyramidState; event: CascadeEvent } {
  const coherenceBefore = calculateCoherence(state)
  const affectedBlocks: string[] = []
  
  // Clone the state
  const newState: KnowledgePyramidState = {
    ...state,
    foundation: [...state.foundation],
    theory: [...state.theory],
    edge: [...state.edge],
    cascadeHistory: [...state.cascadeHistory],
    lastUpdated: Date.now()
  }

  // Find contradicted foundations
  const contradictedFoundations = newState.foundation.filter(f =>
    triggerBlock.contradicts.includes(f.id)
  )

  // Compress contradicted foundations upward to theory
  for (const foundation of contradictedFoundations) {
    const index = newState.foundation.findIndex(f => f.id === foundation.id)
    if (index !== -1) {
      newState.foundation.splice(index, 1)
      
      // Compress upward
      const compressedBlock: KnowledgeBlock = {
        ...foundation,
        layer: 'THEORY',
        compressionScore: foundation.compressionScore * 0.5,
        content: `[Classical] ${foundation.content}`,
        updatedAt: Date.now()
      }
      
      newState.theory.push(compressedBlock)
      affectedBlocks.push(foundation.id)
    }
  }

  // Add trigger block to foundation
  const newFoundation: KnowledgeBlock = {
    ...triggerBlock,
    layer: 'FOUNDATION',
    compressionScore: calculateTruthPressure(triggerBlock),
    updatedAt: Date.now()
  }
  newState.foundation.push(newFoundation)
  
  // Reorganize dependent blocks
  const dependentBlocks = [
    ...newState.theory.filter(b => 
      contradictedFoundations.some(f => b.dependencies.includes(f.id))
    ),
    ...newState.edge.filter(b =>
      contradictedFoundations.some(f => b.dependencies.includes(f.id))
    )
  ]

  for (const block of dependentBlocks) {
    // Update dependencies to point to new foundation
    const updatedDeps = block.dependencies.filter(
      id => !contradictedFoundations.some(f => f.id === id)
    )
    updatedDeps.push(newFoundation.id)
    
    // Recalculate and potentially demote
    const updatedBlock: KnowledgeBlock = {
      ...block,
      dependencies: updatedDeps,
      evidenceStrength: block.evidenceStrength * 0.9, // Slight reduction
      updatedAt: Date.now()
    }
    updatedBlock.compressionScore = calculateTruthPressure(updatedBlock)
    
    const newLayer = determineLayer(updatedBlock.compressionScore)
    
    // Remove from current location
    if (block.layer === 'THEORY') {
      const idx = newState.theory.findIndex(b => b.id === block.id)
      if (idx !== -1) newState.theory.splice(idx, 1)
    } else {
      const idx = newState.edge.findIndex(b => b.id === block.id)
      if (idx !== -1) newState.edge.splice(idx, 1)
    }
    
    // Add to new location
    updatedBlock.layer = newLayer
    if (newLayer === 'FOUNDATION') {
      newState.foundation.push(updatedBlock)
    } else if (newLayer === 'THEORY') {
      newState.theory.push(updatedBlock)
    } else {
      newState.edge.push(updatedBlock)
    }
    
    affectedBlocks.push(block.id)
  }

  // Calculate new coherence
  newState.coherence = calculateCoherence(newState)

  // Create cascade event
  const event: CascadeEvent = {
    id: generateId(),
    timestamp: Date.now(),
    triggerBlockId: triggerBlock.id,
    type: 'REORGANIZE',
    affectedBlocks,
    coherenceBefore,
    coherenceAfter: newState.coherence,
    lamagueSummary: generateCascadeLAMAGUE(triggerBlock)
  }

  newState.cascadeHistory.push(event)

  return { newState, event }
}

// ============================================================================
// KNOWLEDGE OPERATIONS
// ============================================================================

/**
 * Add a knowledge block to the pyramid
 */
export function addKnowledge(
  state: KnowledgePyramidState,
  block: Omit<KnowledgeBlock, 'id' | 'createdAt' | 'updatedAt' | 'active' | 'compressionScore'>
): { newState: KnowledgePyramidState; event?: CascadeEvent } {
  const now = Date.now()
  
  const newBlock: KnowledgeBlock = {
    ...block,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    active: true,
    compressionScore: 0
  }
  
  // Calculate truth pressure
  newBlock.compressionScore = calculateTruthPressure(newBlock)
  
  // Determine layer
  newBlock.layer = determineLayer(newBlock.compressionScore)
  
  // Check for cascade
  if (shouldTriggerCascade(newBlock, state.foundation)) {
    return executeCascade(state, newBlock)
  }
  
  // Simple addition without cascade
  const newState: KnowledgePyramidState = {
    ...state,
    foundation: [...state.foundation],
    theory: [...state.theory],
    edge: [...state.edge],
    lastUpdated: now
  }
  
  // Add to appropriate layer
  if (newBlock.layer === 'FOUNDATION') {
    newState.foundation.push(newBlock)
  } else if (newBlock.layer === 'THEORY') {
    newState.theory.push(newBlock)
  } else {
    newState.edge.push(newBlock)
  }
  
  // Recalculate coherence
  newState.coherence = calculateCoherence(newState)
  
  return { newState }
}

/**
 * Promote a block to a higher layer
 */
export function promoteBlock(
  state: KnowledgePyramidState,
  blockId: string,
  newEvidenceStrength: number
): KnowledgePyramidState {
  const newState = { ...state }
  
  // Find the block
  let block: KnowledgeBlock | undefined
  let sourceLayer: PyramidLayer | undefined
  
  for (const layer of ['edge', 'theory', 'foundation'] as const) {
    const idx = newState[layer].findIndex(b => b.id === blockId)
    if (idx !== -1) {
      block = { ...newState[layer][idx] }
      sourceLayer = layer.toUpperCase() as PyramidLayer
      newState[layer] = newState[layer].filter(b => b.id !== blockId)
      break
    }
  }
  
  if (!block || !sourceLayer) return state
  
  // Update evidence and recalculate
  block.evidenceStrength = newEvidenceStrength
  block.compressionScore = calculateTruthPressure(block)
  block.layer = determineLayer(block.compressionScore)
  block.updatedAt = Date.now()
  
  // Add to new layer
  if (block.layer === 'FOUNDATION') {
    newState.foundation.push(block)
  } else if (block.layer === 'THEORY') {
    newState.theory.push(block)
  } else {
    newState.edge.push(block)
  }
  
  newState.coherence = calculateCoherence(newState)
  newState.lastUpdated = Date.now()
  
  return newState
}

/**
 * Demote a block to a lower layer
 */
export function demoteBlock(
  state: KnowledgePyramidState,
  blockId: string,
  reason: string
): KnowledgePyramidState {
  const newState = { ...state }
  
  // Find and demote
  for (const layer of ['foundation', 'theory'] as const) {
    const idx = newState[layer].findIndex(b => b.id === blockId)
    if (idx !== -1) {
      const block = { ...newState[layer][idx] }
      newState[layer] = newState[layer].filter(b => b.id !== blockId)
      
      // Reduce evidence and demote
      block.evidenceStrength *= 0.7
      block.compressionScore = calculateTruthPressure(block)
      block.content = `[Demoted: ${reason}] ${block.content}`
      block.updatedAt = Date.now()
      
      if (layer === 'foundation') {
        block.layer = 'THEORY'
        newState.theory.push(block)
      } else {
        block.layer = 'EDGE'
        newState.edge.push(block)
      }
      
      break
    }
  }
  
  newState.coherence = calculateCoherence(newState)
  newState.lastUpdated = Date.now()
  
  return newState
}

// ============================================================================
// COHERENCE CALCULATION
// ============================================================================

/**
 * Calculate overall pyramid coherence
 * Based on contradiction resolution and evidence distribution
 */
export function calculateCoherence(state: KnowledgePyramidState): number {
  const allBlocks = [
    ...state.foundation,
    ...state.theory,
    ...state.edge
  ]
  
  if (allBlocks.length === 0) return 1
  
  // Check for unresolved contradictions
  let contradictionPenalty = 0
  for (const block of allBlocks) {
    for (const contradictId of block.contradicts) {
      const contradictedBlock = allBlocks.find(b => b.id === contradictId && b.active)
      if (contradictedBlock) {
        // Same layer contradictions are worse
        if (contradictedBlock.layer === block.layer) {
          contradictionPenalty += 0.2
        } else {
          contradictionPenalty += 0.1
        }
      }
    }
  }
  
  // Evidence strength distribution
  const avgEvidence = allBlocks.reduce((sum, b) => sum + b.evidenceStrength, 0) / allBlocks.length
  
  // Layer balance (foundations should be few, edge many)
  const foundationRatio = state.foundation.length / Math.max(1, allBlocks.length)
  const idealFoundationRatio = 0.1 // ~10% should be foundation
  const balancePenalty = Math.abs(foundationRatio - idealFoundationRatio)
  
  // Calculate final coherence
  const coherence = Math.max(0, Math.min(1,
    avgEvidence * (1 - contradictionPenalty * 0.5) * (1 - balancePenalty)
  ))
  
  return coherence
}

// ============================================================================
// LAMAGUE GENERATION
// ============================================================================

/**
 * Generate LAMAGUE expression for a knowledge block
 */
export function blockToLAMAGUE(block: KnowledgeBlock): LAMAGUEExpression {
  let symbols: LAMAGUESymbol[] = []
  let interpretation = ''
  
  if (block.layer === 'FOUNDATION') {
    symbols = ['Ao', 'Ψ']
    interpretation = `Foundation anchored: ${block.content.substring(0, 50)}`
  } else if (block.layer === 'THEORY') {
    symbols = ['Φ↑', 'Ψ']
    interpretation = `Theory ascending: ${block.content.substring(0, 50)}`
  } else {
    symbols = ['Φ↑', 'Z']
    interpretation = `Edge exploring: ${block.content.substring(0, 50)}`
  }
  
  return {
    symbols,
    interpretation,
    intensity: block.evidenceStrength
  }
}

/**
 * Generate LAMAGUE summary for a cascade event
 */
export function generateCascadeLAMAGUE(triggerBlock: KnowledgeBlock): string {
  return `∇cas[${triggerBlock.content.substring(0, 30)}...] → Ao ⊗ Φ↑`
}

// ============================================================================
// STATE INITIALIZATION
// ============================================================================

/**
 * Initialize a new knowledge pyramid
 */
export function initializePyramid(domain: string): KnowledgePyramidState {
  return {
    domain,
    foundation: [],
    theory: [],
    edge: [],
    cascadeHistory: [],
    coherence: 1,
    lastUpdated: Date.now()
  }
}

/**
 * Export pyramid state as JSON
 */
export function exportPyramid(state: KnowledgePyramidState): string {
  return JSON.stringify(state, null, 2)
}

/**
 * Import pyramid state from JSON
 */
export function importPyramid(json: string): KnowledgePyramidState {
  const parsed = JSON.parse(json)
  // Validate structure
  if (!parsed.domain || !Array.isArray(parsed.foundation)) {
    throw new Error('Invalid pyramid state format')
  }
  return parsed as KnowledgePyramidState
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get pyramid statistics
 */
export function getPyramidStats(state: KnowledgePyramidState) {
  const allBlocks = [...state.foundation, ...state.theory, ...state.edge]
  
  return {
    totalBlocks: allBlocks.length,
    foundationCount: state.foundation.length,
    theoryCount: state.theory.length,
    edgeCount: state.edge.length,
    avgEvidence: allBlocks.length > 0
      ? allBlocks.reduce((sum, b) => sum + b.evidenceStrength, 0) / allBlocks.length
      : 0,
    avgTruthPressure: allBlocks.length > 0
      ? allBlocks.reduce((sum, b) => sum + b.compressionScore, 0) / allBlocks.length
      : 0,
    cascadeCount: state.cascadeHistory.length,
    coherence: state.coherence,
    lastCascade: state.cascadeHistory.length > 0
      ? state.cascadeHistory[state.cascadeHistory.length - 1]
      : null
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

function generateId(): string {
  return `kb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
