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

import cn from 'classnames';
import styleUtils from './utils.module.css';
import styles from './hero.module.css';
import { BRAND_NAME, DATE, SITE_DESCRIPTION } from '@lib/constants';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { logUserEvent } from '@lib/log-event';
import useAuth from '@lib/hooks/use-auth';

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  const handleCtaClick = async () => {
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      await logUserEvent('watch_demo_day_live');
      window.location.href = '/live-stage';
    }
  };

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroLeft}>
        <div className={styles.heroStacked}>
          <p className={styles.heroStackedText}>FOUNDERS</p>
          <p className={styles.heroStackedText}>
            <span className={styles.orange}>INVESTING IN</span>
          </p>
          <p className={styles.heroStackedText}>FOUNDERS</p>
        </div>
        <p className={styles.heroSubheadline}>
          Join MARL Accelerator's Demo Day and meet the next generation of founders re-shaping the
          world of enterprise.
        </p>
        <button className={styles.heroCtaBtn} onClick={handleCtaClick} style={{ padding: '12px 24px', background: '#FF7B00', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '16px' }}>
          {isLoggedIn ? 'Watch Demo Day Live' : 'Tune In'}
        </button>
      </div>
      <div className={styles.heroRight}>
        <div className={styles.videoWrapper}>
          <video
            className={styles.heroVideo}
            src="https://marlvc.com/wp-content/uploads/2025/03/marl-map.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{ borderRadius: '16px', width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>
    </section>
  );
}
