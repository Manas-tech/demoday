import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '@components/layout';

export default function LiveStage() {
  return (
    <Layout>
      <Head>
        <title>Live Stage - Virtual Event</title>
        <meta name="description" content="Live Stage streaming information and setup" />
      </Head>
      <div style={{ padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
        <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#333', textAlign: 'center', maxWidth: '800px' }}>
          Demo Day will be streamed live on December 3rd at 1:00 PM PST. The live-stream will appear here once we go live.
        </p>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  };
};
