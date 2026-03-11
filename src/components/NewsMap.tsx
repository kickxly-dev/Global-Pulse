'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { NewsArticle } from '@/types/news'
import { formatDistanceToNow } from 'date-fns'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface NewsMapProps {
  articles: NewsArticle[]
}

function MapUpdater({ articles }: { articles: NewsArticle[] }) {
  const map = useMap()

  useEffect(() => {
    if (articles.length > 0) {
      const bounds = articles
        .filter(a => a.coordinates)
        .map(a => [a.coordinates!.lat, a.coordinates!.lng] as [number, number])
      
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 })
      }
    }
  }, [articles, map])

  return null
}

export default function NewsMap({ articles }: NewsMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-64 bg-cyber-dark rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }

  const articlesWithCoords = articles.filter(a => a.coordinates)

  // Create custom icon for markers
  const createCustomIcon = (isBreaking: boolean) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="relative">
          <div class="w-4 h-4 rounded-full ${
            isBreaking ? 'bg-cyber-red' : 'bg-cyber-blue'
          } animate-pulse shadow-lg"></div>
          <div class="absolute inset-0 w-4 h-4 rounded-full ${
            isBreaking ? 'bg-cyber-red' : 'bg-cyber-blue'
          } animate-ping opacity-75"></div>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    })
  }

  const isBreaking = (article: NewsArticle) => {
    const publishedTime = new Date(article.publishedAt).getTime()
    const now = Date.now()
    const hoursDiff = (now - publishedTime) / (1000 * 60 * 60)
    return hoursDiff < 2
  }

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border border-cyber-blue/20">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater articles={articlesWithCoords} />

        {articlesWithCoords.map((article, index) => (
          <Marker
            key={`${article.id}-${index}`}
            position={[article.coordinates!.lat, article.coordinates!.lng]}
            icon={createCustomIcon(isBreaking(article))}
          >
            <Popup className="custom-popup">
              <div className="p-2 max-w-xs">
                <h4 className="font-bold text-sm mb-1 line-clamp-2">{article.title}</h4>
                <p className="text-xs text-gray-600 mb-2">{article.source.name}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                </p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                >
                  Read more →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
