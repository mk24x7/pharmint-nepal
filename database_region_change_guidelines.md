# Database Region Change Guidelines

This document outlines the step-by-step process to change the default region and currency for a Medusa e-commerce application.

## Overview
When changing the default region/country for a Medusa application, you must update the database directly because the frontend middleware reads region data from the backend API, which in turn reads from the database.

## Prerequisites
- Database access (PostgreSQL)
- Backend and frontend applications running
- Admin access to restart services

## Step-by-Step Process

### 1. Create New Region
Create the new region with the desired currency:

```sql
INSERT INTO region (id, name, currency_code, automatic_taxes, created_at, updated_at)
VALUES ('reg_nepal_001', 'Nepal', 'npr', true, NOW(), NOW());
```

**Notes:**
- Use a unique region ID (e.g., `reg_nepal_001`)
- Set the correct currency code (e.g., `npr` for Nepalese Rupee)
- `automatic_taxes` should typically be `true`

### 2. Assign Country to Region
Link the country to the new region:

```sql
UPDATE region_country
SET region_id = 'reg_nepal_001'
WHERE iso_2 = 'np';
```

**Notes:**
- Use the correct ISO 2-letter country code (e.g., `np` for Nepal)
- This associates the country with your new region

### 3. Update Store Default Region
Set the new region as the store's default:

```sql
UPDATE store
SET default_region_id = 'reg_nepal_001'
WHERE id = 'store_01K465NVAFZKTAQXD503TJBMJV';
```

**Notes:**
- Replace the store ID with your actual store ID
- Find your store ID with: `SELECT id FROM store;`

### 4. Update Store Currencies
Remove old default currency and add new ones:

```sql
-- Remove old default currency
UPDATE store_currency
SET is_default = false
WHERE currency_code = 'php';

-- Add new default currency
INSERT INTO store_currency (id, currency_code, is_default, store_id, created_at, updated_at)
VALUES ('stocur_npr_001', 'npr', true, 'store_01K465NVAFZKTAQXD503TJBMJV', NOW(), NOW());

-- Add additional currencies (optional)
INSERT INTO store_currency (id, currency_code, is_default, store_id, created_at, updated_at)
VALUES ('stocur_inr_001', 'inr', false, 'store_01K465NVAFZKTAQXD503TJBMJV', NOW(), NOW());
```

**Notes:**
- Only one currency can be `is_default = true`
- Use unique currency IDs
- Add multiple currencies as needed

### 5. Remove Old Regions (Optional)
If you want to completely remove old regions:

```sql
-- First, unassign countries from the old region
UPDATE region_country
SET region_id = NULL
WHERE iso_2 = 'ph';

-- Then delete the old region
DELETE FROM region
WHERE name = 'Philippines';
```

**Warning:** This will remove the region completely. Only do this if you're sure you don't need it.

### 6. Restart Services
After database changes, restart both backend and frontend:

```bash
pm2 restart pharmint-backend
pm2 restart pharmint-frontend
```

**Important:** Services must be restarted to pick up database changes and clear any cached region data.

## Verification Steps

### 1. Check Database Changes
Verify your changes:

```sql
-- Check regions
SELECT * FROM region;

-- Check store configuration
SELECT * FROM store;

-- Check store currencies
SELECT * FROM store_currency;

-- Check country assignments
SELECT * FROM region_country WHERE region_id IS NOT NULL;
```

### 2. Test Backend API
Test the backend API with your publishable key:

```bash
curl -H 'x-publishable-api-key: YOUR_API_KEY' http://localhost:9000/store/regions
```

Expected response should show your new region.

### 3. Test Frontend
Visit your website root URL (e.g., `https://pharmint.com.np/`) and verify it redirects to the correct country code (e.g., `/np`).

## Troubleshooting

### Redirect Loops
If you experience infinite redirects:
- Check that the store's `default_region_id` matches an existing region
- Ensure the country is properly assigned to the region
- Restart both backend and frontend services

### Backend Connection Issues
If backend can't start:
- Check database credentials in backend `.env` file
- Ensure `.env` is copied to `.medusa/server/.env` in the build directory
- Check PostgreSQL is running and accessible

### Frontend Region Errors
If frontend shows region errors:
- Ensure `MEDUSA_BACKEND_URL` is set in frontend `.env.local`
- Verify backend is running and accessible
- Check that publishable API key is correct

## Important Notes

1. **Database First**: The database is the source of truth for regions. Frontend changes alone won't work.

2. **Service Restart Required**: Always restart both backend and frontend after database changes.

3. **Cache Considerations**: Region data may be cached. Restarting services clears this cache.

4. **API Key Required**: Backend API requires a valid publishable key for region endpoints.

5. **Backup First**: Always backup your database before making structural changes.

## Example: Complete Nepal Setup

Here's the complete SQL sequence to set up Nepal as the default region:

```sql
-- 1. Create Nepal region
INSERT INTO region (id, name, currency_code, automatic_taxes, created_at, updated_at)
VALUES ('reg_nepal_001', 'Nepal', 'npr', true, NOW(), NOW());

-- 2. Assign Nepal country to region
UPDATE region_country SET region_id = 'reg_nepal_001' WHERE iso_2 = 'np';

-- 3. Set Nepal as store default
UPDATE store SET default_region_id = 'reg_nepal_001' WHERE id = 'store_01K465NVAFZKTAQXD503TJBMJV';

-- 4. Update currencies
UPDATE store_currency SET is_default = false WHERE currency_code = 'php';
INSERT INTO store_currency (id, currency_code, is_default, store_id, created_at, updated_at)
VALUES ('stocur_npr_001', 'npr', true, 'store_01K465NVAFZKTAQXD503TJBMJV', NOW(), NOW());
INSERT INTO store_currency (id, currency_code, is_default, store_id, created_at, updated_at)
VALUES ('stocur_inr_001', 'inr', false, 'store_01K465NVAFZKTAQXD503TJBMJV', NOW(), NOW());

-- 5. Remove old regions (optional)
UPDATE region_country SET region_id = NULL WHERE iso_2 = 'ph';
DELETE FROM region WHERE name = 'Philippines';
```

Then restart services:
```bash
pm2 restart pharmint-backend && pm2 restart pharmint-frontend
```