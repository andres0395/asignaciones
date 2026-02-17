import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { comparePassword, signAccessToken, signRefreshToken } from '../../../lib/auth';
import { serialize } from 'cookie';
import * as yup from 'yup';

const loginSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = await loginSchema.validate(req.body);

    const users = await prisma.user.findMany({ where: { email } });
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    let user = null;
    for (const u of users) {
      const isValid = await comparePassword(password, u.password);
      if (isValid) {
        user = u;
        break;
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = await signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = await signRefreshToken({ userId: user.id });

    // Store refresh token in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Set refresh token cookie
    res.setHeader(
      'Set-Cookie',
      serialize('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
    );

    return res.status(200).json({ accessToken, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (error: unknown) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).json({ message: error.errors.join(', ') });
    }
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
