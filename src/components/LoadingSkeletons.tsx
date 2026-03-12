'use client'

import { motion } from 'framer-motion'

interface NewsCardSkeletonProps {
  count?: number
}

export function NewsCardSkeleton({ count = 3 }: NewsCardSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-gray-900/50 border border-white/5 rounded-xl p-4 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gray-800 animate-pulse" />
            <div className="flex-1">
              <div className="h-4 w-24 bg-gray-800 rounded animate-pulse" />
              <div className="h-3 w-16 bg-gray-800 rounded mt-1 animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <div className="h-6 w-3/4 bg-gray-800 rounded mb-2 animate-pulse" />
          <div className="h-6 w-1/2 bg-gray-800 rounded mb-4 animate-pulse" />

          {/* Image */}
          <div className="h-48 w-full bg-gray-800 rounded-xl mb-4 animate-pulse" />

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-800 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-800 rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-gray-800 rounded animate-pulse" />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-gray-800 rounded-lg animate-pulse" />
              <div className="h-8 w-20 bg-gray-800 rounded-lg animate-pulse" />
            </div>
            <div className="h-8 w-8 bg-gray-800 rounded-lg animate-pulse" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="relative h-96 rounded-2xl overflow-hidden bg-gray-900/50 border border-white/5">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />
      
      {/* Content overlay */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        {/* Tags */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-20 bg-gray-700 rounded-full animate-pulse" />
          <div className="h-6 w-16 bg-gray-700 rounded-full animate-pulse" />
        </div>

        {/* Title */}
        <div className="space-y-2 mb-4">
          <div className="h-8 w-3/4 bg-gray-700 rounded animate-pulse" />
          <div className="h-8 w-1/2 bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4">
          <div className="h-4 w-32 bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="h-6 w-32 bg-gray-800 rounded animate-pulse" />
      
      {/* Items */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-16 h-16 rounded-lg bg-gray-800 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-full bg-gray-800 rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-gray-800 rounded animate-pulse" />
            <div className="h-3 w-1/3 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ArticleViewSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-gray-800 rounded-full animate-pulse" />
          <div className="h-6 w-16 bg-gray-800 rounded-full animate-pulse" />
        </div>
        <div className="h-10 w-3/4 bg-gray-800 rounded animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-800 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-800 rounded animate-pulse" />
        </div>
      </div>

      {/* Hero image */}
      <div className="h-96 w-full bg-gray-800 rounded-2xl animate-pulse" />

      {/* Content */}
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i} 
            className="h-4 bg-gray-800 rounded animate-pulse"
            style={{ width: `${Math.random() * 30 + 70}%` }}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-6 border-t border-gray-800">
        <div className="h-10 w-24 bg-gray-800 rounded-lg animate-pulse" />
        <div className="h-10 w-24 bg-gray-800 rounded-lg animate-pulse" />
        <div className="h-10 w-24 bg-gray-800 rounded-lg animate-pulse" />
      </div>
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-gray-900/50 border border-white/5 rounded-xl p-4">
          <div className="h-8 w-16 bg-gray-800 rounded animate-pulse mb-2" />
          <div className="h-4 w-20 bg-gray-800 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}
