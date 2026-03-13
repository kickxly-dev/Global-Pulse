const CACHE_NAME = 'global-pulse-v2'
const STATIC_CACHE = 'gp-static-v2'
const DYNAMIC_CACHE = 'gp-dynamic-v2'

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

const API_PATTERNS = [
  /\/api\/articles/,
  /\/api\/news/,
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
      caches.open(DYNAMIC_CACHE),
    ])
  )
  self.skipWaiting()
})

// Fetch event - network first for API, cache first for static
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // API requests - network first, fallback to cache
  if (API_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
          return response
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            return new Response(JSON.stringify({ 
              offline: true, 
              articles: [],
              message: 'You are offline.' 
            }), {
              headers: { 'Content-Type': 'application/json' }
            })
          })
        })
    )
    return
  }

  // Static assets - cache first
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        return fetch(request).then((response) => {
          if (!response || response.status !== 200) {
            return response
          }
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
          return response
        })
      })
    )
  }
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  const validCaches = [STATIC_CACHE, DYNAMIC_CACHE]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !validCaches.includes(name))
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  
  const options = {
    body: data.body || 'New breaking news available',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    tag: data.tag || 'news-update',
    renotify: true,
    requireInteraction: data.important || false,
    data: {
      url: data.url || '/',
      id: data.id,
    },
    actions: [
      { action: 'open', title: 'Read Now' },
      { action: 'close', title: 'Dismiss' },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Global Pulse', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'close') return

  const urlToOpen = event.notification.data.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-news') {
    event.waitUntil(syncNews())
  }
})

async function syncNews() {
  try {
    const response = await fetch('/api/articles?category=general&country=us&limit=20')
    const data = await response.json()
    
    const cache = await caches.open(DYNAMIC_CACHE)
    await cache.put(
      new Request('/api/articles?category=general'),
      new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
    )
    console.log('Background sync completed')
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}
