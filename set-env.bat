@echo off
echo Setting environment variables...
call npx vercel env add NEXT_PUBLIC_SUPABASE_URL production --value "https://adrydqvahzqjbgtcvlay.supabase.co" --yes --force
call npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcnlkcXZhaHpxamJndGN2bGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNjExMDAsImV4cCI6MjA5NTkzNzEwMH0.mjpGjVN90sHJAahn3NTslo3wLzW0ttQlOrwBQ62BZko" --yes --force
call npx vercel env add SUPABASE_SERVICE_ROLE_KEY production --value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcnlkcXZhaHpxamJndGN2bGF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDM2MTEwMCwiZXhwIjoyMDk1OTM3MTAwfQ.mHYPXkHM4lC8OjYGevNPJhRTCjYBPrYeRVH00_RfFCA" --yes --force
call npx vercel env add MP_ACCESS_TOKEN production --value "TEST-7443185053186241-060214-aa45ae3de38c694143ac77a85048fa90-2605640522" --yes --force
call npx vercel env add NEXT_PUBLIC_MP_PUBLIC_KEY production --value "TEST-135e3f18-52db-40ae-ab63-9e9d16fedaa9" --yes --force
call npx vercel env add NEXT_PUBLIC_APP_URL production --value "https://makangru-monasteriovegans-projects.vercel.app" --yes --force
call npx vercel env add NEXT_PUBLIC_WHATSAPP_NUMBER production --value "56951975639" --yes --force
echo Done setting environment variables.
