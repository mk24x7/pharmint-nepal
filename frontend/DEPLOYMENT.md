# Production Deployment Guide

## Cache Management for Production

### Overview
This application now includes comprehensive cache management to prevent the Next.js cache corruption issues that occurred during development. The following systems ensure stable production deployments.

### Cache Architecture

#### 1. Custom Cache Handler (`cache-handler.js`)
- **LRU Cache**: Fast in-memory caching for frequently accessed data
- **File-based Persistence**: Disk-based cache for production stability
- **Automatic Expiration**: Respects revalidation times and expires stale data
- **Error Handling**: Graceful degradation when cache operations fail

#### 2. Production Configuration (`next.config.js`)
```javascript
// Development: Disable problematic caches
experimental: {
  isrMemoryCacheSize: 0, // Prevents ISR memory cache corruption
}

// Production: Use stable cache handler
cacheHandler: './cache-handler.js',
cacheMaxMemorySize: 50 * 1024 * 1024, // 50MB limit
```

#### 3. Environment-specific Settings (`.env.production`)
- `NEXT_CACHE_HANDLER_PATH`: Custom cache handler path
- `NEXT_CACHE_MAX_MEMORY_SIZE`: Memory limit for cache
- `NODE_ENV=production`: Ensures production optimizations

### Cache Management Scripts

#### Available Commands
```bash
# Clear all caches
npm run clear-cache

# Clear only Next.js build cache
npm run clear-cache:build

# Clear only application cache
npm run clear-cache:app

# Production build with cache clearing
npm run build:production
```

#### Manual Cache Clearing
```bash
# Clear Next.js build cache
rm -rf .next

# Clear application cache
rm -rf .cache

# Clear both (emergency reset)
rm -rf .next .cache
```

### Production Deployment Steps

#### 1. Pre-deployment Cache Clear
```bash
# Ensure clean slate
npm run clear-cache
```

#### 2. Build with Production Settings
```bash
# Use production build command
npm run build:production
# or
NODE_ENV=production npm run build
```

#### 3. Verify Build Integrity
Check for these files after build:
- `.next/build-manifest.json` - Build manifest exists
- `.next/static/` - Static assets generated
- `.next/server/` - Server components compiled

#### 4. Start Production Server
```bash
NODE_ENV=production npm start
```

### Cache Invalidation Strategies

#### Programmatic Cache Management
Use the cache utility functions in `src/lib/util/cache.ts`:

```typescript
import { invalidateCustomerCache, invalidateCartCache } from '@lib/util/cache'

// After customer authentication changes
await invalidateCustomerCache('Customer login state changed')

// After cart modifications
await invalidateCartCache('Cart items updated')
```

#### Common Invalidation Patterns
- **Customer Changes**: Login, logout, profile updates
- **Cart Changes**: Add/remove items, shipping updates
- **Product Changes**: Inventory updates, price changes
- **Order Changes**: Order placement, status updates

### Monitoring and Troubleshooting

#### Warning Signs of Cache Issues
1. **Build Errors**: Missing manifest files
2. **Runtime Errors**: "Cannot resolve module" errors
3. **Stale Data**: Outdated content persisting
4. **Memory Issues**: High memory usage

#### Diagnostic Steps
1. **Check Build Integrity**:
   ```bash
   ls -la .next/build-manifest.json
   ls -la .next/static/
   ```

2. **Verify Cache Handler**:
   ```bash
   ls -la cache-handler.js
   ls -la .cache/
   ```

3. **Monitor Memory Usage**:
   ```bash
   # Check Node.js memory usage
   node --inspect your-app.js
   ```

#### Emergency Recovery
If cache corruption occurs in production:

1. **Immediate Fix**:
   ```bash
   # Stop the application
   pkill -f "next"
   
   # Clear all caches
   rm -rf .next .cache
   
   # Rebuild and restart
   npm run build:production
   npm start
   ```

2. **Prevent Recurrence**:
   - Ensure `NODE_ENV=production` is set
   - Verify cache handler is properly configured
   - Check memory limits are appropriate

### Best Practices

#### Development
- Use `npm run dev` with Turbopack for fast iteration
- Cache clearing happens automatically in development mode
- Debug cache issues with development logging

#### Production
- Always use `npm run build:production` for builds
- Set appropriate memory limits for your server
- Monitor cache performance and memory usage
- Implement cache warming strategies for critical paths

#### Deployment Pipeline
1. **Pre-build**: Clear existing caches
2. **Build**: Use production configuration
3. **Test**: Verify build integrity
4. **Deploy**: Use production environment variables
5. **Monitor**: Watch for cache-related issues

### Performance Optimization

#### Cache Configuration Tuning
- **Memory Limit**: Adjust `cacheMaxMemorySize` based on server capacity
- **LRU Size**: Modify `maxItemsNumber` in cache handler
- **File Cache**: Monitor `.cache` directory size

#### Monitoring Metrics
- Cache hit/miss ratios
- Memory usage patterns
- Build time performance
- Runtime cache performance

### Security Considerations

#### Cache Security
- Cache files contain no sensitive data
- All authentication tokens are properly handled
- Cache invalidation prevents stale authentication

#### Production Hardening
- Cache handler validates all inputs
- Error handling prevents information leakage
- File permissions properly configured

---

## Support

For cache-related issues:
1. Check this documentation first
2. Use diagnostic scripts to identify problems
3. Clear caches as first troubleshooting step
4. Monitor application logs for cache warnings

Remember: **When in doubt, clear the cache!**