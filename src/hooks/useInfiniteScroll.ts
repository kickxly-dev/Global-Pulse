import { useState, useEffect, useCallback, useRef } from 'react'

interface UseInfiniteScrollOptions<T> {
  items: T[]
  pageSize?: number
}

export function useInfiniteScroll<T>({ 
  items, 
  pageSize = 10 
}: UseInfiniteScrollOptions<T>) {
  const [displayedItems, setDisplayedItems] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Reset when items change
    const initialItems = items.slice(0, pageSize)
    setDisplayedItems(initialItems)
    setPage(1)
    setHasMore(items.length > pageSize)
  }, [items, pageSize])

  const loadMore = useCallback(() => {
    if (!hasMore) return

    const nextPage = page + 1
    const startIndex = page * pageSize
    const endIndex = startIndex + pageSize
    const newItems = items.slice(startIndex, endIndex)

    if (newItems.length > 0) {
      setDisplayedItems(prev => [...prev, ...newItems])
      setPage(nextPage)
      setHasMore(endIndex < items.length)
    } else {
      setHasMore(false)
    }
  }, [page, pageSize, items, hasMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [loadMore, hasMore])

  return {
    displayedItems,
    hasMore,
    loaderRef,
    loadMore,
  }
}
