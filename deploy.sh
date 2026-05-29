#!/bin/bash
# TaxitWorld CRM - One-Command Deploy Script
# Run this once on your machine. Never needed again after first deploy.
set -e

echo "🚀 TaxitWorld CRM Deployment"
echo "================================"

# 1. Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
  echo "📦 Installing Vercel CLI..."
  npm install -g vercel
fi

# 2. Deploy to Vercel (creates new project automatically)
echo "⬆️  Deploying to Vercel..."
vercel deploy --prod \
  --yes \
  --name taxitworld-crm \
  --scope lubaibpks-projects \
  --build-env VITE_SUPABASE_URL="https://iwcemrkrsptvwkpcmwqh.supabase.co" \
  --build-env VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Y2Vtcmtyc3B0dndrcGNtd3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzODM4NzksImV4cCI6MjA5NDk1OTg3OX0.Pg6Yh6klRhGt5MQUnebrfcygQNFMmgOhPuudSzd8iZA"

echo ""
echo "✅ Done! Your CRM is live."
echo "   • Supabase DB: https://supabase.com/dashboard/project/iwcemrkrsptvwkpcmwqh"
echo "   • Vercel:       https://vercel.com/lubaibpks-projects/taxitworld-crm"
