import { ArrowRightIcon } from '@100mslive/react-icons';
import HmsLogo from '@components/icons/icon-hms';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Button from '../Button';
import LinkButton from '../LinkButton';

const data = [
  {
    name: 'Broadcaster',
    roleName: 'broadcaster',
    role: 'broadcaster',
    desc: `This role is meant for the main broadcaster. Can share audio/video and control the session.`
  },
  {
    name: 'Co-Broadcaster',
    roleName: 'co-broadcaster',
    role: 'co-broadcaster',
    desc: `This role is for co-hosts who can also share audio/video and participate actively.`
  },
  {
    name: 'Viewer (Realtime)',
    roleName: 'viewer-realtime',
    role: 'viewer-realtime',
    desc: `This role is for viewers who want the lowest latency experience.`
  },
  {
    name: 'Viewer (Near Realtime)',
    roleName: 'viewer-near-realtime',
    role: 'viewer-near-realtime',
    desc: `This role is for viewers who can tolerate a slight delay for a more stable stream.`
  },
  {
    name: 'Viewer On Stage',
    roleName: 'viewer-on-stage',
    role: 'viewer-on-stage',
    desc: `This role is for viewers who are brought on stage to interact.`
  }
];

const DemoModal = () => {
  const [stage, setStage] = React.useState(``);
  const router = useRouter();
  React.useEffect(() => {
    if (router.query.slug) {
      setStage(router.query.slug as string);
    }
  }, [router]);
  return (
    <div className="font-sans">
      <p className="text-[32px] font-semibold my-0">Take your Webinar for a test drive</p>
      <p className="text-gray-300 text-[15px] my-0">
        We have setup a few profiles to make it easy for you or your team to experience each
        perspective. Join in one click or share access with anyone else.
      </p>
      <div>
        {data.map(m => (
          <div
            className="flex md:flex-row flex-col justify-between py-4"
            style={{ borderBottom: '1px solid #323232' }}
            key={`${m.roleName}-${m.name}`}
          >
            <div className="text-left max-w-xs">
              <span className={`badge ${m.roleName}-badge`}>{m.roleName}</span>
              <p className="text-gray-300 text-xs">{m.desc}</p>
            </div>
            <div className="flex items-center space-x-6">
              <CopyButton text={`${window.location.host}/stage/${stage || 'a'}?role=${m.role}`} />
              <LinkButton className="w-[200px]" href={`/stage/${stage || 'a'}?role=${m.role}`}>
                Join as {m.name} <ArrowRightIcon height={20} />
              </LinkButton>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-center mt-4 ">
          Powered by <HmsLogo />
        </div>
      </div>
    </div>
  );
};

export default DemoModal;

export const CopyButton = ({ text = '' }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    if (!copied) {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  };
  return (
    <div className="relative">
      {copied ? (
        <p className="absolute top-10 left-0 flex bg-gray-600 justify-center  rounded-lg w-48 p-2">
          Copied to clipboard!
        </p>
      ) : null}
      <Button variant="secondary" onClick={copy}>
        Invite
      </Button>
    </div>
  );
};
