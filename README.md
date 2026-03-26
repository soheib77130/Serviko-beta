Serviko — prototype

Contenu : scaffold Next.js minimal + migration SQL pour Supabase.

Installation locale :
1. Copier .env.example -> .env.local et remplir SUPABASE_URL et SUPABASE_SERVICE_ROLE (ou utiliser keys depuis Supabase dashboard).
2. npm install
3. npm run dev

Migrations SQL disponibles dans supabase/migrations/001_init.sql — exécutez-les depuis Supabase SQL Editor (ou via supabase CLI).