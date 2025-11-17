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
        <iframe
          src="https://luma.com/embed/event/evt-8Kt2FuRzQ6DoKFb/simple"
          width="600"
          height="450"
          frameBorder="0"
          style={{ border: '1px solid #bfcbda88', borderRadius: '4px' }}
          allow="fullscreen; payment"
          aria-hidden="false"
          tabIndex={0}
        />
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  };
};
