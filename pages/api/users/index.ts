import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { verifyAccessToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = await verifyAccessToken(token);
      if (!payload || !payload.userId || payload.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const { fullName, email, password, phone, role } = req.body;

      // Basic validation
      if (!fullName || !email || !password || !phone || !role) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      const { hashPassword } = await import('../../../lib/auth');
      const hashedPassword = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          fullName,
          email,
          password: hashedPassword,
          phone,
          role,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;

      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  else if (req.method === 'GET') {

    const authHeader = req.headers.authorization;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 20); // Max 20

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = await verifyAccessToken(token);
      if (!payload || !payload.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (payload.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          select: { id: true, fullName: true, email: true, role: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          where: {
            id: {
              not: payload.userId,
            },
          },
        }),
        prisma.user.count({
          where: {
            id: {
              not: payload.userId,
            },
          },
        }),
      ]);

      return res.status(200).json({
        data: users,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }
  else return res.status(405).json({ message: 'Method not allowed' });
}
