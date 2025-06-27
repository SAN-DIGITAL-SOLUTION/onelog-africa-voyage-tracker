import { NextPage } from 'next';
import { UserRole } from '@/integrations/supabase/types';
import { ProtectedRoute } from '@/components/auth';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AdminDashboard: NextPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Tableau de bord Administrateur</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">Gérez les comptes utilisateurs et les autorisations</p>
              <Button className="mt-4">Gérer les utilisateurs</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">Visualisez les statistiques d'utilisation</p>
              <Button variant="outline" className="mt-4">Voir les statistiques</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Paramètres</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">Configurez les paramètres de l'application</p>
              <Button variant="outline" className="mt-4">Paramètres</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

// Protection de la route avec le rôle admin requis
export default ProtectedRoute(AdminDashboard, {
  allowedRoles: ['admin'],
  loadingComponent: <div>Vérification des autorisations...</div>,
});
