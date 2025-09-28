const { CacheHandler } = require('@neshca/cache-handler');
const createLruHandler = require('@neshca/cache-handler/local-lru').default;
const { writeFile, readFile, mkdir } = require('fs/promises');
const { existsSync } = require('fs');
const path = require('path');

class ProductionCacheHandler extends CacheHandler {
  constructor(options) {
    super(options);
    
    // Use LRU cache as fallback
    this.lruHandler = createLruHandler({
      maxItemsNumber: 1000,
      maxItemSizeBytes: 1024 * 1024, // 1MB per item
    });
    
    // File-based cache directory
    this.cacheDir = path.join(process.cwd(), '.cache');
    this.ensureCacheDir();
  }

  async ensureCacheDir() {
    try {
      if (!existsSync(this.cacheDir)) {
        await mkdir(this.cacheDir, { recursive: true });
      }
    } catch (error) {
      console.warn('Failed to create cache directory:', error);
    }
  }

  async get(key) {
    try {
      // Try LRU cache first for speed
      const lruResult = await this.lruHandler.get(key);
      if (lruResult) {
        return lruResult;
      }

      // Fallback to file system
      if (process.env.NODE_ENV === 'production') {
        const filePath = path.join(this.cacheDir, `${key}.json`);
        if (existsSync(filePath)) {
          const data = await readFile(filePath, 'utf8');
          const parsed = JSON.parse(data);
          
          // Check if cache is expired
          if (parsed.expires && Date.now() > parsed.expires) {
            return null;
          }
          
          return parsed.value;
        }
      }
      
      return null;
    } catch (error) {
      console.warn(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key, data, context) {
    try {
      // Store in LRU cache
      await this.lruHandler.set(key, data, context);
      
      // Also store in file system for production persistence
      if (process.env.NODE_ENV === 'production') {
        const filePath = path.join(this.cacheDir, `${key}.json`);
        const cacheData = {
          value: data,
          expires: context?.revalidate ? Date.now() + (context.revalidate * 1000) : null,
          tags: context?.tags || [],
        };
        
        await writeFile(filePath, JSON.stringify(cacheData), 'utf8');
      }
    } catch (error) {
      console.warn(`Cache set error for key ${key}:`, error);
    }
  }

  async revalidateTag(tag) {
    try {
      // Revalidate in LRU cache
      await this.lruHandler.revalidateTag(tag);
      
      // For production, we could implement file-based tag invalidation
      // but for now, LRU cache revalidation is sufficient
      if (process.env.NODE_ENV === 'development') {
        console.log(`Cache revalidated for tag: ${tag}`);
      }
    } catch (error) {
      console.warn(`Cache revalidate error for tag ${tag}:`, error);
    }
  }
}

module.exports = ProductionCacheHandler;