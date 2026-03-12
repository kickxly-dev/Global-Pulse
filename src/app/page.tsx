'use client'

import dynamic from 'next/dynamic'

// Disable SSR for the entire page to prevent window undefined errors
const HomePageClient = dynamic(() => import('./page-client'), {
  ssr: false,
})

export default function HomePage() {
  return <HomePageClient />
}
