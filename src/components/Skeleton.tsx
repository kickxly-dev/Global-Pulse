'use client'

import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular' | 'card'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const baseClasses = 'bg-gray-700'
  
  const variantClasses = {
    text: 'rounded h-4',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    card: 'rounded-lg',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  )
}

export function NewsCardSkeleton() {
  return (
    <div className="cyber-card animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton variant="text" width={80} />
          <Skeleton variant="text" width={40} />
        </div>
        <Skeleton variant="circular" width={24} height={24} />
      </div>

      {/* Title */}
      <Skeleton variant="text" className="w-full h-6 mb-2" />
      <Skeleton variant="text" className="w-3/4 h-6 mb-3" />

      {/* Image */}
      <Skeleton variant="rectangular" className="w-full h-48 mb-3" />

      {/* Description */}
      <div className="space-y-2">
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-2/3" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4">
        <Skeleton variant="text" width={100} />
        <Skeleton variant="rectangular" width={80} height={32} />
      </div>
    </div>
  )
}

export function TrendingSkeleton() {
  return (
    <div className="cyber-card animate-pulse">
      <div className="flex items-center space-x-2 mb-3">
        <Skeleton variant="circular" width={20} height={20} />
        <Skeleton variant="text" width={100} />
      </div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <Skeleton variant="text" width={24} />
            <Skeleton variant="text" className="flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function MapSkeleton() {
  return (
    <div className="cyber-card animate-pulse">
      <div className="flex items-center space-x-2 mb-3">
        <Skeleton variant="circular" width={20} height={20} />
        <Skeleton variant="text" width={80} />
      </div>
      <Skeleton variant="rectangular" className="w-full h-64 rounded-lg" />
    </div>
  )
}

export function SearchBarSkeleton() {
  return (
    <div className="cyber-card animate-pulse">
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton variant="rectangular" className="flex-1 h-12" />
        <Skeleton variant="rectangular" width={180} height={48} />
        <Skeleton variant="rectangular" width={100} height={48} />
      </div>
    </div>
  )
}

export function PulseScoreSkeleton() {
  return (
    <div className="cyber-card animate-pulse">
      <div className="flex items-center space-x-2 mb-3">
        <Skeleton variant="circular" width={20} height={20} />
        <Skeleton variant="text" width={100} />
      </div>
      <div className="flex items-center justify-center">
        <Skeleton variant="circular" width={120} height={120} />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-2/3 mx-auto" />
      </div>
    </div>
  )
}

export function CategorySkeleton() {
  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} variant="rectangular" width={100} height={40} className="rounded-full flex-shrink-0" />
      ))}
    </div>
  )
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 mx-auto mb-4 border-4 border-cyber-blue border-t-transparent rounded-full"
        />
        <p className="text-gray-400">Loading news...</p>
      </motion.div>
    </div>
  )
}
