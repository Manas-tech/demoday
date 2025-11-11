# Performance Issues Causing Long Loading on Vercel

## Critical Issues

### 1. **Server-side Data Fetching Without Timeouts**
**Files:** `lib/cms-api.ts`
- `getAllSpeakers()`, `getAllSponsors()`, `getExpoPageSettings()` have no timeouts
- If Supabase is slow/unreachable, `getStaticProps` can hang indefinitely
- **Fix:** Add 5-10 second timeouts to all Supabase queries

### 2. **Inefficient Queries in getStaticProps**
**Files:** 
- `pages/expo/[slug].tsx:104` - Fetches ALL sponsors just to find one
- `pages/speakers/[slug].tsx:153` - Fetches ALL speakers just to find one
- **Fix:** Query by slug directly instead of fetching all records

### 3. **Complex Join Query Without Optimization**
**File:** `lib/cms-api.ts:81-87`
- Joins `company_links` for ALL companies without pagination
- **Fix:** Add limits, pagination, or optimize the query

### 4. **Sequential Client-side Fetches**
**Files:** 
- `pages/speakers.tsx:78-162` - Fetches speakers, then panelists image separately
- `pages/expo.tsx:82-179` - Fetches settings, then sponsors separately
- **Fix:** Parallelize these fetches using `Promise.all()`

### 5. **No Timeout on Server-side Supabase Client**
**File:** `lib/db-providers/supabase/server.ts`
- No connection/query timeouts configured
- **Fix:** Add timeout configuration to Supabase client

### 6. **Multiple Auth Checks Per Page**
**Files:** All protected pages (`speakers.tsx`, `expo.tsx`, `schedule.tsx`, etc.)
- Each page checks auth independently
- `getSession()` called multiple times
- **Fix:** Cache auth state or use a shared auth context

### 7. **getStaticPaths with fallback: 'blocking'**
**File:** `pages/expo/[slug].tsx:143-159`
- Fetches all sponsors on every request for new slugs
- **Fix:** Use `fallback: true` with client-side fetching, or optimize the query

### 8. **No Error Boundaries or Graceful Degradation**
- If Supabase fails, falls back to JSON but only after timeout
- **Fix:** Implement faster fallback mechanism

## Recommended Fix Priority

1. **HIGH:** Add timeouts to all Supabase queries (prevents hanging)
2. **HIGH:** Optimize `getStaticProps` queries (query by slug directly)
3. **MEDIUM:** Parallelize client-side fetches
4. **MEDIUM:** Add connection timeouts to server client
5. **LOW:** Optimize auth checks (cache session state)

