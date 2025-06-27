import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.setHeader('Set-Cookie', 'auth=1; HttpOnly; Path=/; Max-Age=3600');
    return res.status(200).json({ success: true });
  }
  res.status(401).json({ success: false, message: 'Unauthorized' });
}
