import React from 'react';
import { DashboardGrid, CardVehicleStats, StatWidget } from '../../components/dashboard';
import { Layout } from '../../components/ui-system';
import { Truck, Activity, AlertTriangle, TrendingUp } from 'lucide-react';

const DashboardPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-neutral-light">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary-dark mb-2">
              Dashboard OneLog Africa
            </h1>
            <p className="text-neutral-medium">
              Vue d'ensemble de votre flotte et des opérations en temps réel
            </p>
          </div>

          <DashboardGrid>
            {/* Vehicle Statistics Card */}
            <CardVehicleStats />

            {/* Quick Stats Widgets */}
            <StatWidget
              title="Missions Actives"
              value={11}
              subtitle="En cours"
              icon={Activity}
              color="secondary"
              trend={{
                value: 8,
                direction: 'up',
                label: 'vs hier'
              }}
            />

            <StatWidget
              title="Taux de Ponctualité"
              value="94.2%"
              subtitle="Ce mois"
              icon={TrendingUp}
              color="success"
              trend={{
                value: 2,
                direction: 'up',
                label: 'vs mois dernier'
              }}
            />

            <StatWidget
              title="Alertes"
              value={5}
              subtitle="Nécessitent attention"
              icon={AlertTriangle}
              color="warning"
              trend={{
                value: 3,
                direction: 'down',
                label: 'vs semaine dernière'
              }}
            />

            <StatWidget
              title="Efficacité Carburant"
              value="87.5%"
              subtitle="Moyenne flotte"
              icon={Truck}
              color="primary"
              trend={{
                value: 1,
                direction: 'stable',
                label: 'vs trimestre'
              }}
            />

            <StatWidget
              title="Taux d'Utilisation"
              value="82.8%"
              subtitle="Capacité utilisée"
              icon={Activity}
              color="accent"
              trend={{
                value: 5,
                direction: 'up',
                label: 'vs mois dernier'
              }}
            />
          </DashboardGrid>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
