'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, Archive, X, Clock } from 'lucide-react'

interface ArchiveArticle {
  id: string
  title: string
  source: string
  date: string
  category: string
}

export default function NewsArchive() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const generateDays = () => {
    const days = []
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const handleDateSelect = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    setSelectedDate(date)
    setShowDatePicker(false)
  }

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1))
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && 
           currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear()
  }

  const isSelected = (day: number) => {
    return day === selectedDate.getDate() &&
           currentMonth.getMonth() === selectedDate.getMonth() &&
           currentMonth.getFullYear() === selectedDate.getFullYear()
  }

  // Mock archived articles
  const archivedArticles: ArchiveArticle[] = [
    { id: '1', title: 'Historic Climate Agreement Signed', source: 'Reuters', date: selectedDate.toDateString(), category: 'World' },
    { id: '2', title: 'Tech Stock Rally Continues', source: 'Bloomberg', date: selectedDate.toDateString(), category: 'Business' },
    { id: '3', title: 'New Medical Breakthrough', source: 'Nature', date: selectedDate.toDateString(), category: 'Health' },
  ]

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Archive className="w-4 h-4 text-purple-400" />
          <h3 className="font-semibold">News Archive</h3>
        </div>
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </button>
      </div>

      {/* Date Picker */}
      <AnimatePresence>
        {showDatePicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="bg-black/30 rounded-xl p-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => navigateMonth(-1)} className="p-1 hover:bg-white/10 rounded transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-medium">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                <button onClick={() => navigateMonth(1)} className="p-1 hover:bg-white/10 rounded transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-xs text-white/40 py-1">{day}</div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {generateDays().map((day, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: day ? 1.1 : 1 }}
                    whileTap={{ scale: day ? 0.95 : 1 }}
                    disabled={!day}
                    onClick={() => day && handleDateSelect(day)}
                    className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-colors ${
                      !day ? '' :
                      isSelected(day) ? 'bg-purple-500 text-white' :
                      isToday(day) ? 'bg-purple-500/20 text-purple-400' :
                      'hover:bg-white/10'
                    }`}
                  >
                    {day}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Archived Articles */}
      <div className="space-y-2">
        <p className="text-xs text-white/40 mb-3 flex items-center gap-2">
          <Clock className="w-3 h-3" />
          Articles from {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        {archivedArticles.map((article) => (
          <button
            key={article.id}
            className="w-full p-3 bg-white/[0.02] rounded-lg border border-white/5 hover:border-white/10 transition-colors text-left group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-purple-400">{article.category}</span>
              <span className="text-xs text-white/30">•</span>
              <span className="text-xs text-white/40">{article.source}</span>
            </div>
            <h4 className="text-sm font-medium group-hover:text-white transition-colors line-clamp-1">
              {article.title}
            </h4>
          </button>
        ))}
      </div>
    </div>
  )
}
