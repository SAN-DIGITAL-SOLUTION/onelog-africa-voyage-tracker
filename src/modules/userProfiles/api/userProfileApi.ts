import type { NextApiRequest, NextApiResponse } from 'next';
import * as userProfileService from '../services/userProfileService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  switch (method) {
    case 'GET': {
      const { userId } = req.query;
      if (userId) {
        const profile = await userProfileService.getUserProfile(userId as string);
        if (!profile) return res.status(404).json({ error: 'User not found' });
        return res.status(200).json(profile);
      } else {
        const profiles = await userProfileService.listUserProfiles();
        return res.status(200).json(profiles);
      }
    }
    case 'PUT': {
      const { userId, updates } = req.body;
      if (!userId || !updates) return res.status(400).json({ error: 'Missing parameters' });
      const updated = await userProfileService.updateUserProfile(userId, updates);
      if (!updated) return res.status(404).json({ error: 'User not found or update failed' });
      return res.status(200).json(updated);
    }
    case 'POST': {
      // Not implemented (user creation handled by Supabase Auth)
      return res.status(405).json({ error: 'Not implemented' });
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
