-- Drop existing function if it exists (try both parameter names)
DROP FUNCTION IF EXISTS increment_scan_count(UUID);
DROP FUNCTION IF EXISTS increment_scan_count(code_id UUID);

-- Create the increment_scan_count function in Supabase
CREATE OR REPLACE FUNCTION increment_scan_count(qr_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE qr_codes 
  SET scan_count = COALESCE(scan_count, 0) + 1
  WHERE id = qr_id;
END;
$$ LANGUAGE plpgsql;

-- First, create a system user in qr_emails if it doesn't exist
INSERT INTO qr_emails (email, is_active)
VALUES ('admin@gpai.app', true)
ON CONFLICT (email) DO NOTHING;

-- Insert the four QR codes with proper UUID format
INSERT INTO qr_codes (id, user_id, name, destination_url, scan_count, created_at)
VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 
   (SELECT id FROM qr_emails WHERE email = 'admin@gpai.app'), 
   'US Shirt Logo', 
   'https://gpai.app', 
   0, 
   NOW()),
  ('b2c3d4e5-f678-90ab-cdef-123456789012'::uuid, 
   (SELECT id FROM qr_emails WHERE email = 'admin@gpai.app'), 
   'Boston', 
   'https://gpai.app', 
   0, 
   NOW()),
  ('c3d4e5f6-7890-abcd-ef12-345678901234'::uuid, 
   (SELECT id FROM qr_emails WHERE email = 'admin@gpai.app'), 
   'New York', 
   'https://gpai.app', 
   0, 
   NOW()),
  ('d4e5f678-90ab-cdef-1234-567890123456'::uuid, 
   (SELECT id FROM qr_emails WHERE email = 'admin@gpai.app'), 
   'US Brochure', 
   'https://gpai.app', 
   0, 
   NOW())
ON CONFLICT (id) DO NOTHING;