#!/bin/bash
set -e

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Run the migration
psql "$DATABASE_URL" -f src/server/migrations/3/01_create_instagram_media_table.sql
