'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Flame, Globe, Zap, DollarSign, Heart, Gamepad2, Microscope, Tv, Utensils } from 'lucide-react'

const categoryConfig = [
  { id: 'general', name: 'Top Stories', icon: Flame, gradient: 'from-orange-500 to-red-500', color: 'text-orange-400' },
  { id: 'world', name: 'World', icon: Globe, gradient: 'from-blue-500 to-cyan-500', color: 'text-blue-400' },
  { id: 'technology', name: 'Technology', icon: Zap, gradient: 'from-purple-500 to-pink-500', color: 'text-purple-400' },
  { id: 'business', name: 'Business', icon: DollarSign, gradient: 'from-emerald-500 to-teal-500', color: 'text-emerald-400' },
  { id: 'health', name: 'Health', icon: Heart, gradient: 'from-rose-500 to-pink-500', color: 'text-rose-400' },
  { id: 'sports', name: 'Sports', icon: Gamepad2, gradient: 'from-amber-500 to-orange-500', color: 'text-amber-400' },
  { id: 'science', name: 'Science', icon: Microscope, gradient: 'from-indigo-500 to-purple-500', color: 'text-indigo-400' },
  { id: 'entertainment', name: 'Entertainment', icon: Tv, gradient: 'from-pink-500 to-rose-500', color: 'text-pink-400' },
]

interface CategoriesCarouselProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export default function CategoriesCarousel({ selectedCategory, onCategoryChange }: CategoriesCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowLeftArrow(scrollLeft > 0)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 200
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  return (
    <div className="relative">
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-gradient-to-r from-black to-transparent flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Categories Scroll Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categoryConfig.map((category) => {
          const Icon = category.icon
          const isSelected = selectedCategory === category.id
          
          return (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategoryChange(category.id)}
              className={`relative flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                isSelected
                  ? 'bg-gradient-to-r ' + category.gradient + ' text-white shadow-lg'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : category.color}`} />
              <span className="text-sm font-medium whitespace-nowrap">{category.name}</span>
              
              {isSelected && (
                <motion.div
                  layoutId="categoryGlow"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent"
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-gradient-to-l from-black to-transparent flex items-center justify-center"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      )}
    </div>
  )
}
