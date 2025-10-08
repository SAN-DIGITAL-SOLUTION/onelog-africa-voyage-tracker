import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { missionSchema, MissionFormData } from '@/utils/validators';
import { Mission, MissionStatus, MissionPriority } from '@/types/mission';

interface MissionFormProps {
  initialValues?: Partial<Mission>;
  onSubmit: (data: MissionFormData) => void;
  loading?: boolean;
}

const statusOptions: MissionStatus[] = ['draft', 'published', 'ongoing', 'completed'];
const priorityOptions: MissionPriority[] = ['low', 'medium', 'high'];

export const MissionForm: React.FC<MissionFormProps> = ({ initialValues = {}, onSubmit, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<MissionFormData>({
    defaultValues: {
      title: '',
      client: '',
      status: 'draft',
      priority: 'medium',
      ...initialValues,
    },
    resolver: zodResolver(missionSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block font-medium">Titre *</label>
        <input className="input" {...register('title')} />
        {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}
      </div>
      <div>
        <label className="block font-medium">Client *</label>
        <input className="input" {...register('client')} />
        {errors.client && <p className="text-red-600 text-sm">{errors.client.message}</p>}
      </div>
      <div>
        <label className="block font-medium">Statut</label>
        <select className="input" {...register('status')}>
          {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block font-medium">Priorité</label>
        <select className="input" {...register('priority')}>
          {priorityOptions.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label className="block font-medium">Date de début</label>
        <input className="input" type="date" {...register('start_date')} />
      </div>
      <div>
        <label className="block font-medium">Date de fin</label>
        <input className="input" type="date" {...register('end_date')} />
      </div>
      <div>
        <label className="block font-medium">Description</label>
        <textarea className="input" rows={3} {...register('description')} />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </form>
  );
};
