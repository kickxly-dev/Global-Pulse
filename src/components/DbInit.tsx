'use client'

import { useEffect } from 'react'

export default function DbInit() {
  useEffect(() => {
    // Initialize database on app start
    const initDb = async () => {
      try {
        console.log('Initializing database...')
        const response = await fetch('/api/init-db')
        const result = await response.json()
        
        if (result.success) {
          console.log('✓ Database initialized:', result.message)
        } else {
          console.error('Database initialization failed:', result.error)
        }
      } catch (error) {
        console.error('Failed to initialize database:', error)
      }
    }

    initDb()
  }, [])

  // This component doesn't render anything
  return null
}
