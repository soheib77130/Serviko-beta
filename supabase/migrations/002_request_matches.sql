-- Create request_matches table to store notifications / offers to independents
CREATE TABLE IF NOT EXISTS request_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES requests(id) ON DELETE CASCADE,
  independent_profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending', -- pending, accepted, declined
  created_at timestamptz DEFAULT now()
);
