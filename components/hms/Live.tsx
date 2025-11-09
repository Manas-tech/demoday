import React, { useState } from 'react';
import Footer from './Footer';
import Header from './Header';
import List from './Conference';
import toast, { Toaster } from 'react-hot-toast';
import { useHMSNotifications, useHMSStore, selectLocalPeer } from '@100mslive/react-sdk';
import DemoModal from './DemoModal';
import YouTubePlayer from './YouTubePlayer';

// Example timestamps - replace with your actual timestamps
const VIDEO_TIMESTAMPS = [
  { time: 0, label: 'Introduction' },
  { time: 120, label: 'Company 1' },
  { time: 300, label: 'Company 2' },
  { time: 480, label: 'Company 3' }
  // Add more timestamps as needed
];

/**
 * Live Video/Audio component
 */
const Live = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const localPeer = useHMSStore(selectLocalPeer);
  const isBroadcaster = localPeer?.roleName === 'broadcaster';

  return (
    <div className="flex justify-center items-center relative flex-col h-full">
      <Notification />
      <Header />
      {isVideoPlaying ? (
        <div className="w-full h-[calc(100vh-200px)]">
          <YouTubePlayer
            videoId="NxLEnAAN6N4" // Replace with your video ID
            timestamps={VIDEO_TIMESTAMPS}
            onTimeUpdate={time => {
              // Handle time updates if needed
              console.log('Current time:', time);
            }}
          />
        </div>
      ) : (
        <List />
      )}
      <Footer
        onVideoToggle={() => setIsVideoPlaying(!isVideoPlaying)}
        isVideoPlaying={isVideoPlaying}
      />
      {process.env.NEXT_PUBLIC_LIVE_DEMO === 'true' ? <DemoModal /> : null}
    </div>
  );
};

export default Live;

const Notification = () => {
  const notification = useHMSNotifications();
  React.useEffect(() => {
    if (!notification) {
      return;
    }
    if (notification.type === 'RECONNECTING') {
      toast.error(
        'You are offline for now. while we try to reconnect, please check your internet connection.'
      );
    }
    if (notification.type === 'RECONNECTED') {
      toast.success('You are now connected.');
    }
    if (notification.type === 'ERROR') {
      toast.error(`Error: ${notification.data.message}`);
    }
  }, [notification]);

  return (
    <Toaster
      position="bottom-left"
      toastOptions={{
        style: {
          background: 'var(--accents-7)',
          color: 'var(--accents-1)'
        }
      }}
    />
  );
};
