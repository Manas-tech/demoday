-- Fix admin role for existing users
-- Run this after creating users in Supabase Auth

-- First, make sure the users table has entries for auth users
-- This will create user profiles if they don't exist
INSERT INTO users (id, email, role, name)
SELECT 
  au.id,
  au.email,
  CASE 
    WHEN au.email = 'admin@demo.com' THEN 'admin'
    ELSE 'user'
  END as role,
  CASE 
    WHEN au.email = 'admin@demo.com' THEN 'Admin User'
    WHEN au.email = 'user@demo.com' THEN 'Demo User'
    ELSE NULL
  END as name
FROM auth.users au
WHERE au.email IN ('admin@demo.com', 'user@demo.com')
ON CONFLICT (id) DO UPDATE
SET 
  role = EXCLUDED.role,
  name = COALESCE(EXCLUDED.name, users.name),
  email = EXCLUDED.email;

-- Or if you want to update existing users:
UPDATE users 
SET role = 'admin', name = 'Admin User'
WHERE email = 'admin@demo.com';

UPDATE users 
SET role = 'user', name = 'Demo User'
WHERE email = 'user@demo.com';

-- Verify the roles
SELECT id, email, name, role FROM users WHERE email IN ('admin@demo.com', 'user@demo.com');

