-- =============================================
-- FIX RLS POLICIES — Run this in Supabase SQL Editor
-- =============================================

-- Step 1: Drop existing overly permissive policies on participants
DROP POLICY IF EXISTS "Enable read access for all users" ON participants;
DROP POLICY IF EXISTS "Enable insert for all users" ON participants;
DROP POLICY IF EXISTS "Enable update for all users" ON participants;

-- Step 2: Create proper policies for participants
-- Public can READ (needed for check-in search)
CREATE POLICY "anon_read_participants"
  ON participants FOR SELECT
  USING (true);

-- Only authenticated users can INSERT (CSV import, register)
CREATE POLICY "auth_insert_participants"
  ON participants FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can UPDATE
CREATE POLICY "auth_update_participants"
  ON participants FOR UPDATE
  TO authenticated
  USING (true);

-- Only authenticated users can DELETE
CREATE POLICY "auth_delete_participants"
  ON participants FOR DELETE
  TO authenticated
  USING (true);

-- Step 3: Drop existing policies on checkins
DROP POLICY IF EXISTS "Enable insert for all users" ON checkins;
DROP POLICY IF EXISTS "Enable select for all users" ON checkins;

-- Step 4: Create proper policies for checkins
-- Public can READ (check-in status visible during search)
CREATE POLICY "anon_read_checkins"
  ON checkins FOR SELECT
  USING (true);

-- Public can INSERT (check-in from public page)
CREATE POLICY "anon_insert_checkins"
  ON checkins FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can UPDATE (admin update attendance)
CREATE POLICY "auth_update_checkins"
  ON checkins FOR UPDATE
  TO authenticated
  USING (true);

-- Only authenticated users can DELETE
CREATE POLICY "auth_delete_checkins"
  ON checkins FOR DELETE
  TO authenticated
  USING (true);
