import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { changeMissionStatus } from '@/services/missions';
import { MissionStatus } from '@/types/mission';

const statusTransitions: Record<MissionStatus, MissionStatus[]> = {
  draft: ['published'],
  published: ['ongoing', 'draft'],
  ongoing: ['completed', 'published'],
  completed: [],
};

interface StatusSelectorProps {
  missionId: string;
  currentStatus: MissionStatus;
}

export const StatusSelector: React.FC<StatusSelectorProps> = ({ missionId, currentStatus }) => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = React.useState<MissionStatus>(currentStatus);
  const [error, setError] = React.useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (newStatus: MissionStatus) => changeMissionStatus(missionId, newStatus, 'admin'),
    onSuccess: () => {
      queryClient.invalidateQueries(['missions-detail', missionId]);
      setError(null);
    },
    onError: (e: any) => setError(e.message),
  });

  const allowed = statusTransitions[currentStatus] || [];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as MissionStatus;
    setSelected(next);
    mutation.mutate(next);
  };

  return (
    <div className="mb-4">
      <label className="block font-medium mb-1">Changer le statut</label>
      <select className="input" value={selected} onChange={handleChange} disabled={allowed.length === 0 || mutation.isLoading}>
        <option value={currentStatus}>{currentStatus} (actuel)</option>
        {allowed.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {mutation.isLoading && <span className="ml-2 text-xs text-gray-400">Mise à jour…</span>}
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </div>
  );
};
