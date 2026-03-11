'use client'

import { useState } from 'react'
import { Search, Globe2 } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  onCountryChange: (country: string) => void
  currentCountry: string
}

const COUNTRIES = [
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },
  { code: 'it', name: 'Italy', flag: '🇮🇹' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵' },
  { code: 'in', name: 'India', flag: '🇮🇳' },
  { code: 'cn', name: 'China', flag: '🇨🇳' },
  { code: 'br', name: 'Brazil', flag: '🇧🇷' },
  { code: 'mx', name: 'Mexico', flag: '🇲🇽' },
  { code: 'ru', name: 'Russia', flag: '🇷🇺' },
  { code: 'za', name: 'South Africa', flag: '🇿🇦' },
  { code: 'kr', name: 'South Korea', flag: '🇰🇷' },
]

export default function SearchBar({ onSearch, onCountryChange, currentCountry }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <div className="cyber-card">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search global news..."
            className="w-full pl-10 pr-4 py-3 bg-cyber-dark border border-cyber-blue/30 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue transition-all"
          />
        </div>

        <div className="relative">
          <Globe2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
          <select
            value={currentCountry}
            onChange={(e) => onCountryChange(e.target.value)}
            className="pl-10 pr-4 py-3 bg-cyber-dark border border-cyber-blue/30 rounded-lg text-gray-100 focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue transition-all appearance-none cursor-pointer min-w-[180px]"
          >
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="cyber-button px-6 py-3 whitespace-nowrap"
        >
          Search
        </button>
      </form>
    </div>
  )
}
