# Supabase Setup Guide

This guide will help you set up Supabase for the Demo Day platform.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A new Supabase project

## Setup Steps

### 1. Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Note down your project URL and anon key from Settings > API

### 2. Run Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the SQL script

### 3. Seed Mock Data

1. In the SQL Editor, copy and paste the contents of `supabase/seed-data.sql`
2. Run the SQL script

### 4. Create Mock Users

You need to create users in Supabase Auth. You can do this via:

**Option A: Supabase Dashboard**
1. Go to Authentication > Users
2. Click "Add user" > "Create new user"
3. Create these users:
   - Email: `user@demo.com`, Password: `user123`
   - Email: `admin@demo.com`, Password: `admin123`

**Option B: SQL (for testing)**
```sql
-- Note: This creates users but you'll need to set their passwords via the dashboard
-- After creating users, update their profiles:
UPDATE users SET role = 'user' WHERE email = 'user@demo.com';
UPDATE users SET role = 'admin' WHERE email = 'admin@demo.com';
```

### 5. Configure Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 6. Enable Email Authentication

1. Go to Authentication > Providers
2. Enable "Email" provider
3. Configure email templates if needed

### 7. Set Up Row Level Security (RLS)

The schema.sql file already includes RLS policies, but verify they're active:
- Users can only view/update their own profiles
- Speakers, companies, and company_links are publicly readable
- Only admin users can insert/update/delete speakers and companies

## Mock Data Created

### Speakers (4)
- Sarah Chen (Moderator @ TechVentures Capital)
- Michael Rodriguez (Panelist @ Innovation Partners)
- Emily Watson (Panelist @ Future Labs)
- David Kim (Panelist @ Scale Ventures)

### Companies (4)
- BuildFlow - AI-powered construction SaaS
- TaskSync - Project management without project managers
- CyberSafe Kids - Gamified cyber safety curriculum
- DataFlow Analytics - Enterprise data analytics platform

### Users
- user@demo.com (role: user)
- admin@demo.com (role: admin)

## Testing

1. Start your Next.js development server
2. Navigate to `/login`
3. Try logging in with:
   - `user@demo.com` / `user123`
   - `admin@demo.com` / `admin123`
4. Check that speakers and companies load from Supabase

## Troubleshooting

- **Users not appearing**: Make sure you've created users in Supabase Auth and updated their profiles
- **Data not loading**: Check that the schema and seed data SQL scripts ran successfully
- **Authentication errors**: Verify your environment variables are correct

