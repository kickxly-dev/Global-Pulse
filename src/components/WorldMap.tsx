'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, TrendingUp, AlertCircle, Globe } from 'lucide-react'

interface NewsLocation {
  id: string
  title: string
  lat: number
  lng: number
  category: string
  sentiment: string
  isBreaking: boolean
  viewCount: number
}

export default function WorldMap() {
  const [locations, setLocations] = useState<NewsLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<NewsLocation | null>(null)
  const [hoveredLocation, setHoveredLocation] = useState<NewsLocation | null>(null)

  // Simulated news locations (in production, would come from API with geocoding)
  useEffect(() => {
    const mockLocations: NewsLocation[] = [
      { id: '1', title: 'Tech Summit in San Francisco', lat: 37.7749, lng: -122.4194, category: 'technology', sentiment: 'positive', isBreaking: false, viewCount: 1250 },
      { id: '2', title: 'Economic Crisis in Europe', lat: 48.8566, lng: 2.3522, category: 'business', sentiment: 'negative', isBreaking: true, viewCount: 5420 },
      { id: '3', title: 'Peace Talks in Middle East', lat: 31.7683, lng: 35.2137, category: 'general', sentiment: 'neutral', isBreaking: true, viewCount: 8930 },
      { id: '4', title: 'Climate Summit Tokyo', lat: 35.6762, lng: 139.6503, category: 'science', sentiment: 'positive', isBreaking: false, viewCount: 2100 },
      { id: '5', title: 'Sports Championship Brazil', lat: -23.5505, lng: -46.6333, category: 'sports', sentiment: 'positive', isBreaking: false, viewCount: 3200 },
      { id: '6', title: 'Healthcare Breakthrough London', lat: 51.5074, lng: -0.1278, category: 'health', sentiment: 'positive', isBreaking: true, viewCount: 6700 },
      { id: '7', title: 'Political Unrest Hong Kong', lat: 22.3193, lng: 114.1694, category: 'general', sentiment: 'negative', isBreaking: true, viewCount: 9800 },
      { id: '8', title: 'Trade Deal Australia', lat: -33.8688, lng: 151.2093, category: 'business', sentiment: 'positive', isBreaking: false, viewCount: 1800 },
      { id: '9', title: 'Film Festival Cannes', lat: 43.5528, lng: 7.0174, category: 'entertainment', sentiment: 'positive', isBreaking: false, viewCount: 4500 },
      { id: '10', title: 'Volcanic Eruption Iceland', lat: 64.1466, lng: -21.9426, category: 'science', sentiment: 'negative', isBreaking: true, viewCount: 7200 },
    ]
    setLocations(mockLocations)
  }, [])

  const getMarkerColor = (loc: NewsLocation) => {
    if (loc.isBreaking) return 'bg-red-500'
    if (loc.sentiment === 'positive') return 'bg-emerald-500'
    if (loc.sentiment === 'negative') return 'bg-amber-500'
    return 'bg-blue-500'
  }

  const getMarkerSize = (loc: NewsLocation) => {
    if (loc.isBreaking) return 'w-4 h-4'
    if (loc.viewCount > 5000) return 'w-3.5 h-3.5'
    return 'w-3 h-3'
  }

  // Convert lat/lng to SVG coordinates (simple equirectangular projection)
  const toSvgCoords = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 100
    const y = ((90 - lat) / 180) * 100
    return { x, y }
  }

  return (
    <div className="relative w-full h-[500px] bg-gradient-to-b from-slate-900 to-black rounded-2xl overflow-hidden border border-white/10">
      {/* Header */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <Globe className="w-5 h-5 text-cyan-400" />
        <span className="font-semibold">Global News Map</span>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-white/60">Breaking</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-white/60">Positive</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-white/60">Negative</span>
        </div>
      </div>

      {/* World Map SVG */}
      <svg viewBox="0 0 100 50" className="w-full h-full opacity-30">
        {/* Simplified world continents */}
        <path
          d="M15,15 Q20,12 25,15 L30,12 Q35,14 40,12 L45,15 Q50,13 55,16 L60,14 Q65,15 70,13 L75,16 Q80,14 85,15 L90,12 Q95,15 95,20 L92,25 Q90,30 85,28 L80,32 Q75,30 70,33 L65,30 Q60,32 55,30 L50,33 Q45,31 40,34 L35,30 Q30,33 25,30 L20,34 Q15,32 12,28 L10,22 Q12,18 15,15"
          fill="white"
          fillOpacity="0.1"
          stroke="white"
          strokeOpacity="0.2"
          strokeWidth="0.2"
        />
        <path
          d="M45,35 Q50,33 55,36 L60,34 Q65,36 70,34 L75,37 Q80,35 85,38 L88,42 Q85,45 80,43 L75,46 Q70,44 65,47 L60,44 Q55,46 50,44 L45,47 Q40,45 42,40 L45,35"
          fill="white"
          fillOpacity="0.1"
          stroke="white"
          strokeOpacity="0.2"
          strokeWidth="0.2"
        />
        <path
          d="M20,20 Q25,18 30,22 L35,20 Q40,23 45,21 L50,25 Q55,23 60,26 L65,24 Q70,27 75,25 L80,28 Q85,26 88,30 L85,35 Q80,33 75,36 L70,34 Q65,37 60,35 L55,38 Q50,36 45,39 L40,37 Q35,40 30,38 L25,41 Q20,39 18,34 L20,20"
          fill="white"
          fillOpacity="0.1"
          stroke="white"
          strokeOpacity="0.2"
          strokeWidth="0.2"
        />
      </svg>

      {/* News Markers */}
      {locations.map((loc) => {
        const { x, y } = toSvgCoords(loc.lat, loc.lng)
        return (
          <motion.button
            key={loc.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: Math.random() * 0.5 }}
            style={{ left: `${x}%`, top: `${y}%` }}
            onMouseEnter={() => setHoveredLocation(loc)}
            onMouseLeave={() => setHoveredLocation(null)}
            onClick={() => setSelectedLocation(loc)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${getMarkerColor(loc)} ${getMarkerSize(loc)} rounded-full cursor-pointer hover:scale-150 transition-transform`}
          >
            {loc.isBreaking && (
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
            )}
          </motion.button>
        )
      })}

      {/* Hover Tooltip */}
      {hoveredLocation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            left: `${toSvgCoords(hoveredLocation.lat, hoveredLocation.lng).x}%`,
            top: `${toSvgCoords(hoveredLocation.lat, hoveredLocation.lng).y - 10}%`
          }}
          className="absolute transform -translate-x-1/2 bg-black/90 border border-white/20 rounded-lg p-3 pointer-events-none z-20 min-w-[200px]"
        >
          <div className="flex items-start gap-2">
            {hoveredLocation.isBreaking && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
            <div>
              <p className="text-sm font-medium line-clamp-2">{hoveredLocation.title}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                <span className="capitalize">{hoveredLocation.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {hoveredLocation.viewCount.toLocaleString()} views
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Selected Location Panel */}
      {selectedLocation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 bg-black/90 border border-white/20 rounded-xl p-4 z-20"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-white/40">
                  {selectedLocation.lat.toFixed(2)}°, {selectedLocation.lng.toFixed(2)}°
                </span>
              </div>
              <h3 className="font-semibold text-lg">{selectedLocation.title}</h3>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  selectedLocation.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                  selectedLocation.sentiment === 'negative' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {selectedLocation.sentiment}
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-white/10 capitalize">
                  {selectedLocation.category}
                </span>
                {selectedLocation.isBreaking && (
                  <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400 animate-pulse">
                    Breaking
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedLocation(null)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
