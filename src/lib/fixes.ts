// Fix for missing theme functionality
export function initializeTheme() {
  if (typeof window === 'undefined') return
  
  const root = document.documentElement
  
  // Set default CSS variables if not already set
  const defaultColors = {
    '--cyber-blue': '#00f0ff',
    '--cyber-purple': '#bf00ff',
    '--cyber-pink': '#ff00aa',
    '--cyber-yellow': '#ffff00',
    '--cyber-green': '#00ff88',
    '--cyber-red': '#ff0055',
    '--cyber-dark': '#0a0a0a',
    '--cyber-darker': '#050505',
  }
  
  Object.entries(defaultColors).forEach(([key, value]) => {
    if (!root.style.getPropertyValue(key)) {
      root.style.setProperty(key, value)
    }
  })
  
  // Apply saved theme
  const savedTheme = localStorage.getItem('theme') || 'cyber'
  document.body.classList.add(`theme-${savedTheme}`)
  
  // Set default background
  if (savedTheme === 'light') {
    document.body.style.backgroundColor = '#f3f4f6'
    document.body.style.color = '#111827'
  } else {
    document.body.style.backgroundColor = '#0a0a0a'
    document.body.style.color = '#f3f4f6'
  }
}

// Fix for bookmarks
export function initializeBookmarks() {
  if (typeof window === 'undefined') return
  
  if (!localStorage.getItem('bookmarkedArticles')) {
    localStorage.setItem('bookmarkedArticles', JSON.stringify([]))
  }
}

// Fix for reading settings
export function initializeReadingSettings() {
  if (typeof window === 'undefined') return
  
  if (!localStorage.getItem('readingSettings')) {
    localStorage.setItem('readingSettings', JSON.stringify({
      fontSize: 18,
      lineHeight: 1.8,
      textAlign: 'left',
      theme: 'dark',
      fontFamily: 'sans',
    }))
  }
}

// Initialize all fixes
export function initializeApp() {
  initializeTheme()
  initializeBookmarks()
  initializeReadingSettings()
}
