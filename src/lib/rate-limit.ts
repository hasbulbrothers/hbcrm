const requests = new Map<string, number[]>()

export function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const timestamps = requests.get(key) || []
  const valid = timestamps.filter(t => now - t < windowMs)

  if (valid.length >= maxRequests) {
    return false
  }

  valid.push(now)
  requests.set(key, valid)
  return true
}
