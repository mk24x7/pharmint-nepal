#!/usr/bin/env node
/**
 * Cache clearing script for production deployments
 * Usage: node scripts/clear-cache.js [options]
 * Options:
 *   --build    Clear Next.js build cache (.next directory)
 *   --app      Clear application cache (.cache directory)
 *   --all      Clear all caches (default)
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const shouldClearBuild = args.includes('--build') || args.includes('--all') || args.length === 0;
const shouldClearApp = args.includes('--app') || args.includes('--all') || args.length === 0;

function removeDirectory(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Cleared cache directory: ${dirPath}`);
      return true;
    } else {
      console.log(`ℹ️  Cache directory not found: ${dirPath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Failed to clear cache directory ${dirPath}:`, error.message);
    return false;
  }
}

function clearCache() {
  console.log('🧹 Starting cache cleanup...');
  
  let clearedAny = false;
  
  if (shouldClearBuild) {
    const buildCachePath = path.join(process.cwd(), '.next');
    if (removeDirectory(buildCachePath)) {
      clearedAny = true;
    }
  }
  
  if (shouldClearApp) {
    const appCachePath = path.join(process.cwd(), '.cache');
    if (removeDirectory(appCachePath)) {
      clearedAny = true;
    }
  }
  
  if (clearedAny) {
    console.log('✨ Cache cleanup completed successfully');
  } else {
    console.log('ℹ️  No cache directories found to clear');
  }
  
  // Provide next steps
  console.log('\n📋 Next steps:');
  if (shouldClearBuild) {
    console.log('   • Run "npm run build" to rebuild the application');
  }
  console.log('   • Restart your application server');
  
  return clearedAny;
}

// Run if called directly
if (require.main === module) {
  clearCache();
}

module.exports = { clearCache, removeDirectory };