# Database Dumps

This directory contains database dumps from the Pharmint Nepal production server.

## Latest Dump

**File:** `pharmint_dump_20250929_150055.sql`
**Created:** September 29, 2025 at 15:00:55 UTC
**Size:** 2.1 MB
**Tables:** 130 tables
**Source:** Production server (4.213.179.154)

## Usage

To restore this database dump to a local PostgreSQL instance:

```bash
# Create a new database
createdb pharmint_local

# Restore the dump
psql -d pharmint_local -f pharmint_dump_20250929_150055.sql
```

## Database Configuration

The production database configuration:
- **Host:** localhost
- **Port:** 5432
- **Database:** pharmint
- **User:** postgres

## Contents

This dump includes all production data including:
- Product catalog
- User accounts
- Orders and transactions
- Company profiles
- Regional settings
- All Medusa.js core tables

## Security Note

This dump contains production data. Handle with care and do not commit to public repositories.

## Backup Schedule

Database dumps should be taken regularly and stored securely. Consider automating this process for production environments.