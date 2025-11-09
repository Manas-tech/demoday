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
import Tilt from 'vanilla-tilt';
import { useRef, useEffect, useState } from 'react';
import { UserData } from '@lib/hooks/use-conf-data';
import { TicketGenerationState } from '@lib/constants';
import styles from './ticket.module.css';
import styleUtils from './utils.module.css';
import TicketVisual from './ticket-visual';
import TicketActions from './ticket-actions';
import TicketCopy from './ticket-copy';

type Props = {
  username: UserData['username'];
  name: UserData['name'];
  sharePage?: boolean;
};

export default function Ticket({ username, name, sharePage }: Props) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [ticketGenerationState, setTicketGenerationState] =
    useState<TicketGenerationState>('default');
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (ticketRef.current && !window.matchMedia('(hover: none)').matches) {
      Tilt.init(ticketRef.current, {
        glare: true,
        max: 5,
        'max-glare': 0.16,
        'full-page-listening': true
      });
    }
  }, [ticketRef]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles['ticket-visual-wrapper']}>
        <div
          ref={ticketRef}
          className={cn(styles['ticket-visual'], styleUtils.appear, styleUtils['appear-fourth'])}
        >
          <TicketVisual
            username={username}
            name={name}
            ticketGenerationState={ticketGenerationState}
          />
        </div>
        {!sharePage && (
          <>
            {username ? (
              <div>
                <div className={styles['ticket-actions']}>
                  <TicketActions username={username} />
                </div>
                <div className={styles['ticket-copy']}>
                  <TicketCopy username={username} />
                </div>
              </div>
            ) : (
              <div className={styles['ticket-actions-placeholder']} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
