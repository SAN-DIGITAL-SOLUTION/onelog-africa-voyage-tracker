import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Notifications Core - Web UI</title>
      </Head>
      <main style={{ padding: 32 }}>
        <h1>Notifications Core - Gestion des templates</h1>
        <ul>
          <li><Link href="/templates">Gérer les templates</Link></li>
          <li><Link href="/login">Connexion admin</Link></li>
        </ul>
        <p>Bienvenue sur l’interface de gestion des templates de notifications multicanal/multilingue.</p>
      </main>
    </div>
  );
}
