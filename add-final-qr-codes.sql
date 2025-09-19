-- First ensure admin email exists
INSERT INTO qr_emails (email, is_active)
VALUES ('admin@gpai.app', true)
ON CONFLICT (email) DO NOTHING;

-- Add the two QR codes with their actual UUIDs
INSERT INTO qr_codes (id, user_id, name, destination_url, scan_count, created_at)
VALUES 
  ('1251af31-b4ea-41f6-aa2d-9877f7e5b28a'::uuid, 
   (SELECT id FROM qr_emails WHERE email = 'admin@gpai.app'), 
   'US Brochure', 
   'https://apps.apple.com/app/gpai-ai-homework-solver/id6748109514', 
   0, 
   NOW()),
  ('4595b130-654b-43c8-b452-63e5df312e5f'::uuid, 
   (SELECT id FROM qr_emails WHERE email = 'admin@gpai.app'), 
   'US Shirt Logo', 
   'https://gpai.app', 
   0, 
   NOW())
ON CONFLICT (id) DO NOTHING;

-- Create or replace the increment function
DROP FUNCTION IF EXISTS increment_scan_count(UUID);
CREATE OR REPLACE FUNCTION increment_scan_count(qr_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE qr_codes 
  SET scan_count = COALESCE(scan_count, 0) + 1
  WHERE id = qr_id;
END;
$$ LANGUAGE plpgsql;