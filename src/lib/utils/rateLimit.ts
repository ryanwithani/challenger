import { LRUCache } from 'lru-cache'

type Options = {
  uniqueTokenPerInterval?: number
  interval?: number
}

export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  })

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        // Handle unknown/missing tokens by creating a fallback
        const safeToken = token === 'unknown' ? `fallback-${Date.now()}` : token

        const tokenCount = (tokenCache.get(safeToken) as number) || 0
        const newCount = tokenCount + 1

        tokenCache.set(safeToken, newCount)

        if (newCount > limit) {
          const resetTime = Math.round((options?.interval || 60000) / 1000)
          reject(new Error(`Rate limit exceeded. Try again in ${resetTime} seconds.`))
        } else {
          resolve()
        }
      }),
  }
}