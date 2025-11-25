import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '@components/layout';

export default function LiveStage() {
  return (
    <Layout hideFooter layoutStyles={{ padding: 0, margin: 0, height: '100%' }}>
      <Head>
        <title>Live Stage - Virtual Event</title>
        <meta name="description" content="Live Stage streaming information and setup" />
      </Head>
      <div style={{ 
        width: '100%', 
        minHeight: 'calc(100vh - 112px)',
        position: 'relative',
        margin: '0',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px'
      }}>
        <div style={{ 
          width: '100%', 
          height: '0px', 
          position: 'relative', 
          paddingBottom: '56.25%'
        }}>
          <iframe 
            src="https://streamyard.com/watch/uTTkvTw85ebv?embed=true" 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            allow="autoplay; fullscreen" 
            style={{ 
              width: '100%', 
              height: '100%', 
              position: 'absolute', 
              left: '0px', 
              top: '0px',
              overflow: 'hidden',
              border: 'none'
            }}
            title="Live Stage Stream"
          />
        </div>
        <a
          href="https://streamyard.com/watch/uTTkvTw85ebv"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '14px 32px',
            background: '#FF7B00',
            color: '#fff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '18px',
            display: 'inline-block',
            transition: 'background 0.3s ease',
            boxShadow: '0 4px 12px rgba(255, 123, 0, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e66a00';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FF7B00';
          }}
        >
          Watch Stream
        </a>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  };
};
