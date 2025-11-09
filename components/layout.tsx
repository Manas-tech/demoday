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

import Link from 'next/link';
import cn from 'classnames';
import { useRouter } from 'next/router';
import { SkipNavContent } from '@reach/skip-nav';
import { NAVIGATION, ADMIN_NAVIGATION } from '@lib/constants';
import styles from './layout.module.css';
import Logo from './icons/icon-logo';
import MobileMenu from './mobile-menu';
import Footer from './footer';
import React from 'react';
import { logUserEvent } from '@lib/log-event';
import useRole from '@lib/hooks/use-role';
import useAuth from '@lib/hooks/use-auth';

type Props = {
  children: React.ReactNode;
  className?: string;
  hideNav?: boolean;
  hideFooter?: boolean;
  layoutStyles?: any;
  isLive?: boolean;
};

export default function Layout({
  children,
  className,
  hideNav,
  hideFooter,
  layoutStyles,
  isLive = false
}: Props) {
  const router = useRouter();
  const activeRoute = router.asPath;
  const disableCta = ['/schedule', '/speakers', '/expo', '/jobs'];
  const { isAdmin } = useRole();
  const { isLoggedIn } = useAuth();

  // Handler for Tune In / Watch Demo Day Live button
  const handleTuneIn = async () => {
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      await logUserEvent('watch_demo_day_live');
      router.push('/live-stage');
    }
  };

  return (
    <>
      <div className={styles.background}>
        {!hideNav && (
          <header className={cn(styles.header)}>
            <div className={styles['header-logos']}>
              <MobileMenu key={router.asPath} />
              <Link href="/" className={styles.logo}>
                {/* eslint-disable-next-line */}
                <Logo />
              </Link>
            </div>
            <nav className={styles.headerNav}>
              {isLoggedIn && NAVIGATION.map(({ name, route }) => (
                <a
                  key={name}
                  href={route}
                  className={cn(styles.tab, {
                    [styles['tab-active']]: activeRoute.startsWith(route)
                  })}
                >
                  {name}
                </a>
              ))}
              {isLoggedIn && isAdmin && (
                <a
                  href={ADMIN_NAVIGATION.route}
                  className={cn(styles.tab, {
                    [styles['tab-active']]: activeRoute.startsWith(ADMIN_NAVIGATION.route)
                  })}
                >
                  {ADMIN_NAVIGATION.name}
                </a>
              )}
            </nav>
            <button className={styles.headerCtaBtn} onClick={handleTuneIn} style={{ padding: '8px 16px', background: '#FF7B00', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              {isLoggedIn ? 'Watch Demo Day Live' : 'Tune In'}
            </button>
          </header>
        )}
        <div className={styles.page}>
          <main className={styles.main} style={layoutStyles}>
            <SkipNavContent />
            <div className={cn(styles.full, className)}>{children}</div>
          </main>
          {!hideFooter && !activeRoute.startsWith('/stage') && <Footer />}
        </div>
      </div>
    </>
  );
}
