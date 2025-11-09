import { useHMSStore, selectLocalPeerRole } from '@100mslive/react-sdk';
import React from 'react';
import Chat from './Chat';
import Participants from './Participants';
import { Stage } from '@lib/types';
import * as Tabs from '@radix-ui/react-tabs';

type Props = {
  allStages: Stage[];
};

const Sidebar = ({ allStages }: Props) => {
  const localRole = useHMSStore(selectLocalPeerRole);
  return (
    <Tabs.Root asChild defaultValue="1">
      <div className="sidebar-container bg-white border-l border-gray-200 h-full">
        <Tabs.List className="w-full px-4 tabs flex">
          <Tabs.Trigger asChild value="1">
            <button className="w-1/2 h-[40px] text-[15px] font-medium rounded-l-md border border-gray-200 bg-white text-brand-300 data-[state=active]:bg-white data-[state=active]:text-brand-300 data-[state=active]:border-b-2 data-[state=active]:border-brand-300 data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-700 data-[state=inactive]:border-b-2 data-[state=inactive]:border-transparent">
              Chat
            </button>
          </Tabs.Trigger>

          {localRole?.name === 'viewer' || localRole?.name === 'invitee' ? null : (
            <Tabs.Trigger asChild value="2">
              <button className="w-1/2 h-[40px] text-[15px] font-medium rounded-r-md border border-gray-200 bg-white text-brand-300 data-[state=active]:bg-white data-[state=active]:text-brand-300 data-[state=active]:border-b-2 data-[state=active]:border-brand-300 data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-700 data-[state=inactive]:border-b-2 data-[state=inactive]:border-transparent">
                Participants
              </button>
            </Tabs.Trigger>
          )}
        </Tabs.List>
        <Tabs.Content asChild value="1">
          <Chat />
        </Tabs.Content>
        <Tabs.Content asChild value="2">
          <Participants />
        </Tabs.Content>
      </div>
    </Tabs.Root>
  );
};

export default Sidebar;
