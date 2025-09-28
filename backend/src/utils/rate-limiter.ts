import { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { ICacheService } from "@medusajs/framework/types"
import { getSecureClientIP } from "./secure-ip-detection"

interface RateLimitConfig {
  windowMs: number      // Time window in milliseconds
  maxRequests: number   // Maximum requests per window
  keyGenerator?: (req: MedusaRequest) => string // Custom key generator
  message?: string      // Custom error message
  skipSuccessfulRequests?: boolean // Don't count successful requests
}

interface RateLimitRecord {
  count: number
  resetTime: number
}

export class RateLimiter {
  private config: RateLimitConfig
  
  constructor(config: RateLimitConfig) {
    this.config = {
      message: "Too many requests, please try again later.",
      keyGenerator: (req: MedusaRequest) => {
        // SECURITY FIX: Use secure IP detection to prevent spoofing
        const ip = getSecureClientIP(req)
        return `rate_limit:${req.path}:${ip}`
      },
      skipSuccessfulRequests: false,
      ...config
    }
  }

  middleware() {
    return async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
      try {
        const cacheService: ICacheService = req.scope.resolve(Modules.CACHE)
        const key = this.config.keyGenerator!(req)
        const now = Date.now()

        // Atomic operation using optimistic locking
        const result = await this.atomicRateLimit(cacheService, key, now)
        
        if (!result.allowed) {
          const retryAfter = Math.ceil((result.resetTime - now) / 1000)
          
          res.set({
            'X-RateLimit-Limit': this.config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
            'Retry-After': retryAfter.toString()
          })

          return res.status(429).json({
            error: "Too Many Requests",
            message: this.config.message,
            retryAfter
          })
        }

        // Set success headers
        res.set({
          'X-RateLimit-Limit': this.config.maxRequests.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
        })

        // Handle successful requests with atomic decrement
        if (this.config.skipSuccessfulRequests) {
          const originalSend = res.json.bind(res)
          res.json = (body: any) => {
            // If response is successful, atomically decrement counter
            if (res.statusCode < 400) {
              this.atomicDecrement(cacheService, key, result.resetTime).catch(console.error)
            }
            return originalSend(body)
          }
        }

        next()
      } catch (error) {
        console.error('Rate limiter error:', error)
        // SECURITY FIX: Fail secure - block request on cache errors
        return res.status(503).json({
          error: "Service Temporarily Unavailable",
          message: "Rate limiting service unavailable. Please try again later."
        })
      }
    }
  }

  private async atomicRateLimit(cacheService: ICacheService, key: string, now: number): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
  }> {
    const maxRetries = 3
    let retries = 0

    while (retries < maxRetries) {
      try {
        // Get current record
        const recordData = await cacheService.get(key)
        let record: RateLimitRecord

        if (recordData && typeof recordData === 'object' && 'count' in recordData) {
          record = recordData as RateLimitRecord
          
          // Reset if window has expired
          if (record.resetTime <= now) {
            record = { count: 0, resetTime: now + this.config.windowMs }
          }
        } else {
          record = { count: 0, resetTime: now + this.config.windowMs }
        }

        // Check if limit exceeded
        if (record.count >= this.config.maxRequests) {
          return {
            allowed: false,
            remaining: 0,
            resetTime: record.resetTime
          }
        }

        // Increment counter with optimistic locking
        const newRecord = { ...record, count: record.count + 1 }
        const ttl = Math.ceil((record.resetTime - now) / 1000)
        
        // Try to atomically update the record
        const success = await this.compareAndSwap(cacheService, key, record, newRecord, ttl)
        
        if (success) {
          return {
            allowed: true,
            remaining: Math.max(0, this.config.maxRequests - newRecord.count),
            resetTime: newRecord.resetTime
          }
        }

        // Retry if CAS failed (another request modified the record)
        retries++
        await new Promise(resolve => setTimeout(resolve, Math.random() * 10)) // Random backoff
      } catch (error) {
        throw error // Re-throw to trigger fail-secure behavior
      }
    }

    // If we've exhausted retries, fail secure
    throw new Error('Failed to acquire rate limit lock after retries')
  }

  private async compareAndSwap(
    cacheService: ICacheService, 
    key: string, 
    expected: RateLimitRecord, 
    newValue: RateLimitRecord, 
    ttl: number
  ): Promise<boolean> {
    // Simple implementation - check current value and update if unchanged
    // In production with Redis, this would use WATCH/MULTI/EXEC or Lua script
    const currentData = await cacheService.get(key)
    
    // Check if current value matches expected
    if (currentData && typeof currentData === 'object' && 'count' in currentData) {
      const current = currentData as RateLimitRecord
      if (current.count !== expected.count || current.resetTime !== expected.resetTime) {
        return false // Value changed, CAS failed
      }
    } else if (expected.count !== 0) {
      return false // Expected non-zero but got null/undefined
    }

    // Value matches expected, update it
    await cacheService.set(key, newValue, ttl)
    return true
  }

  private async atomicDecrement(cacheService: ICacheService, key: string, resetTime: number) {
    const maxRetries = 3
    let retries = 0

    while (retries < maxRetries) {
      try {
        const recordData = await cacheService.get(key)
        if (recordData && typeof recordData === 'object' && 'count' in recordData) {
          const record = recordData as RateLimitRecord
          if (record.count > 0 && record.resetTime === resetTime) {
            const newRecord = { ...record, count: record.count - 1 }
            const ttl = Math.ceil((resetTime - Date.now()) / 1000)
            
            const success = await this.compareAndSwap(cacheService, key, record, newRecord, ttl)
            if (success) {
              return // Successfully decremented
            }
          }
        }
        retries++
        await new Promise(resolve => setTimeout(resolve, Math.random() * 10)) // Random backoff
      } catch (error) {
        console.error('Error in atomic decrement:', error)
        return // Give up on error
      }
    }
  }
}

// Pre-configured rate limiters for common use cases
export const reviewSubmissionLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 review submissions per 15 minutes
  keyGenerator: (req: any) => {
    const customerId = req.auth_context?.actor_id
    // SECURITY FIX: Use secure IP detection to prevent spoofing
    const ip = getSecureClientIP(req)
    return `rate_limit:review_submission:${customerId || ip}`
  },
  message: "Too many review submissions. You can submit up to 5 reviews per 15 minutes.",
  skipSuccessfulRequests: true // Don't count failed submissions
})

export const reviewReadLimiter = new RateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute  
  maxRequests: 60, // 60 requests per minute for reading reviews
  message: "Too many requests. Please wait a moment before trying again."
})

export const generalApiLimiter = new RateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute for general API endpoints
  message: "Too many requests. Please wait a moment before trying again."
})