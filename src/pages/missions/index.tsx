import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMissions, createMission, updateMission, deleteMission } from '@/services/missions';
import { Mission } from '@/types/mission';
import { MissionForm } from '@/components/MissionForm';

export default function MissionsPage() {
  const queryClient = useQueryClient();
  const { data: missions = [], isLoading, error } = useQuery({
    queryKey: ['missions'],
    queryFn: fetchMissions,
  });

  const [editing, setEditing] = React.useState<Mission | null>(null);
  const [showForm, setShowForm] = React.useState(false);

  const createMutation = useMutation({
    mutationFn: createMission,
    onSuccess: () => {
      queryClient.invalidateQueries(['missions']);
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...values }: Mission) => updateMission(id!, values),
    onSuccess: () => {
      queryClient.invalidateQueries(['missions']);
      setEditing(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMission(id),
    onSuccess: () => queryClient.invalidateQueries(['missions']),
  });

  const handleCreate = (data: any) => createMutation.mutate(data);
  const handleEdit = (mission: Mission) => {
    setEditing(mission);
    setShowForm(true);
  };
  const handleUpdate = (data: any) => {
    if (editing) updateMutation.mutate({ ...editing, ...data });
  };
  const handleDelete = (id: string) => {
    if (window.confirm('Supprimer cette mission ?')) deleteMutation.mutate(id);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Missions</h1>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
          Créer une mission
        </button>
      </div>
      {showForm && (
        <div className="mb-8">
          <MissionForm
            initialValues={editing || {}}
            onSubmit={editing ? handleUpdate : handleCreate}
            loading={createMutation.isLoading || updateMutation.isLoading}
          />
        </div>
      )}
      {isLoading ? (
        <p>Chargement…</p>
      ) : error ? (
        <p className="text-red-600">Erreur : {error.message}</p>
      ) : (
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Client</th>
              <th>Statut</th>
              <th>Priorité</th>
              <th>Début</th>
              <th>Fin</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {missions.map((mission) => (
              <tr key={mission.id}>
                <td>{mission.title}</td>
                <td>{mission.client}</td>
                <td>{mission.status}</td>
                <td>{mission.priority}</td>
                <td>{mission.start_date || '-'}</td>
                <td>{mission.end_date || '-'}</td>
                <td>
                  <button className="btn btn-xs mr-2" onClick={() => handleEdit(mission)}>Éditer</button>
                  <button className="btn btn-xs btn-danger" onClick={() => handleDelete(mission.id!)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
