-- This script helps create users in Supabase Auth
-- Note: You need to create users via Supabase Dashboard or Auth API first
-- Then run this to update their profiles with roles

-- After creating users in Supabase Auth dashboard, update their profiles:
-- 1. Go to Authentication > Users in Supabase Dashboard
-- 2. Create users with these emails:
--    - user@demo.com (password: user123)
--    - admin@demo.com (password: admin123)
-- 3. Then run the UPDATE statements below

-- Update user role to 'user'
UPDATE users 
SET role = 'user', name = 'Demo User'
WHERE email = 'user@demo.com';

-- Update user role to 'admin'
UPDATE users 
SET role = 'admin', name = 'Admin User'
WHERE email = 'admin@demo.com';

-- Verify the updates
SELECT id, email, name, role FROM users WHERE email IN ('user@demo.com', 'admin@demo.com');

