import dynamic from 'next/dynamic'

// Disable SSR for the entire page to prevent window undefined errors
const HomePageClient = dynamic(() => import('./page-client'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-cyber-darker flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyber-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-cyber-blue font-cyber">Loading Global Pulse...</p>
      </div>
    </div>
  ),
})

export default function HomePage() {
  return <HomePageClient />
}
