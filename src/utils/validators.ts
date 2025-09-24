import { z } from 'zod';

export const missionSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  client: z.string().min(1, 'Le client est requis'),
  status: z.enum(['draft', 'published', 'ongoing', 'completed']),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
});

export type MissionFormData = z.infer<typeof missionSchema>;
