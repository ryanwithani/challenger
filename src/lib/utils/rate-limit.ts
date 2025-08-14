import { LRUCache } from 'lru-cache'; 

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000, // 1 minute
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const currentCount = (tokenCache.get(token) as number) || 0
        const newCount = currentCount + 1
      
        tokenCache.set(token, newCount)
      
        if (newCount > limit) {
          return reject(new Error(`Rate limit exceeded. Try again later.`))
        }
        return resolve()
      }),
  };
}