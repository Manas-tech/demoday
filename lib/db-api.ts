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
import { SAMPLE_TICKET_NUMBER } from '@lib/constants';

import * as redisApi from './db-providers/redis';
import * as supabaseApi from './db-providers/supabase';

let dbApi: {
  createUser: (id: string, email: string) => Promise<ConfUser>;
  getUserByUsername: (username: string) => Promise<ConfUser>;
  getUserById: (id: string) => Promise<ConfUser>;
  createGitHubUser: (user: any) => Promise<string>;
  updateUserWithGitHubUser: (id: string, token: string) => Promise<ConfUser>;
  getUserEmailById: (id: string) => Promise<string | null>;
};

if (process.env.REDIS_PORT && process.env.REDIS_URL && process.env.EMAIL_TO_ID_SECRET) {
  dbApi = redisApi;
} else if (
  process.env.SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY &&
  process.env.EMAIL_TO_ID_SECRET
) {
  dbApi = supabaseApi;
} else {
  dbApi = {
    createUser: () => Promise.resolve({}),
    getUserByUsername: () => Promise.resolve({}),
    getUserById: () => Promise.resolve({}),
    createGitHubUser: () => Promise.resolve(''),
    updateUserWithGitHubUser: () => Promise.resolve({}),
    getUserEmailById: () => Promise.resolve(null)
  };
}

export async function createUser(id: string, email: string): Promise<ConfUser> {
  return dbApi.createUser(id, email);
}

export async function getUserByUsername(username: string): Promise<ConfUser> {
  return dbApi.getUserByUsername(username);
}

export async function getUserById(id: string): Promise<ConfUser> {
  return dbApi.getUserById(id);
}

export async function createGitHubUser(user: any): Promise<string> {
  return dbApi.createGitHubUser(user);
}

export async function updateUserWithGitHubUser(
  id: string,
  token: string
): Promise<ConfUser> {
  return dbApi.updateUserWithGitHubUser(id, token);
}

export async function getUserEmailById(id: string): Promise<string | null> {
  // @ts-ignore
  return dbApi.getUserEmailById(id);
}
