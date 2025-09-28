# Rate Limiting System

## Overview

The product review system includes comprehensive rate limiting to prevent spam and DoS attacks. The rate limiter uses Medusa's built-in cache service with advanced security features including atomic operations, secure IP detection, and fail-secure error handling.

## Security Features

- **Atomic Counter Operations**: Prevents race conditions using optimistic locking with retry logic
- **Secure IP Detection**: Validates proxy headers against trusted sources to prevent IP spoofing
- **Fail-Secure Design**: Blocks requests when cache service is unavailable (503 response)
- **Trusted Proxy Validation**: Only accepts forwarded headers from configured trusted proxies

## Rate Limits

### Store API Endpoints

| Endpoint | Limit | Window | Description |
|----------|--------|--------|-------------|
| `POST /store/reviews` | 5 requests | 15 minutes | Review submissions per customer |
| `POST /store/products/:id/reviews` | 5 requests | 15 minutes | Review submissions per customer |
| `GET /store/reviews` | 60 requests | 1 minute | Reading reviews per IP |
| `GET /store/products/:id/reviews` | 60 requests | 1 minute | Reading product reviews per IP |

### Admin API Endpoints

| Endpoint | Limit | Window | Description |
|----------|--------|--------|-------------|
| `GET/POST /admin/reviews/*` | 100 requests | 1 minute | General admin operations per IP |

## Features

### Smart Rate Limiting
- **Customer-based limiting**: Review submissions are limited per authenticated customer, not just IP
- **IP-based fallback**: If customer is not authenticated, falls back to IP-based limiting
- **Separate limits**: Different limits for read vs. write operations
- **Skip failed requests**: Failed review submissions don't count against the limit

### Security Headers
All responses include rate limit headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 2025-09-05T15:30:00.000Z
Retry-After: 15
```

### Error Responses
When rate limited, clients receive:
```json
{
  "error": "Too Many Requests",
  "message": "Too many review submissions. You can submit up to 5 reviews per 15 minutes.",
  "retryAfter": 900
}
```

## Implementation Details

### Cache Storage
- Uses Medusa's built-in `CACHE` module (in-memory by default)
- Keys format: `rate_limit:{endpoint}:{identifier}`
- TTL matches the rate limit window

### Key Generation
```typescript
// Review submissions (customer-based)
"rate_limit:review_submission:{customerId}"

// Review reads (IP-based)  
"rate_limit:/store/reviews:{ip_address}"

// Admin operations (IP-based)
"rate_limit:/admin/reviews:{ip_address}"
```

### Configuration

Rate limits are configured in `src/utils/rate-limiter.ts`:

```typescript
// Review submission rate limiter
export const reviewSubmissionLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 submissions per window
  keyGenerator: (req: any) => {
    const customerId = req.auth_context?.actor_id
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown'
    return `rate_limit:review_submission:${customerId || ip}`
  },
  message: "Too many review submissions. You can submit up to 5 reviews per 15 minutes.",
  skipSuccessfulRequests: true // Don't count failed submissions
})
```

## Testing

Run the rate limit test:
```bash
npx ts-node src/scripts/test-rate-limit.ts
```

Expected output:
```
✅ Successful requests: 60
🚫 Rate limited requests: 5
🎉 ✅ Rate limiting is WORKING!
```

## Production Considerations

### Redis for Production
For production environments with multiple server instances, consider using Redis:

```typescript
// In medusa-config.ts
modules: {
  [Modules.CACHE]: {
    resolve: "@medusajs/medusa/cache-redis",
    options: {
      redisUrl: process.env.REDIS_URL,
      ttl: 3600, // 1 hour default TTL
    }
  }
}
```

### Monitoring
- Rate limit headers allow clients to implement smart retry logic
- Monitor 429 responses in your logs for abuse patterns
- Consider implementing progressive penalties for repeat offenders

### Customization
Rate limits can be adjusted by modifying the configuration in `rate-limiter.ts`:
- Increase `maxRequests` for higher traffic
- Decrease `windowMs` for stricter limiting
- Add custom `keyGenerator` for advanced scenarios

## Error Handling

The rate limiter includes comprehensive error handling:
- Cache service failures don't break the request flow
- Invalid cache data is handled gracefully
- Errors are logged but don't prevent API access