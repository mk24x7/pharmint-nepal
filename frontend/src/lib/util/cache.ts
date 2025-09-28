"use server"

import { revalidateTag, revalidatePath } from "next/cache"

/**
 * Production-safe cache invalidation utilities
 * Prevents cache corruption by providing structured cache management
 */

export interface CacheInvalidationOptions {
  tags?: string[]
  paths?: string[]
  reason?: string
  force?: boolean
}

/**
 * Safely invalidate cache tags with error handling
 */
export async function invalidateCacheTags(tags: string[], reason?: string) {
  if (!tags.length) return

  try {
    for (const tag of tags) {
      revalidateTag(tag)
    }
    
    if (process.env.NODE_ENV === 'development' && reason) {
      console.log(`Cache invalidated for tags [${tags.join(', ')}]: ${reason}`)
    }
  } catch (error) {
    console.error('Failed to invalidate cache tags:', error)
    // In production, don't throw - gracefully degrade
    if (process.env.NODE_ENV === 'development') {
      throw error
    }
  }
}

/**
 * Safely invalidate cache paths with error handling
 */
export async function invalidateCachePaths(paths: string[], reason?: string) {
  if (!paths.length) return

  try {
    for (const path of paths) {
      revalidatePath(path)
    }
    
    if (process.env.NODE_ENV === 'development' && reason) {
      console.log(`Cache invalidated for paths [${paths.join(', ')}]: ${reason}`)
    }
  } catch (error) {
    console.error('Failed to invalidate cache paths:', error)
    // In production, don't throw - gracefully degrade
    if (process.env.NODE_ENV === 'development') {
      throw error
    }
  }
}

/**
 * Comprehensive cache invalidation with multiple strategies
 */
export async function invalidateCache(options: CacheInvalidationOptions) {
  const { tags = [], paths = [], reason, force = false } = options

  // In development or when forced, clear everything
  if (force || process.env.NODE_ENV === 'development') {
    if (tags.length) await invalidateCacheTags(tags, reason)
    if (paths.length) await invalidateCachePaths(paths, reason)
    return
  }

  // In production, be more conservative
  try {
    // Batch invalidation to reduce overhead
    const promises = []
    
    if (tags.length) {
      promises.push(invalidateCacheTags(tags, reason))
    }
    
    if (paths.length) {
      promises.push(invalidateCachePaths(paths, reason))
    }

    await Promise.allSettled(promises)
  } catch (error) {
    console.error('Cache invalidation failed:', error)
  }
}

/**
 * Common cache invalidation patterns for the application
 */
export const CachePatterns = {
  // Customer-related cache
  customer: {
    tags: ['customers', 'customer-auth', 'cart-transfer'],
    paths: ['/account', '/checkout']
  },
  
  // Cart-related cache
  cart: {
    tags: ['cart', 'cart-items', 'shipping-methods'],
    paths: ['/cart', '/checkout']
  },
  
  // Product-related cache
  products: {
    tags: ['products', 'categories', 'search'],
    paths: ['/products', '/search', '/']
  },
  
  // Order-related cache
  orders: {
    tags: ['orders', 'payment-sessions'],
    paths: ['/account/orders', '/checkout/success']
  }
}

/**
 * Quick invalidation functions for common scenarios
 */
export async function invalidateCustomerCache(reason?: string) {
  await invalidateCache({ ...CachePatterns.customer, reason })
}

export async function invalidateCartCache(reason?: string) {
  await invalidateCache({ ...CachePatterns.cart, reason })
}

export async function invalidateProductCache(reason?: string) {
  await invalidateCache({ ...CachePatterns.products, reason })
}

export async function invalidateOrderCache(reason?: string) {
  await invalidateCache({ ...CachePatterns.orders, reason })
}