import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'

interface VoiceControlOptions {
  onCommand: (command: string) => void
  onSearch: (query: string) => void
  onNavigate: (direction: 'next' | 'prev') => void
  onReadArticle: (index: number) => void
}

export function useVoiceControl(options: VoiceControlOptions) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    // Check if browser supports speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'
        
        recognition.onresult = (event: any) => {
          const last = event.results.length - 1
          const transcript = event.results[last][0].transcript.toLowerCase()
          
          if (event.results[last].isFinal) {
            handleVoiceCommand(transcript)
          }
        }
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }
        
        recognition.onend = () => {
          setIsListening(false)
        }
        
        recognitionRef.current = recognition
        setVoiceEnabled(true)
      }
    }
  }, [])

  const handleVoiceCommand = useCallback((transcript: string) => {
    console.log('Voice command:', transcript)
    
    // Navigation commands
    if (transcript.includes('next') || transcript.includes('forward')) {
      options.onNavigate('next')
      speak('Moving to next category')
    } else if (transcript.includes('previous') || transcript.includes('back')) {
      options.onNavigate('prev')
      speak('Moving to previous category')
    }
    // Search commands
    else if (transcript.includes('search for') || transcript.includes('find')) {
      const query = transcript.replace(/search for|find/g, '').trim()
      if (query) {
        options.onSearch(query)
        speak(`Searching for ${query}`)
      }
    }
    // Read commands
    else if (transcript.includes('read')) {
      if (transcript.includes('first')) {
        options.onReadArticle(0)
      } else if (transcript.includes('second')) {
        options.onReadArticle(1)
      } else if (transcript.includes('third')) {
        options.onReadArticle(2)
      } else {
        const match = transcript.match(/read (?:article|story|news)?\s*(\d+)/)
        if (match) {
          const index = parseInt(match[1]) - 1
          options.onReadArticle(index)
        }
      }
    }
    // Control commands
    else if (transcript.includes('stop') || transcript.includes('pause')) {
      stopSpeaking()
    } else if (transcript.includes('refresh') || transcript.includes('update')) {
      options.onCommand('refresh')
      speak('Refreshing news')
    } else if (transcript.includes('help')) {
      showVoiceHelp()
    }
    // Special commands
    else if (transcript.includes('hey pulse') || transcript.includes('okay pulse')) {
      speak('Yes, I\'m listening')
    }
  }, [options])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
        setIsListening(true)
        toast.success('Voice control activated 🎤')
      } catch (err) {
        console.error('Failed to start recognition:', err)
      }
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      toast.info('Voice control deactivated')
    }
  }, [isListening])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  const speak = useCallback((text: string, options?: {
    rate?: number
    pitch?: number
    voice?: string
  }) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = options?.rate || 1
      utterance.pitch = options?.pitch || 1
      utterance.volume = 0.8
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      
      synthRef.current = utterance
      window.speechSynthesis.speak(utterance)
    }
  }, [])

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [])

  const readArticle = useCallback((article: {
    title: string
    description?: string
    source?: { name: string }
  }) => {
    const text = `${article.source?.name || 'News'}: ${article.title}. ${article.description || ''}`
    speak(text, { rate: 0.9 })
  }, [speak])

  const showVoiceHelp = () => {
    const helpText = `
      Voice commands available:
      Say "next" or "previous" to navigate categories.
      Say "search for" followed by keywords.
      Say "read first", "read second", or "read article 1".
      Say "refresh" to update news.
      Say "stop" to stop speaking.
      Say "help" for this message.
    `
    speak(helpText)
    toast.message('🎤 Voice Commands', { description: helpText, duration: 10000 })
  }

  return {
    isListening,
    isSpeaking,
    voiceEnabled,
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
    readArticle,
    showVoiceHelp
  }
}
