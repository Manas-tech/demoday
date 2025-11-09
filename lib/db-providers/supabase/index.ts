/**
 * Copyright 2020 Vercel Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ConfUser } from '@lib/types';
import { createClient } from '@supabase/supabase-js';

// In-memory storage for when no database is configured
const memoryStore: {
  users: Record<string, ConfUser>;
  githubUsers: Record<string, any>;
} = {
  users: {},
  githubUsers: {}
};

const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    : undefined;

export async function getUserByUsername(username: string): Promise<ConfUser> {
  if (!supabase) {
    const user = Object.values(memoryStore.users).find(u => u.username === username);
    return user ?? {};
  }
  const { data } = await supabase
    .from('users')
    .select('name')
    .eq('username', username)
    .maybeSingle();

  return data ?? {};
}

export async function getUserById(id: string): Promise<ConfUser> {
  if (!supabase) {
    return memoryStore.users[id] ?? {};
  }
  const { data, error } = await supabase
    .from('users')
    .select('name, username, createdAt')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);

  return data ?? {};
}

export async function createUser(id: string, email: string, userData?: {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  titles?: string[];
}): Promise<ConfUser> {
  if (!supabase) {
    const createdAt = Date.now().toString();
    const user: ConfUser = {
      id,
      email,
      createdAt,
      name: undefined,
      username: undefined
    };
    if (userData?.firstName !== undefined) (user as any).firstname = userData.firstName;
    if (userData?.lastName !== undefined) (user as any).lastname = userData.lastName;
    if (userData?.companyName !== undefined) (user as any).companyname = userData.companyName;
    if (userData?.titles !== undefined) (user as any).titles = userData.titles;
    
    if (memoryStore.users[id]) {
      return memoryStore.users[id];
    }
    memoryStore.users[id] = user;
    return user;
  }

  const insertData: any = { id, email, role: 'user' };
  if (userData?.firstName !== undefined) insertData.firstname = userData.firstName;
  if (userData?.lastName !== undefined) insertData.lastname = userData.lastName;
  if (userData?.companyName !== undefined) insertData.companyname = userData.companyName;
  if (userData?.titles !== undefined) insertData.titles = userData.titles;
  
  // Set admin role if email matches admin@demo.com
  if (email === 'admin@demo.com') {
    insertData.role = 'admin';
    insertData.name = insertData.name || 'Admin User';
  }

  console.log('Attempting to insert user:', insertData);

  const { data, error } = await supabase
    .from('users')
    .insert(insertData)
    .select()
    .maybeSingle();

  if (error) {
    // If duplicate, fetch and return the existing user instead of throwing
    if (error.code === '23505') { // unique_violation
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      return existingUser ?? {};
    }
    throw new Error(error.message);
  }

  return data ?? {};
}

export async function createGitHubUser(user: any): Promise<string> {
  if (!supabase) {
    const token = `github_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    memoryStore.githubUsers[token] = { userData: user };
    // Auto-expire after 10 minutes
    setTimeout(() => {
      delete memoryStore.githubUsers[token];
    }, 10 * 60 * 1000);
    return token;
  }
  const { data, error } = await supabase.from('github_users').insert({ userData: user }).single();
  if (error) throw new Error(error.message);

  return (data as { id: string }).id;
}

export async function updateUserWithGitHubUser(id: string, token: string): Promise<ConfUser> {
  if (!supabase) {
    const githubUser = memoryStore.githubUsers[token];
    if (!githubUser) {
      throw new Error('Invalid or expired token');
    }
    const { login: username, name } = githubUser.userData;
    if (!username) {
      throw new Error('Invalid or expired token');
    }
    if (memoryStore.users[id]) {
      memoryStore.users[id].username = username;
      memoryStore.users[id].name = name || null;
    }
    return { username, name: name || null };
  }
  const { data } = await supabase.from('github_users').select('userData').eq('id', token).single();
  const { login: username, name } = data?.userData;
  if (!username) {
    throw new Error('Invalid or expired token');
  }

  const { error } = await supabase
    .from('users')
    .update({ username, name })
    .eq('id', id)
    .single();
  if (error) console.log(error.message);

  return { username, name };
}

export async function getUserEmailById(id: string): Promise<string | null> {
  if (!supabase) {
    return memoryStore.users[id]?.email ?? null;
  }
  const { data, error } = await supabase
    .from('users')
    .select('email')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.email ?? null;
}
