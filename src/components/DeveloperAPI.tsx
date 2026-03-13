'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code, Copy, Check, Key, Zap, Clock, Globe, Book, ExternalLink } from 'lucide-react'

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
  auth: boolean
  rateLimit: string
}

export default function DeveloperAPI() {
  const [apiKey, setApiKey] = useState('gp_live_xxxxxxxxxxxxxxxxxxxx')
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null)

  const endpoints: ApiEndpoint[] = [
    { method: 'GET', path: '/api/v1/articles', description: 'Get all articles with pagination', auth: true, rateLimit: '1000/hour' },
    { method: 'GET', path: '/api/v1/articles/:id', description: 'Get single article by ID', auth: true, rateLimit: '1000/hour' },
    { method: 'GET', path: '/api/v1/trending', description: 'Get trending articles', auth: false, rateLimit: '500/hour' },
    { method: 'GET', path: '/api/v1/categories', description: 'Get all categories', auth: false, rateLimit: '500/hour' },
    { method: 'POST', path: '/api/v1/search', description: 'Search articles', auth: true, rateLimit: '300/hour' },
    { method: 'GET', path: '/api/v1/sentiment', description: 'Get sentiment analysis', auth: true, rateLimit: '200/hour' },
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-500/20 text-green-400'
      case 'POST': return 'bg-blue-500/20 text-blue-400'
      case 'PUT': return 'bg-yellow-500/20 text-yellow-400'
      case 'DELETE': return 'bg-red-500/20 text-red-400'
      default: return 'bg-white/10 text-white/60'
    }
  }

  const codeExample = `// Example API Request
const response = await fetch(
  'https://api.globalpulse.news/api/v1/articles?category=technology&limit=10',
  {
    headers: {
      'Authorization': 'Bearer ${apiKey}',
      'Content-Type': 'application/json'
    }
  }
);

const data = await response.json();
console.log(data.articles);`

  return (
    <div className="bg-gradient-to-r from-slate-500/10 to-gray-500/10 border border-slate-500/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-slate-400" />
          <h3 className="font-semibold">Developer API</h3>
        </div>
        <span className="text-xs text-white/40">REST API</span>
      </div>

      {/* API Key */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Key className="w-3 h-3 text-slate-400" />
          <span className="text-xs text-white/60">Your API Key</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 p-2 bg-white/5 border border-white/10 rounded-lg font-mono text-xs overflow-x-auto">
            {showKey ? apiKey : '••••••••••••••••••••••••'}
          </div>
          <button
            onClick={() => setShowKey(!showKey)}
            className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            {showKey ? '🙈' : '👁️'}
          </button>
          <button
            onClick={() => copyToClipboard(apiKey)}
            className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-2 bg-white/5 rounded-lg text-center">
          <Zap className="w-3 h-3 text-yellow-400 mx-auto mb-1" />
          <div className="text-sm font-bold">99.9%</div>
          <div className="text-xs text-white/40">Uptime</div>
        </div>
        <div className="p-2 bg-white/5 rounded-lg text-center">
          <Clock className="w-3 h-3 text-cyan-400 mx-auto mb-1" />
          <div className="text-sm font-bold">45ms</div>
          <div className="text-xs text-white/40">Latency</div>
        </div>
        <div className="p-2 bg-white/5 rounded-lg text-center">
          <Globe className="w-3 h-3 text-green-400 mx-auto mb-1" />
          <div className="text-sm font-bold">10K+</div>
          <div className="text-xs text-white/40">Developers</div>
        </div>
      </div>

      {/* Endpoints */}
      <div className="space-y-2 mb-4">
        <div className="text-xs text-white/40 mb-2">Available Endpoints</div>
        {endpoints.map((endpoint, i) => (
          <motion.button
            key={endpoint.path}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setSelectedEndpoint(selectedEndpoint === endpoint.path ? null : endpoint.path)}
            className={`w-full p-2 rounded-lg border transition-all text-left ${
              selectedEndpoint === endpoint.path
                ? 'bg-slate-500/20 border-slate-500/30'
                : 'bg-white/5 border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-mono ${getMethodColor(endpoint.method)}`}>
                {endpoint.method}
              </span>
              <span className="text-xs font-mono flex-1">{endpoint.path}</span>
              {endpoint.auth && <span className="text-xs text-yellow-400">🔒</span>}
            </div>
            <AnimatePresence>
              {selectedEndpoint === endpoint.path && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 pt-2 border-t border-white/10"
                >
                  <p className="text-xs text-white/60 mb-2">{endpoint.description}</p>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span>Rate limit: {endpoint.rateLimit}</span>
                    {endpoint.auth && <span>• Requires API key</span>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      {/* Code Example */}
      <div className="p-3 bg-black/50 rounded-lg border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/40">Example Request</span>
          <button
            onClick={() => copyToClipboard(codeExample)}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Copy
          </button>
        </div>
        <pre className="text-xs text-white/70 overflow-x-auto whitespace-pre-wrap">
          {codeExample}
        </pre>
      </div>

      {/* Links */}
      <div className="mt-4 flex gap-2">
        <a
          href="#"
          className="flex-1 py-2 bg-white/5 rounded-lg text-xs text-center hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
        >
          <Book className="w-3 h-3" />
          Documentation
        </a>
        <a
          href="#"
          className="flex-1 py-2 bg-white/5 rounded-lg text-xs text-center hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          API Status
        </a>
      </div>
    </div>
  )
}
