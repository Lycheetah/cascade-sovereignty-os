'use client'

import { useState } from 'react'
import { useCASCADEStore } from '@/lib/store/cascade-store'

// Export Panel
function ExportPanel() {
  const [copied, setCopied] = useState(false)
  const exportState = useCASCADEStore(state => state.exportState)
  
  const handleExport = () => {
    const json = exportState()
    navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const handleDownload = () => {
    const json = exportState()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cascade-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className="cascade-card p-6">
      <h3 className="text-lg font-medium text-zinc-200 mb-4">Export Data</h3>
      <p className="text-sm text-zinc-400 mb-4">
        Export your complete CASCADE state including knowledge pyramid, sovereignty metrics, journal entries, and settings.
      </p>
      
      <div className="flex gap-3">
        <button
          onClick={handleExport}
          className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-900 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download File
        </button>
      </div>
    </div>
  )
}

// Import Panel
function ImportPanel() {
  const [importJson, setImportJson] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const importState = useCASCADEStore(state => state.importState)
  
  const handleImport = () => {
    if (!importJson.trim()) return
    
    try {
      importState(importJson)
      setStatus('success')
      setImportJson('')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (e) {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      setImportJson(event.target?.result as string)
    }
    reader.readAsText(file)
  }
  
  return (
    <div className="cascade-card p-6">
      <h3 className="text-lg font-medium text-zinc-200 mb-4">Import Data</h3>
      <p className="text-sm text-zinc-400 mb-4">
        Restore from a previous backup. This will merge with your current state.
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Upload File</label>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="block w-full text-sm text-zinc-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-zinc-800 file:text-zinc-300
              hover:file:bg-zinc-700
              cursor-pointer"
          />
        </div>
        
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Or Paste JSON</label>
          <textarea
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            placeholder="Paste exported JSON here..."
            className="w-full h-32 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 resize-none font-mono text-xs"
          />
        </div>
        
        <button
          onClick={handleImport}
          disabled={!importJson.trim()}
          className={`w-full py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            status === 'success' ? 'bg-emerald-500 text-white' :
            status === 'error' ? 'bg-red-500 text-white' :
            'bg-purple-500 hover:bg-purple-400 text-white'
          }`}
        >
          {status === 'success' ? '✓ Imported Successfully' :
           status === 'error' ? '✗ Import Failed' :
           'Import State'}
        </button>
      </div>
    </div>
  )
}

// Reset Panel
function ResetPanel() {
  const [confirmReset, setConfirmReset] = useState(false)
  const reset = useCASCADEStore(state => state.reset)
  
  const handleReset = () => {
    if (confirmReset) {
      reset()
      setConfirmReset(false)
    } else {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 5000)
    }
  }
  
  return (
    <div className="cascade-card p-6 border border-red-500/20">
      <h3 className="text-lg font-medium text-red-400 mb-4">Danger Zone</h3>
      <p className="text-sm text-zinc-400 mb-4">
        Reset all CASCADE data to initial state. This cannot be undone unless you have a backup.
      </p>
      
      <button
        onClick={handleReset}
        className={`w-full py-2 rounded-lg transition-colors ${
          confirmReset
            ? 'bg-red-500 hover:bg-red-400 text-white'
            : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
        }`}
      >
        {confirmReset ? 'Click Again to Confirm Reset' : 'Reset All Data'}
      </button>
    </div>
  )
}

// System Info
function SystemInfo() {
  const state = useCASCADEStore(state => ({
    version: state.version,
    lastSync: state.lastSync,
    userId: state.userId,
    pyramidBlocks: state.pyramid.foundation.length + state.pyramid.theory.length + state.pyramid.edge.length,
    cascadeCount: state.pyramid.cascadeHistory.length,
    journalEntries: state.journal.length,
    practices: state.realityBridge.practices.length
  }))
  
  return (
    <div className="cascade-card p-6">
      <h3 className="text-lg font-medium text-zinc-200 mb-4">System Information</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Version</span>
          <span className="font-mono text-zinc-200">{state.version}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">User ID</span>
          <span className="font-mono text-zinc-200 text-xs">{state.userId.slice(0, 16)}...</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Last Sync</span>
          <span className="text-zinc-200">{new Date(state.lastSync).toLocaleString()}</span>
        </div>
        
        <div className="pt-3 border-t border-zinc-800">
          <h4 className="text-sm text-zinc-400 mb-2">Data Statistics</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-zinc-800/50 rounded">
              <span className="text-xs text-zinc-500">Knowledge Blocks</span>
              <p className="font-mono text-zinc-200">{state.pyramidBlocks}</p>
            </div>
            <div className="p-2 bg-zinc-800/50 rounded">
              <span className="text-xs text-zinc-500">Cascades</span>
              <p className="font-mono text-zinc-200">{state.cascadeCount}</p>
            </div>
            <div className="p-2 bg-zinc-800/50 rounded">
              <span className="text-xs text-zinc-500">Journal Entries</span>
              <p className="font-mono text-zinc-200">{state.journalEntries}</p>
            </div>
            <div className="p-2 bg-zinc-800/50 rounded">
              <span className="text-xs text-zinc-500">Practices</span>
              <p className="font-mono text-zinc-200">{state.practices}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// About CASCADE
function AboutCASCADE() {
  return (
    <div className="cascade-card p-6">
      <h3 className="text-lg font-medium text-zinc-200 mb-4">About CASCADE Living OS</h3>
      
      <div className="space-y-4 text-sm text-zinc-400">
        <p>
          CASCADE Living OS is a sovereign, self-evolving personal operating system based on the 
          CASCADE architecture. It combines:
        </p>
        
        <ul className="list-disc list-inside space-y-1">
          <li><span className="text-cyan-400">Microorcim Field Theory</span> - Mathematical agency tracking</li>
          <li><span className="text-purple-400">Knowledge Pyramids</span> - Self-reorganizing truth hierarchies</li>
          <li><span className="text-emerald-400">Reality Bridge</span> - Falsifiable prediction validation</li>
          <li><span className="text-blue-400">AURA Protocol</span> - Constitutional AI constraints</li>
        </ul>
        
        <div className="p-3 bg-zinc-800/50 rounded-lg">
          <p className="font-mono text-xs text-cyan-400">
            μ_orcim = ΔI / (ΔD + 1)
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            The fundamental unit of sovereign agency
          </p>
        </div>
        
        <p className="text-xs text-zinc-500">
          Built on the CASCADE Architecture v8.0 (January 2026) by Mackenzie Clark.
          This interface created in partnership between human and AI sovereignty.
        </p>
      </div>
    </div>
  )
}

// AURA Protocol Status
function AURAStatus() {
  const aura = useCASCADEStore(state => state.aura)
  const updateAURA = useCASCADEStore(state => state.updateAURA)
  
  return (
    <div className="cascade-card p-6">
      <h3 className="text-lg font-medium text-zinc-200 mb-4">AURA Protocol Status</h3>
      
      <div className="space-y-4">
        {/* TES */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-zinc-400">TES (Trust Entropy Score)</span>
            <span className={`font-mono ${aura.TES >= 0.7 ? 'text-emerald-400' : 'text-red-400'}`}>
              {aura.TES.toFixed(2)} {aura.TES >= 0.7 ? '✓' : '✗'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={aura.TES}
            onChange={(e) => updateAURA({ TES: parseFloat(e.target.value) })}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <p className="text-xs text-zinc-500 mt-1">Threshold: ≥0.70</p>
        </div>
        
        {/* VTR */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-zinc-400">VTR (Value Transfer Ratio)</span>
            <span className={`font-mono ${aura.VTR >= 1.0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {aura.VTR.toFixed(2)} {aura.VTR >= 1.0 ? '✓' : '✗'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            value={aura.VTR}
            onChange={(e) => updateAURA({ VTR: parseFloat(e.target.value) })}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <p className="text-xs text-zinc-500 mt-1">Threshold: ≥1.0</p>
        </div>
        
        {/* PAI */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-zinc-400">PAI (Purpose Alignment Index)</span>
            <span className={`font-mono ${aura.PAI >= 0.8 ? 'text-emerald-400' : 'text-red-400'}`}>
              {aura.PAI.toFixed(2)} {aura.PAI >= 0.8 ? '✓' : '✗'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={aura.PAI}
            onChange={(e) => updateAURA({ PAI: parseFloat(e.target.value) })}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <p className="text-xs text-zinc-500 mt-1">Threshold: ≥0.80</p>
        </div>
        
        {/* Status */}
        <div className={`p-3 rounded-lg ${aura.valid ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${aura.valid ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className={aura.valid ? 'text-emerald-400' : 'text-red-400'}>
              {aura.valid ? 'AURA Protocol: Valid' : 'AURA Protocol: Constraints Violated'}
            </span>
          </div>
          {aura.warnings.length > 0 && (
            <ul className="mt-2 text-xs text-red-400 space-y-1">
              {aura.warnings.map((w, i) => (
                <li key={i}>• {w}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

// Main Settings Page
export default function SettingsPage() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Settings</h1>
        <p className="text-zinc-500">Configure your CASCADE Living OS</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExportPanel />
        <ImportPanel />
        <AURAStatus />
        <SystemInfo />
        <AboutCASCADE />
        <ResetPanel />
      </div>
    </div>
  )
}
