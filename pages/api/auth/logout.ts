import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { serialize } from 'cookie';
import { verifyRefreshToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { refreshToken: tokenFromCookie } = req.cookies;

  if (tokenFromCookie) {
    try {
      const payload = await verifyRefreshToken(tokenFromCookie);
      if (payload && payload.userId) {
        // Invalidate in DB
        await prisma.user.update({
          where: { id: payload.userId },
          data: { refreshToken: null },
        }).catch(() => { }); // Maintain idempotency if user not found or already logged out
      }
    } catch (e) {
      console.error(e);
      // Ignore error if token is invalid, just clear cookie
    }
  }

  // Clear cookie
  res.setHeader(
    'Set-Cookie',
    serialize('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: -1,
      path: '/',
    })
  );

  return res.status(200).json({ message: 'Logged out successfully' });
}
