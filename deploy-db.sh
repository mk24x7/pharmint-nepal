#!/bin/bash
# Pharmint Database Deployment Script
# This script sets up the Pharmint database on a production server

set -e

echo "🇵🇭 Pharmint Database Deployment Script"
echo "======================================="

# Configuration
DB_NAME="pharmint"
SEED_FILE="pharmint-seed-$(date +%Y%m%d).sql"

# Check if seed file exists
if [ ! -f "$SEED_FILE" ]; then
    echo "❌ Error: Seed file $SEED_FILE not found!"
    echo "Please make sure you're running this from the project root directory."
    exit 1
fi

# Function to create database
create_database() {
    echo "📦 Creating database: $DB_NAME"
    
    # Drop database if it exists (optional - comment out for safety)
    # psql -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" || true
    
    # Create new database
    psql -U postgres -c "CREATE DATABASE $DB_NAME;" || {
        echo "⚠️  Database might already exist, continuing..."
    }
}

# Function to restore database
restore_database() {
    echo "🔄 Restoring database from seed file..."
    psql -U postgres -d $DB_NAME -f "$SEED_FILE"
}

# Function to verify deployment
verify_deployment() {
    echo "✅ Verifying deployment..."
    
    # Check if Philippines region exists
    REGION_COUNT=$(psql -U postgres -d $DB_NAME -t -c "SELECT COUNT(*) FROM region WHERE name = 'Philippines';")
    
    if [ "$REGION_COUNT" -gt 0 ]; then
        echo "✅ Philippines region found!"
    else
        echo "❌ Philippines region not found!"
        exit 1
    fi
    
    # Check if products have PHP pricing
    PHP_PRICE_COUNT=$(psql -U postgres -d $DB_NAME -t -c "SELECT COUNT(*) FROM price WHERE currency_code = 'php';")
    
    if [ "$PHP_PRICE_COUNT" -gt 0 ]; then
        echo "✅ PHP pricing found ($PHP_PRICE_COUNT prices)!"
    else
        echo "❌ PHP pricing not found!"
        exit 1
    fi
}

# Main deployment process
echo "🚀 Starting deployment process..."

create_database
restore_database
verify_deployment

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with: DATABASE_URL=postgresql://username:password@host/pharmint"
echo "2. Start your Medusa backend server"
echo "3. Visit http://your-domain.com/ph for Philippines region"
echo ""
echo "🏪 Your Pharmint marketplace is ready for production!"