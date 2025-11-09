import React, { useEffect, useRef } from 'react';
import { useHMSStore, selectLocalPeer } from '@100mslive/react-sdk';

// YouTube IFrame API types
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: {
      Player: new (
        elementId: string,
        options: {
          height: string | number;
          width: string | number;
          videoId: string;
          playerVars?: {
            autoplay?: number;
            controls?: number;
            modestbranding?: number;
            rel?: number;
          };
          events?: {
            onStateChange?: (event: { data: number }) => void;
          };
        }
      ) => {
        getCurrentTime: () => number;
        seekTo: (seconds: number, allowSeekAhead: boolean) => void;
        destroy: () => void;
      };
      PlayerState: {
        PLAYING: number;
      };
    };
  }
}

interface YouTubePlayerProps {
  videoId: string;
  timestamps?: { time: number; label: string }[];
  onTimeUpdate?: (currentTime: number) => void;
}

interface YouTubePlayerInstance {
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  destroy: () => void;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId, timestamps, onTimeUpdate }) => {
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const localPeer = useHMSStore(selectLocalPeer);
  const isBroadcaster = localPeer?.roleName === 'broadcaster';

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Initialize YouTube player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: isBroadcaster ? 1 : 0,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onStateChange: event => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              // Start time update interval when video starts playing
              const interval = setInterval(() => {
                if (playerRef.current && onTimeUpdate) {
                  onTimeUpdate(playerRef.current.getCurrentTime());
                }
              }, 1000);
              return () => clearInterval(interval);
            }
          }
        }
      });
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, isBroadcaster, onTimeUpdate]);

  return (
    <div className="w-full h-full relative">
      <div id="youtube-player" className="w-full h-full" />
      {timestamps && timestamps.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 p-2 rounded-lg text-white">
          <h3 className="text-sm font-semibold mb-2">Timestamps</h3>
          <div className="space-y-1">
            {timestamps.map((timestamp, index) => (
              <div
                key={index}
                className="text-xs cursor-pointer hover:text-gray-300"
                onClick={() => playerRef.current?.seekTo(timestamp.time, true)}
              >
                {timestamp.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer;
