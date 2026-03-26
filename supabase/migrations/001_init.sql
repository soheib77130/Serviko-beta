-- Supabase initial migration for Serviko

-- users table (auth handled by Supabase Auth; profile here)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  role text, -- 'client' or 'independent'
  skills text[],
  categories text[],
  online boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- client requests
CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text,
  description text,
  category text,
  budget_min numeric,
  budget_max numeric,
  status text DEFAULT 'open', -- open, matched, closed
  created_at timestamptz DEFAULT now()
);

-- missions (assignment between client and independent)
CREATE TABLE IF NOT EXISTS missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES requests(id) ON DELETE CASCADE,
  independent_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  client_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  price numeric,
  commission numeric,
  paid boolean DEFAULT false,
  status text DEFAULT 'ongoing', -- ongoing, delivered, completed
  created_at timestamptz DEFAULT now()
);

-- messages per mission
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  body text,
  attachments text[], -- storage paths
  created_at timestamptz DEFAULT now()
);

-- simple files table (optional)
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE,
  path text,
  filename text,
  uploaded_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);
