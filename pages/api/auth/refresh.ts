import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../../lib/auth';
import { serialize } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { refreshToken: tokenFromCookie } = req.cookies;

  if (!tokenFromCookie) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  try {
    const payload = await verifyRefreshToken(tokenFromCookie);
    if (!payload || !payload.userId) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.refreshToken !== tokenFromCookie) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = await signAccessToken({ userId: user.id, role: user.role });
    const newRefreshToken = await signRefreshToken({ userId: user.id });

    // Update refresh token in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    // Set new refresh token cookie
    res.setHeader(
      'Set-Cookie',
      serialize('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
    );

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
}
