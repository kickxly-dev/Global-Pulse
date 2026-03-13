'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Send, Clock, Users, Sparkles, Check, Eye, Edit2, Download } from 'lucide-react'

interface NewsletterSection {
  id: string
  title: string
  type: 'headline' | 'summary' | 'trending' | 'curated'
  articles: { title: string; source: string }[]
}

export default function NewsletterGenerator() {
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [preview, setPreview] = useState(false)
  const [sections, setSections] = useState<NewsletterSection[]>([])
  const [schedule, setSchedule] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [recipients, setRecipients] = useState('')

  const generateNewsletter = () => {
    setGenerating(true)
    
    setTimeout(() => {
      const mockSections: NewsletterSection[] = [
        {
          id: '1',
          title: 'Top Headlines',
          type: 'headline',
          articles: [
            { title: 'AI Breakthrough: New Model Achieves Human-Level Understanding', source: 'MIT Tech Review' },
            { title: 'Climate Summit Reaches Historic Agreement', source: 'Reuters' }
          ]
        },
        {
          id: '2',
          title: 'Trending Now',
          type: 'trending',
          articles: [
            { title: 'Stock Market Rally Continues', source: 'Bloomberg' },
            { title: 'SpaceX Launches Starship', source: 'NASA News' }
          ]
        },
        {
          id: '3',
          title: 'Curated for You',
          type: 'curated',
          articles: [
            { title: 'The Future of Remote Work', source: 'Harvard Business' },
            { title: 'New Renewable Energy Records', source: 'Nature' }
          ]
        }
      ]
      
      setSections(mockSections)
      setGenerating(false)
      setGenerated(true)
    }, 2000)
  }

  const sendNewsletter = () => {
    // Simulate sending
    alert('Newsletter sent to ' + (recipients || 'all subscribers'))
  }

  return (
    <div className="bg-gradient-to-r from-fuchsia-500/10 to-pink-500/10 border border-fuchsia-500/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-fuchsia-400" />
          <h3 className="font-semibold">Newsletter</h3>
        </div>
        <span className="text-xs text-white/40">AI-generated</span>
      </div>

      {/* Schedule */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-3 h-3 text-fuchsia-400" />
          <span className="text-xs text-white/60">Schedule</span>
        </div>
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSchedule(s)}
              className={`flex-1 py-2 text-xs rounded-lg transition-colors ${
                schedule === s
                  ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      {!generated && (
        <button
          onClick={generateNewsletter}
          disabled={generating}
          className="w-full py-3 bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <Sparkles className="w-4 h-4 animate-pulse" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Newsletter
            </>
          )}
        </button>
      )}

      {/* Generated Newsletter */}
      <AnimatePresence>
        {generated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Preview Toggle */}
            <button
              onClick={() => setPreview(!preview)}
              className="w-full p-3 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-fuchsia-400" />
                <span className="text-sm">Preview Newsletter</span>
              </div>
              <span className="text-xs text-white/40">{sections.length} sections</span>
            </button>

            {/* Section Preview */}
            <AnimatePresence>
              {preview && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3"
                >
                  {sections.map((section) => (
                    <div key={section.id} className="p-3 bg-white/5 rounded-lg border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">{section.title}</h4>
                        <span className="px-2 py-0.5 bg-fuchsia-500/20 text-fuchsia-400 text-xs rounded">
                          {section.type}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {section.articles.map((article, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full mt-1.5" />
                            <div>
                              <p className="text-xs">{article.title}</p>
                              <p className="text-xs text-white/40">{article.source}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recipients */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-3 h-3 text-fuchsia-400" />
                <span className="text-xs text-white/60">Recipients (optional)</span>
              </div>
              <input
                type="email"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="Enter email addresses..."
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-fuchsia-500/30"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={sendNewsletter}
                className="flex-1 py-2 bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Send className="w-4 h-4" />
                Send Now
              </button>
              <button className="px-4 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            {/* Stats */}
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-fuchsia-400">1.2K</div>
                  <div className="text-xs text-white/40">Subscribers</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-fuchsia-400">45%</div>
                  <div className="text-xs text-white/40">Open Rate</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-fuchsia-400">12%</div>
                  <div className="text-xs text-white/40">Click Rate</div>
                </div>
              </div>
            </div>

            {/* Regenerate */}
            <button
              onClick={() => {
                setGenerated(false)
                setSections([])
                setPreview(false)
              }}
              className="w-full py-2 text-xs text-white/40 hover:text-white transition-colors"
            >
              Regenerate newsletter
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
