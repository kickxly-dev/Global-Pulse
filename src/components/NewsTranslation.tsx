'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Languages, ChevronDown, Check, Globe, Search } from 'lucide-react'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Español' },
  { code: 'fr', name: 'French', flag: '🇫🇷', native: 'Français' },
  { code: 'de', name: 'German', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', native: '中文' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', native: '日本語' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', native: '한국어' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', native: 'العربية' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷', native: 'Português' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', native: 'Русский' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', native: 'Italiano' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱', native: 'Nederlands' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷', native: 'Türkçe' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', native: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', flag: '🇹🇭', native: 'ไทย' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱', native: 'Polski' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦', native: 'Українська' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩', native: 'Bahasa Indonesia' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪', native: 'Svenska' }
]

interface NewsTranslationProps {
  article?: {
    title: string
    content: string
  }
  onTranslate?: (language: string) => void
}

export default function NewsTranslation({ article, onTranslate }: NewsTranslationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0])
  const [translating, setTranslating] = useState(false)
  const [translatedText, setTranslatedText] = useState<{ title: string; content: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLanguages = languages.filter(lang => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.native.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleTranslate = () => {
    if (!article) return
    
    setTranslating(true)
    
    // Simulate translation
    setTimeout(() => {
      setTranslatedText({
        title: `[${selectedLanguage.native}] ${article.title}`,
        content: `[${selectedLanguage.native}] This is a simulated translation of the article content. In a real implementation, this would use a translation API like Google Translate or DeepL.`
      })
      setTranslating(false)
      onTranslate?.(selectedLanguage.code)
    }, 1500)
  }

  const selectLanguage = (lang: typeof languages[0]) => {
    setSelectedLanguage(lang)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <div className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-pink-400" />
          <h3 className="font-semibold">Translate</h3>
        </div>
        <span className="text-xs text-white/40">{languages.length} languages</span>
      </div>

      {/* Language Selector */}
      <div className="relative mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between hover:border-white/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{selectedLanguage.flag}</span>
            <div className="text-left">
              <div className="text-sm font-medium">{selectedLanguage.name}</div>
              <div className="text-xs text-white/40">{selectedLanguage.native}</div>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-black/95 border border-white/10 rounded-lg shadow-xl z-10 max-h-64 overflow-hidden"
            >
              {/* Search */}
              <div className="p-2 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search languages..."
                    className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-pink-500/30"
                  />
                </div>
              </div>

              {/* Language List */}
              <div className="overflow-y-auto max-h-48">
                {filteredLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => selectLanguage(lang)}
                    className={`w-full p-2 flex items-center gap-3 hover:bg-white/5 transition-colors ${
                      selectedLanguage.code === lang.code ? 'bg-pink-500/10' : ''
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <div className="flex-1 text-left">
                      <div className="text-sm">{lang.name}</div>
                      <div className="text-xs text-white/40">{lang.native}</div>
                    </div>
                    {selectedLanguage.code === lang.code && (
                      <Check className="w-4 h-4 text-pink-400" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Translate Button */}
      <button
        onClick={handleTranslate}
        disabled={translating || !article}
        className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
      >
        {translating ? (
          <>
            <Globe className="w-4 h-4 animate-spin" />
            Translating...
          </>
        ) : (
          <>
            <Languages className="w-4 h-4" />
            Translate to {selectedLanguage.name}
          </>
        )}
      </button>

      {/* Translated Text */}
      <AnimatePresence>
        {translatedText && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{selectedLanguage.flag}</span>
              <span className="text-xs text-pink-400">Translated to {selectedLanguage.name}</span>
            </div>
            <h4 className="text-sm font-medium mb-2">{translatedText.title}</h4>
            <p className="text-xs text-white/60">{translatedText.content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
