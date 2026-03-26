-- Add extra fields to requests table
ALTER TABLE requests ADD COLUMN IF NOT EXISTS specs jsonb DEFAULT '{}';
ALTER TABLE requests ADD COLUMN IF NOT EXISTS deadline text DEFAULT 'flexible';
ALTER TABLE requests ADD COLUMN IF NOT EXISTS urgency text DEFAULT 'normal';
ALTER TABLE requests ADD COLUMN IF NOT EXISTS collaboration_mode text DEFAULT 'chat';

-- Add extra fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hourly_rate numeric;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Add deliverable note to missions
ALTER TABLE missions ADD COLUMN IF NOT EXISTS deliverable_note text;

-- Enable Supabase Realtime for key tables (run in Supabase dashboard if needed)
-- ALTER PUBLICATION supabase_realtime ADD TABLE request_matches;
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE missions;

-- RLS Policies (run once — adjust to your security needs)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_matches ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read any profile, write only their own
CREATE POLICY IF NOT EXISTS "profiles_read_all" ON profiles FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "profiles_write_own" ON profiles FOR ALL USING (auth.uid() = id);

-- Requests: clients can create/update their own; all authenticated can read
CREATE POLICY IF NOT EXISTS "requests_read" ON requests FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "requests_insert" ON requests FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY IF NOT EXISTS "requests_update_own" ON requests FOR UPDATE USING (auth.uid() = client_id);

-- Missions: only participants (client or independent) can see
CREATE POLICY IF NOT EXISTS "missions_participants" ON missions FOR SELECT USING (
  auth.uid() = client_id OR auth.uid() = independent_id
);
CREATE POLICY IF NOT EXISTS "missions_update_participants" ON missions FOR UPDATE USING (
  auth.uid() = client_id OR auth.uid() = independent_id
);

-- Messages: only mission participants
CREATE POLICY IF NOT EXISTS "messages_read" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM missions m
    WHERE m.id = mission_id AND (m.client_id = auth.uid() OR m.independent_id = auth.uid())
  )
);
CREATE POLICY IF NOT EXISTS "messages_insert" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM missions m
    WHERE m.id = mission_id AND (m.client_id = auth.uid() OR m.independent_id = auth.uid())
  )
);

-- Files: only mission participants
CREATE POLICY IF NOT EXISTS "files_read" ON files FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM missions m
    WHERE m.id = mission_id AND (m.client_id = auth.uid() OR m.independent_id = auth.uid())
  )
);
CREATE POLICY IF NOT EXISTS "files_insert" ON files FOR INSERT WITH CHECK (
  auth.uid() = uploaded_by
);

-- Request matches: independents see their own matches
CREATE POLICY IF NOT EXISTS "matches_indep" ON request_matches FOR SELECT USING (
  auth.uid() = independent_profile_id OR
  EXISTS (SELECT 1 FROM requests r WHERE r.id = request_id AND r.client_id = auth.uid())
);
CREATE POLICY IF NOT EXISTS "matches_update_indep" ON request_matches FOR UPDATE USING (
  auth.uid() = independent_profile_id
);
