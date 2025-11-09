import {
  useAVToggle,
  useHMSActions,
  useHMSStore,
  selectIsLocalScreenShared,
  selectLocalPeerRole,
  selectIsAllowedToPublish,
  selectLocalPeer
} from '@100mslive/react-sdk';
import {
  VideoOffIcon,
  VideoOnIcon,
  MicOffIcon,
  MicOnIcon,
  ShareScreenIcon,
  SettingsIcon
} from '@100mslive/react-icons';
import React from 'react';
import ControlButton from './ControlButton';
import LeaveDialog from './LeaveDialog';
import SettingDialog from './SettingDialog';

interface FooterProps {
  onVideoToggle: () => void;
  isVideoPlaying: boolean;
}

const Footer: React.FC<FooterProps> = ({ onVideoToggle, isVideoPlaying }) => {
  const role = useHMSStore(selectLocalPeerRole);
  const isAllowedToPublish = useHMSStore(selectIsAllowedToPublish);
  const { isLocalAudioEnabled, isLocalVideoEnabled, toggleAudio, toggleVideo } = useAVToggle();
  const actions = useHMSActions();
  const startScreenshare = async () => {
    try {
      await actions.setScreenShareEnabled(true);
    } catch (error) {
      console.log('Error: ', error);
    }
  };
  const isLocalScreenShare = useHMSStore(selectIsLocalScreenShared);
  const localPeer = useHMSStore(selectLocalPeer);
  const isBroadcaster = localPeer?.roleName === 'broadcaster';

  return (
    <div
      className="w-full hidden md:flex items-center justify-center space-x-5"
      style={{ height: 'calc(var(--header-height) * 1.2)' }}
    >
      {isAllowedToPublish.audio ? (
        <ControlButton text="Mic" active={isLocalAudioEnabled} onClick={toggleAudio}>
          {isLocalAudioEnabled ? <MicOnIcon /> : <MicOffIcon />}
        </ControlButton>
      ) : null}
      {isBroadcaster && (
        <button
          onClick={onVideoToggle}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isVideoPlaying ? (
            <>
              <VideoOffIcon />
              <span>Stop Video</span>
            </>
          ) : (
            <>
              <VideoOnIcon />
              <span>Play Video</span>
            </>
          )}
        </button>
      )}
      {isAllowedToPublish.screen ? (
        <ControlButton text="Screen share" active={isLocalScreenShare} onClick={startScreenshare}>
          <ShareScreenIcon />
        </ControlButton>
      ) : null}

      <SettingDialog>
        <ControlButton text="Setting" onClick={() => {}}>
          <SettingsIcon />
        </ControlButton>
      </SettingDialog>
      {role?.name !== 'viewer' ? <LeaveDialog /> : null}
    </div>
  );
};

export default Footer;
