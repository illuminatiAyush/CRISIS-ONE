-- ============================================
-- CrisisOne UPGRADE - Run AFTER supabase-setup.sql
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Upgrade incidents table with new columns
ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS priority_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'resolved')),
  ADD COLUMN IF NOT EXISTS assigned_agency_id uuid,
  ADD COLUMN IF NOT EXISTS alert_radius integer DEFAULT 5;

-- 2. Create agencies table
CREATE TABLE IF NOT EXISTS public.agencies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'General',
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  contact text,
  capacity integer DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read agencies"
  ON public.agencies FOR SELECT USING (true);

CREATE POLICY "Anyone can insert agencies"
  ON public.agencies FOR INSERT WITH CHECK (true);

-- 3. Create resources table
CREATE TABLE IF NOT EXISTS public.resources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'available'
    CHECK (status IN ('available', 'deployed', 'maintenance')),
  agency_id uuid REFERENCES public.agencies(id),
  quantity integer DEFAULT 1,
  lat double precision,
  lng double precision,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read resources"
  ON public.resources FOR SELECT USING (true);

CREATE POLICY "Anyone can insert resources"
  ON public.resources FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update resources"
  ON public.resources FOR UPDATE USING (true);

-- 4. Allow updates on incidents (for status/assignment changes)
CREATE POLICY "Anyone can update incidents"
  ON public.incidents FOR UPDATE USING (true);

-- 5. Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.agencies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resources;

-- 6. Seed demo agencies (Mumbai area)
INSERT INTO public.agencies (name, type, lat, lng, contact, capacity) VALUES
  ('Mumbai Fire Brigade - HQ',       'Fire',       19.0760, 72.8777, '+91-22-23076111', 25),
  ('KEM Hospital - Emergency',       'Medical',    19.0000, 72.8425, '+91-22-24136051', 40),
  ('NDRF Unit 5 - Andheri',          'Rescue',     19.1136, 72.8697, '+91-22-26822222', 30),
  ('BMC Disaster Cell',              'Government', 19.0825, 72.8810, '+91-22-22694725', 20),
  ('Coast Guard Station - Colaba',   'Maritime',   18.9067, 72.8147, '+91-22-22151431', 15),
  ('Lilavati Hospital',              'Medical',    19.0509, 72.8289, '+91-22-26751000', 35),
  ('Police Control Room - Crawford', 'Police',     18.9470, 72.8350, '+91-22-22621855', 50),
  ('SDRF Team - Bandra',             'Rescue',     19.0596, 72.8295, '+91-22-26511111', 20);

-- 7. Seed demo resources
INSERT INTO public.resources (name, type, status, quantity, lat, lng) VALUES
  ('Fire Truck Unit A',       'Vehicle',    'available',   3,  19.0760, 72.8777),
  ('Ambulance Fleet',         'Vehicle',    'deployed',    5,  19.0000, 72.8425),
  ('Rescue Boats',            'Equipment',  'available',   8,  19.1136, 72.8697),
  ('Emergency Medical Kits',  'Supply',     'available',   50, 19.0825, 72.8810),
  ('Water Pumps',             'Equipment',  'deployed',    12, 18.9067, 72.8147),
  ('Generator Sets',          'Equipment',  'available',   6,  19.0509, 72.8289),
  ('Search & Rescue Drones',  'Technology', 'available',   4,  19.0596, 72.8295),
  ('Satellite Phones',        'Communication', 'available', 10, 19.0825, 72.8810),
  ('Portable Shelters',       'Supply',     'maintenance', 15, 19.1136, 72.8697),
  ('Hazmat Suits',            'Equipment',  'available',   20, 18.9470, 72.8350);
