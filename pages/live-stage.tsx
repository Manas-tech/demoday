import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Layout from '@components/layout';

const STREAM_END_TIME = new Date('2024-06-04T22:30:00Z').getTime(); // June 4, 2024, 3:30pm PDT

export default function LiveStage() {
  const [showHeader, setShowHeader] = useState(false);

  useEffect(() => {
    // Check if stream is over
    const checkStream = () => {
      if (Date.now() > STREAM_END_TIME) {
        setShowHeader(true);
      }
    };
    checkStream();
    const interval = setInterval(checkStream, 10000); // check every 10s
    return () => clearInterval(interval);
  }, []);

  if (showHeader) {
    return (
      <Layout>
        <Head>
          <title>Live Stage - Virtual Event</title>
        </Head>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h1>The stream has ended.</h1>
          <p>Thank you for attending!</p>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Live Stage - Virtual Event</title>
        <meta name="description" content="Live Stage streaming information and setup" />
      </Head>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'black',
          zIndex: 0
        }}
      >
        <iframe
          src="https://streamyard.com/watch/eXZAhAsNr5Rx?embed=true"
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay; fullscreen"
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
        />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  };
};
