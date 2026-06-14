const { execSync } = require('child_process');

const vars = {
  "NEXT_PUBLIC_SUPABASE_URL": "https://adrydqvahzqjbgtcvlay.supabase.co",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcnlkcXZhaHpxamJndGN2bGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNjExMDAsImV4cCI6MjA5NTkzNzEwMH0.mjpGjVN90sHJAahn3NTslo3wLzW0ttQlOrwBQ62BZko",
  "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcnlkcXZhaHpxamJndGN2bGF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDM2MTEwMCwiZXhwIjoyMDk1OTM3MTAwfQ.mHYPXkHM4lC8OjYGevNPJhRTCjYBPrYeRVH00_RfFCA",
  "MP_ACCESS_TOKEN": "TEST-7443185053186241-060214-aa45ae3de38c694143ac77a85048fa90-2605640522",
  "NEXT_PUBLIC_MP_PUBLIC_KEY": "TEST-135e3f18-52db-40ae-ab63-9e9d16fedaa9",
  "NEXT_PUBLIC_APP_URL": "https://makangru-monasteriovegans-projects.vercel.app",
  "NEXT_PUBLIC_WHATSAPP_NUMBER": "56951975639"
};

const envs = ['production'];

for (const [key, val] of Object.entries(vars)) {
  for (const env of envs) {
    console.log(`Adding ${key} to ${env}...`);
    try {
      execSync(`npx.cmd vercel env add ${key} ${env} --value "${val}" --yes --force`, { stdio: 'inherit' });
    } catch (err) {
      console.error(`Error adding ${key} to ${env}:`, err.message);
    }
  }
}
