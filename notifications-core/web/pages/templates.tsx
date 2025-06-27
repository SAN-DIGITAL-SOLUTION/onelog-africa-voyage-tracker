import Link from 'next/link';
import { GetServerSideProps } from 'next';

export default function Templates() {
  // Placeholder pour la liste des templates (à compléter avec API/backend réel)
  return (
    <div style={{ padding: 32 }}>
      <h2>Gestion des templates</h2>
      <p>Ici tu pourras uploader, éditer, prévisualiser et tester tes templates de notification.</p>
      {/* Liste, upload, édition à implémenter */}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const cookies = req.headers.cookie || '';
  if (!cookies.split(';').some(c => c.trim() === 'auth=1')) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  return { props: {} };
};
