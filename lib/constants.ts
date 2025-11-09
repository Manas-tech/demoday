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

export const SITE_URL = 'https://demoday.marlvc.com';
export const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_ORIGIN || new URL(SITE_URL).origin;
export const TWITTER_USER_NAME = 'AcceleratorMarl';
export const BRAND_NAME = 'MARL Accelerator';
export const SITE_NAME_MULTILINE = ['MARL', 'Accelerator'];
export const SITE_NAME = 'MARL Accelerator';
// export const META_DESCRIPTION =
//   'Demo Day platform for MARL Accelerator. Meet our founders, explore our portfolio, and join our community re-shaping the future.';
export const META_DESCRIPTION =
  'Discover Cohort 11 of MARL Accelerator\'s Demo Day: explore startups, meet founders, view profiles and resources, and connect with pioneering teams.';

export const SITE_DESCRIPTION =
  'FOUNDERS INVESTING IN FOUNDERS. Meet the next generation of startups at MARL Accelerator Demo Day.';
export const DATE = 'Demo Day: 4 June 2025';
export const SHORT_DATE = 'June 4th 2025';
export const FULL_DATE = 'June 4th 2025';
export const TWEET_TEXT = META_DESCRIPTION;
export const COOKIE = 'user-id';

// Remove process.env.NEXT_PUBLIC_... below and replace them with
// strings containing your own privacy policy URL and copyright holder name
export const LEGAL_URL = 'https://marlvc.com/legal';
export const COPYRIGHT_HOLDER = 'MARL Accelerator';

export const CODE_OF_CONDUCT =
  'https://marlvc.com/code-of-conduct';
export const REPO = 'https://github.com/marlvc/demo-day-platform';
export const MAILTO = 'mailto:accelerator@marlvc.com';
export const SAMPLE_TICKET_NUMBER = 1234;
export const NAVIGATION = [
  {
    name: 'Agenda',
    route: '/schedule'
  },
  {
    name: 'Speakers',
    route: '/speakers'
  },
  {
    name: 'Marl Companies',
    route: '/expo'
  }
];

export const ADMIN_NAVIGATION = {
  name: 'Content Management',
  route: '/admin/content'
};

export type TicketGenerationState = 'default' | 'loading';

export const BRAND_COLOR = '#FF7B00';
