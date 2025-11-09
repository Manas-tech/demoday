import { ExitIcon, SpeakerIcon } from '@100mslive/react-icons';
import {
  useHMSActions,
  useHMSStore,
  selectDominantSpeaker,
  selectLocalPeer,
  selectPeersByRole
} from '@100mslive/react-sdk';
import UsersIcon from '@components/icons/icon-users';
import { useRouter } from 'next/router';
import React from 'react';
import { BRAND_NAME } from '@lib/constants';

const Header = () => {
  const router = useRouter();
  const peers = useHMSStore(selectPeersByRole('viewer'));
  const actions = useHMSActions();
  const leave = () => {
    try {
      actions.leave().then(() => router.push('/'));
    } catch (error) {
      console.log(error);
    }
  };
  const localPeer = useHMSStore(selectLocalPeer);
  const dominantPeer = useHMSStore(selectDominantSpeaker);
  return (
    <div
      className="flex items-center justify-between px-4 w-full bg-white border-b border-gray-200 shadow-sm"
      style={{ height: 'var(--header-height)' }}
    >
      <div className="flex flex-row items-center gap-2">
        <div className="block items-center">
          {localPeer?.roleName === 'viewer' ? (
            <button
              onClick={leave}
              className="text-gray-700 p-2 md:static w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer border border-gray-200"
            >
              <ExitIcon />
            </button>
          ) : null}
        </div>

        <div className="flex md:flex-row flex-col md:items-center align-end md:gap-2  gap-x-2">
          <div className="flex flex-row items-center align-bottom md:gap-2 gap-x-2">
            <p className="font-semibold md:text-2xl my-0 text-gray-900 text-sm md:leading-8 ">
              {BRAND_NAME}
            </p>
            <span className="flex md:px-2 px-1 font-semibold md:text-sm text-xs rounded-md items-center bg-brand-300 text-white ml-2">
              LIVE
            </span>
          </div>

          <div className="flex  ">
            <span className="text-md leading-5 text-gray-500">9:30 pm - 10:30 pm</span>
          </div>
        </div>
      </div>

      {dominantPeer ? (
        <div className="md:flex  hidden items-center space-x-2">
          <SpeakerIcon />
          <span className="text-gray-700 font-medium">{dominantPeer.name}</span>
        </div>
      ) : null}

      <div className="flex flex-row justify-end gap-4">
        <div className="flex items-center">
          <div className="rounded-3xl border border-gray-200 py-2 px-4 flex items-center font-normal text-sm leading-4 gap-2 bg-gray-100 text-gray-700">
            <UsersIcon /> <span>{peers.length}</span>
            <span className="md:block hidden"> watching</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
