import React from 'react';
import cn from 'classnames';
import styleUtils from '../utils.module.css';
import styles from '../conf-entry.module.css';
import { PreviewScreen } from './preview';
import { useHMSActions, parsedUserAgent } from '@100mslive/react-sdk';
import * as Dialog from '@radix-ui/react-dialog';
import Button from './Button';
import { ArrowRightIcon } from '@100mslive/react-icons';
import { useRouter } from 'next/router';
import { BRAND_COLOR } from '@lib/constants';

interface Props {
  token: string;
  role: string;
}

const Join: React.FC<Props> = ({ token, role }) => {
  const isMobile = isMobileDevice();
  return (
    <div className={cn(styles.container, styleUtils.appear, styleUtils['appear-first'])}>
      {isMobile && role !== 'viewer-realtime' ? <MobileRoleDialog /> : null}
      {token ? (
        <>
          {' '}
          {role === 'viewer-realtime' ? (
            <ViewersJoin token={token} />
          ) : (
            <>{isMobile ? null : <PreviewScreen token={token} />}</>
          )}
        </>
      ) : null}
    </div>
  );
};

export default Join;

const ViewersJoin: React.FC<{ token: string }> = ({ token }) => {
  const [name, setName] = React.useState(localStorage.getItem('name') || '');
  const actions = useHMSActions();
  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    actions.join({
      userName: name || 'David',
      authToken: token,
      initEndpoint: process.env.NEXT_PUBLIC_HMS_INIT_PEER_ENPOINT || undefined,
      rememberDeviceSelection: true
    });
  };
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold" style={{ color: BRAND_COLOR }}>
        Enter your name to continue.
      </h1>
      <p className="my-0 text-gray-700 text-sm">
        This name will be visible to other participants once you join the stage
      </p>
      <form onSubmit={e => joinRoom(e)} className="mt-12 md:space-x-4">
        <input
          maxLength={20}
          value={name}
          onChange={e => {
            setName(e.target.value);
            localStorage.setItem('name', e.target.value);
          }}
          required
          className="p-4 w-80 text-md bg-white text-gray-900 border border-gray-300 rounded-lg placeholder:text-gray-400 focus:outline-none focus:bg-gray-100 focus:ring-2 focus:ring-orange-500"
          placeholder="Enter your name to join the event"
          type="text"
        />
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 px-4 py-4 rounded-lg cursor-pointer md:mt-0 mt-4 w-80 md:w-20 transition-colors duration-200"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          Join
        </button>
      </form>
    </div>
  );
};

export function isMobileDevice() {
  const device = parsedUserAgent.getDevice();
  return device && device.type === 'mobile';
}

const MobileRoleDialog = () => {
  const [stage, setStage] = React.useState(``);
  const router = useRouter();
  React.useEffect(() => {
    if (router.query.slug) {
      setStage(router.query.slug as string);
    }
  }, [router]);
  return (
    <Dialog.Root open={true}>
      <Dialog.Overlay className="fixed inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
      <Dialog.Content className="dialog-content bg-gray-700 md:w-96 w-[95%] rounded-lg text-center dialog-animation">
        <h3 style={{ color: BRAND_COLOR }}>Joining as a speaker is not supported on mobile</h3>
        <p className="text-xs text-gray-200 mt-4">
          We have setup a few profiles to make it easy for you or your team to experience each
          perspective. Join in one click or share access with anyone else.
        </p>
        <div className="w-full flex justify-center mt-4">
          <a href={`/stage/${stage || 'a'}?role=viewer-realtime`}>
            <Button>
              Join as a Guest Instead <ArrowRightIcon />
            </Button>
          </a>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
