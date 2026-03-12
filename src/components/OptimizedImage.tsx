'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  placeholder?: string
  blur?: boolean
  lazy?: boolean
  onLoad?: () => void
  onError?: () => void
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = '/placeholder.png',
  blur = true,
  lazy = true,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(!lazy)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!lazy) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [lazy])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  // Generate srcset for responsive images
  const generateSrcSet = (url: string): string | undefined => {
    if (!url || url.startsWith('data:') || url.includes('placeholder')) {
      return undefined
    }
    
    // For external URLs, try to use image optimization service
    if (url.startsWith('http')) {
      // Use Cloudinary-style transformation (or similar service)
      const widths = [320, 640, 768, 1024, 1280]
      return widths
        .map(w => `${url}?w=${w} ${w}w`)
        .join(', ')
    }
    
    return undefined
  }

  // Get optimized URL
  const getOptimizedUrl = (url: string, w?: number): string => {
    if (!url || url.startsWith('data:')) return url
    
    // For external images, you could use an image CDN
    // For now, just return the original URL
    return url
  }

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder/Blur */}
      {blur && !isLoaded && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer" />
        </div>
      )}

      {/* Actual Image */}
      {isInView && (
        <motion.img
          ref={imgRef}
          src={hasError ? placeholder : getOptimizedUrl(src, width)}
          alt={alt}
          width={width}
          height={height}
          srcSet={generateSrcSet(src)}
          sizes={`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw`}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
        />
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Utility function to preload images
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image()
          img.src = url
          img.onload = () => resolve()
          img.onerror = reject
        })
    )
  )
}

// Hook for image preloading
export function useImagePreloader(urls: string[]) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    preloadImages(urls).then(() => setLoaded(true)).catch(() => setLoaded(true))
  }, [urls])

  return loaded
}
