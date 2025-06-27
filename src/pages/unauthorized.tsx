import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/Layout';

export default function UnauthorizedPage() {
  return (
    <Layout>
      <Head>
        <title>Accès non autorisé - OneLog Africa</title>
        <meta name="description" content="Vous n'avez pas les autorisations nécessaires pour accéder à cette page" />
      </Head>
      
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-red-600">403</h1>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">
            Accès non autorisé
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Désolé, vous n'avez pas les autorisations nécessaires pour accéder à cette page.
          </p>
          <div className="mt-8">
            <Link href="/" passHref>
              <Button>
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
