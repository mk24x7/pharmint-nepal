# Pharmint Marketplace Deployment Guide

## Production Deployment Summary

This guide documents the complete deployment of the Pharmint pharmaceutical marketplace on Google Cloud Platform (GCP) server `35.232.198.119`.

## Final Architecture

- **Frontend**: https://pharmint.ph (Next.js on port 8000)
- **Admin Panel**: https://admin.pharmint.ph/app (Medusa Admin)
- **API Backend**: https://api.pharmint.ph (Medusa v2 on port 9000)
- **Database**: PostgreSQL (local on port 5432)
- **Process Manager**: PM2 with systemd integration
- **Reverse Proxy**: Nginx with SSL certificates

## Deployment Steps

### 1. Initial Setup and Cleanup
```bash
# Stop all existing PM2 processes
pm2 stop all && pm2 delete all

# Clean up old files and database
sudo -u postgres dropdb pharmint_old 2>/dev/null || true
rm -rf old_deployment_files
```

### 2. Repository and Database Setup
```bash
# Clone/update repository
cd /home/mukul
git clone https://github.com/your-org/pharmint-marketplace.git
cd pharmint-marketplace
git pull origin main

# Database restoration
sudo -u postgres createdb pharmint
sudo -u postgres psql -d pharmint -f pharmint-production-dump-20250904.sql

# Note: pgcrypto extension is included in the production dump
```

### 3. Backend Configuration
```bash
# Navigate to backend
cd backend

# Configure environment variables (.env)
STORE_CORS=https://pharmint.ph
ADMIN_CORS=https://admin.pharmint.ph
AUTH_CORS=https://admin.pharmint.ph
JWT_SECRET=<random-secret>
COOKIE_SECRET=<random-secret>
DATABASE_URL=postgresql://postgres:pharmint123@localhost:5432/pharmint
REDIS_URL=redis://localhost:6379
NODE_ENV=production
DISABLE_MEDUSA_ADMIN=false
MEDUSA_WORKER_MODE=server
MEDUSA_BACKEND_URL=https://api.pharmint.ph
BACKEND_URL=https://api.pharmint.ph
MEDUSA_ADMIN_BACKEND_URL=https://api.pharmint.ph

# Google OAuth Configuration
GOOGLE_CLIENT_ID=465185164183-fohod7v3s4l1cpgssfms6ahkq6di5pke.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://pharmint.ph/ph/login/callback/google

# Install dependencies and build
yarn install
yarn build
```

### 4. Frontend Configuration
```bash
# Navigate to frontend
cd ../frontend

# Configure environment variables (.env.local)
MEDUSA_BACKEND_URL=https://api.pharmint.ph
NEXT_PUBLIC_DEFAULT_REGION=ph
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_34d11f50308c12a3bf2e970e3759373236a288ec6d84d8e947436d8a0a74165b
REVALIDATE_SECRET=supersecret

# Install dependencies and build
yarn install
yarn build
```

### 5. Admin User Creation
```bash
# Create admin user using Medusa CLI
cd backend
npx medusa user --email mukulyadav49@gmail.com --password AqSA5dvbsPYm
```

### 6. PM2 Deployment
```bash
# Start backend service
cd backend/.medusa/server
pm2 start npm --name 'pharmint-backend' -- run start

# Start frontend service  
cd ../../frontend
pm2 start "npm run start" --name 'pharmint-frontend'

# Save PM2 configuration and setup auto-start
pm2 save
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u mukul --hp /home/mukul
```

### 7. Nginx Configuration
```nginx
# /etc/nginx/sites-available/pharmint.ph
server {
    listen 443 ssl;
    server_name api.pharmint.ph;
    
    ssl_certificate /etc/letsencrypt/live/pharmint.ph/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pharmint.ph/privkey.pem;
    
    location / {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl;
    server_name pharmint.ph;
    
    ssl_certificate /etc/letsencrypt/live/pharmint.ph/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pharmint.ph/privkey.pem;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl;
    server_name admin.pharmint.ph;
    
    ssl_certificate /etc/letsencrypt/live/pharmint.ph/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pharmint.ph/privkey.pem;
    
    location / {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Incorrect Assumptions & Fixes

### ❌ Assumption 1: Running from Project Root
**Incorrect Approach:**
```bash
cd backend
npm run start  # Running from backend root
```

**Issue:** Admin panel was not accessible, getting 404 errors.

**✅ Correct Approach (Official Medusa Way):**
```bash
cd backend/.medusa/server
npm run start  # Running from .medusa/server directory
```

**Why:** Medusa v2 official deployment requires running from the `.medusa/server` directory where the compiled application resides.

### ❌ Assumption 2: Frontend Environment Variable Naming
**Incorrect Approach:**
```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.pharmint.ph
```

**Issue:** Frontend 500 errors with middleware failing to fetch regions.

**✅ Correct Approach:**
```env
MEDUSA_BACKEND_URL=https://api.pharmint.ph
```

**Why:** Medusa v2 changed the environment variable naming convention. The middleware expects `MEDUSA_BACKEND_URL`, not `NEXT_PUBLIC_MEDUSA_BACKEND_URL`.

### ❌ Assumption 3: Development vs Production Mode
**Incorrect Approach:**
```bash
npm run build
NODE_ENV=production npm run start
```

**Issue:** Admin panel build was incomplete, various functionality missing.

**✅ Correct Approach:**
```bash
yarn build  # Uses official Medusa build process
yarn start  # Or npm run start from .medusa/server
```

**Why:** Following the official Medusa deployment documentation ensures proper build compilation and admin panel functionality.

### ❌ Assumption 4: CORS Configuration
**Incorrect Approach:**
```env
ADMIN_CORS=https://admin.pharmint.ph,http://localhost:9000,http://localhost:5173
```

**Issue:** File exports were generating localhost URLs instead of production URLs.

**✅ Correct Approach:**
```env
ADMIN_CORS=https://admin.pharmint.ph
STORE_CORS=https://pharmint.ph
AUTH_CORS=https://admin.pharmint.ph
MEDUSA_BACKEND_URL=https://api.pharmint.ph
```

**Why:** Removing localhost references and setting proper backend URL ensures file exports use production domains.

### ❌ Assumption 5: Manual Process Management
**Incorrect Approach:**
```bash
nohup npm run start &  # Manual background processes
```

**Issue:** Processes would die when SSH session ended, no automatic restart on crashes.

**✅ Correct Approach:**
```bash
pm2 start npm --name 'pharmint-backend' -- run start
pm2 start "npm run start" --name 'pharmint-frontend'
pm2 save
pm2 startup
```

**Why:** PM2 provides process management, automatic restarts, and systemd integration for production environments.

### ❌ Assumption 6: Image Domain Configuration  
**Incorrect Approach:**
```javascript
// next.config.js - Missing external image domains
images: {
  remotePatterns: [
    { hostname: "localhost" },
    { hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com" }
    // Missing pharmint.net domain
  ]
}
```

**Issue:** Product images stored on external domains (e.g., `pharmint.net`) return 400 Bad Request errors.

**✅ Correct Approach:**
```javascript
// next.config.js - Include all image domains
images: {
  remotePatterns: [
    { protocol: "https", hostname: "pharmint.net" }, // External image domain
    { protocol: "https", hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com" }
  ]
}
```

**Why:** Next.js Image optimization requires explicit domain allowlisting for security. All external image sources must be declared in `remotePatterns`.

### ❌ Assumption 7: API Data Fetching Completeness
**Incorrect Approach:**
```typescript
// products.ts - Missing image fields in API query
fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags"
```

**Issue:** Frontend receives no image data, displays placeholder images, no actual image requests made.

**✅ Correct Approach:**
```typescript  
// products.ts - Include image fields in API query
fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,+images,+thumbnail"
```

**Why:** Medusa API only returns requested fields. Without `+images,+thumbnail`, the frontend has no image URLs to display or optimize.

### ❌ Assumption 8: Cache Management Strategy
**Incorrect Approach:**
```typescript
// Aggressive caching without invalidation strategy
cache: "force-cache"  // Never revalidates
```

**Issue:** Stale data persists indefinitely, deleted products still show, performance degrades with cache misses.

**✅ Correct Approach:**
```bash
# Manual cache clearing when needed
rm -rf .next/cache
pm2 restart frontend

# Better: Implement proper cache tagging and revalidation
```

**Why:** Production requires cache invalidation strategy. `force-cache` without tags leads to stale data and user experience issues.

## Advanced PM2 Configuration

### Professional Ecosystem Setup
Create `ecosystem.config.js` for production-grade process management:

```javascript
module.exports = {
  apps: [
    {
      name: 'pharmint-backend',
      cwd: './backend/.medusa/server',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        JWT_SECRET: 'your-strong-jwt-secret',
        COOKIE_SECRET: 'your-strong-cookie-secret',
        DATABASE_URL: 'postgresql://postgres:pharmint123@localhost:5432/pharmint',
        MEDUSA_BACKEND_URL: 'https://api.pharmint.ph'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_date_format: 'YYYY-MM-DD HH:mm Z'
    },
    {
      name: 'pharmint-frontend', 
      cwd: './frontend',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        MEDUSA_BACKEND_URL: 'https://api.pharmint.ph',
        NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: 'your-publishable-key'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_date_format: 'YYYY-MM-DD HH:mm Z'
    }
  ]
};
```

### PM2 Management Commands
```bash
# Start using ecosystem
pm2 start ecosystem.config.js

# Monitor services
pm2 status
pm2 logs
pm2 logs pharmint-backend --lines 50
pm2 monit

# Restart strategies
pm2 restart pharmint-frontend  # Restart single service
pm2 reload pharmint-backend    # Zero-downtime reload
pm2 restart all                # Restart all services

# Save and setup auto-start
pm2 save
pm2 startup
```

## Performance Optimization

### Cache Management
```bash
# Clear Next.js cache (safe restart)
pm2 stop pharmint-frontend
rm -rf frontend/.next/cache  
pm2 start pharmint-frontend

# Clear all caches (nuclear option)
pm2 stop all
rm -rf frontend/.next/cache
pm2 start all
```

### Database Performance
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'pharmint';

-- Terminate hanging connections (if needed)
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE datname = 'pharmint' AND pid <> pg_backend_pid();
```

### Image Optimization Troubleshooting
```bash
# Test external image accessibility
curl -I https://pharmint.net/wp-content/uploads/2024/01/Product-placeholder-Pharmint.png

# Debug Next.js image optimization
curl -I "https://pharmint.ph/_next/image?url=https%3A%2F%2Fpharmint.net%2Fwp-content%2Fuploads%2F2024%2F01%2FProduct-placeholder-Pharmint.png&w=640&q=75"

# Check product API returns image data
curl -H "x-publishable-api-key: your-key" "https://api.pharmint.ph/store/products?limit=1&fields=+images,+thumbnail"
```

### Database Management

#### Creating Fresh Database Dumps
```bash
# Create production database dump (on server)
cd pharmint-marketplace
sudo -u postgres pg_dump --clean --create --if-exists pharmint > pharmint-production-seed-$(date +%Y%m%d).sql

# Check dump size and contents
ls -lh pharmint-production-seed-*.sql
head -20 pharmint-production-seed-*.sql

# Copy to local repository for version control
scp user@server:/path/to/pharmint-production-seed-YYYYMMDD.sql ./
```

#### Database Restoration for New Installations
```bash
# Method 1: Direct restoration (recommended)
sudo -u postgres createdb pharmint
sudo -u postgres psql -d pharmint -f pharmint-production-dump-20250904.sql

# Method 2: Manual restoration with error handling
sudo -u postgres createdb pharmint
sudo -u postgres psql -d pharmint < pharmint-production-dump-20250904.sql 2>&1 | tee restore.log
```

#### Current Database Statistics
- **Size**: ~2MB compressed dump
- **Tables**: Complete Medusa v2 schema with B2B extensions
- **Records**: 261 products with complete metadata
- **Users**: Production admin user configured
- **Extensions**: pgcrypto enabled for password hashing

## Key Lessons Learned

1. **Always follow official deployment guides** - Custom approaches often miss critical configurations
2. **Environment variables matter** - Medusa v2 has specific naming conventions that differ from v1  
3. **Process management is crucial** - Manual processes don't survive production scenarios
4. **CORS and backend URLs affect file services** - Localhost references cause production issues
5. **Database extensions required** - pgcrypto needed for proper password hashing
6. **Build from correct directory** - Medusa v2 requires running from `.medusa/server` for admin functionality
7. **Image domains must be explicitly allowed** - Next.js security requires `remotePatterns` configuration
8. **API fields determine frontend data** - Missing `+images,+thumbnail` means no image data returned
9. **Cache invalidation is critical** - Production needs cache clearing strategy for data consistency
10. **PM2 ecosystem config improves reliability** - Professional process management with monitoring and auto-restart

## Troubleshooting Common Issues

### Images Not Displaying
1. **Check Next.js config** - Verify `pharmint.net` in `remotePatterns`
2. **Verify API fields** - Ensure `+images,+thumbnail` in products query
3. **Clear cache** - Remove `.next/cache` and restart frontend
4. **Test source images** - Verify external image URLs are accessible

### Slow Performance  
1. **Check product count** - Large catalogs (>200 products) affect performance
2. **Monitor PM2 processes** - Check memory usage and restart if needed
3. **Clear caches** - Remove stale cached data
4. **Database connections** - Monitor and terminate hanging connections

### PM2 Process Issues
1. **Check ecosystem config** - Verify environment variables are set
2. **Monitor logs** - Use `pm2 logs` to identify startup issues  
3. **Restart strategy** - Use `pm2 reload` for zero-downtime updates
4. **Save configuration** - Always `pm2 save` after successful setup

## Health Checks

After deployment, verify:

```bash
# Backend health
curl https://api.pharmint.ph/health

# Frontend loading
curl -I https://pharmint.ph

# Admin panel access
curl -I https://admin.pharmint.ph/app

# PM2 status
pm2 status
```

## Admin Credentials

- **Email:** mukulyadav49@gmail.com
- **Password:** AqSA5dvbsPYm
- **Admin URL:** https://admin.pharmint.ph/app

## Google OAuth Configuration

### Production Setup Required

**1. Google Cloud Console Configuration:**
- **Project:** Use existing Google Cloud project
- **OAuth 2.0 Client IDs:** Update authorized redirect URIs
- **Development:** `http://localhost:8000/ph/login/callback/google`
- **Production:** `https://pharmint.ph/ph/login/callback/google`

**2. Backend Environment Variables (.env):**
```env
# Add to backend production environment
GOOGLE_CLIENT_ID=465185164183-fohod7v3s4l1cpgssfms6ahkq6di5pke.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://pharmint.ph/ph/login/callback/google
```

**3. Frontend Implementation:**
- Google OAuth buttons implemented in login/register components
- Callback page: `/ph/login/callback/google` 
- Uses Medusa SDK for proper authentication flow

**4. OAuth Flow:**
1. User clicks "Continue with Google" → Frontend calls Medusa SDK
2. Backend redirects to Google OAuth → User authenticates with Google
3. Google redirects to production: `https://pharmint.ph/ph/login/callback/google`
4. Callback page processes tokens → User redirected to account dashboard

### ⚠️ Critical Note:
The `/ph/` path segment is required because the frontend uses `[countryCode]` dynamic routing. All OAuth callbacks must include the country code path.

## Production URLs

- **Storefront:** https://pharmint.ph
- **Admin Panel:** https://admin.pharmint.ph/app  
- **API Endpoint:** https://api.pharmint.ph
- **Health Check:** https://api.pharmint.ph/health
- **Google OAuth Callback:** https://pharmint.ph/ph/login/callback/google

---

**Deployment Date:** September 3, 2025  
**Medusa Version:** v2.4  
**Next.js Version:** 15.5.2  
**Server:** Google Cloud Platform (35.232.198.119)