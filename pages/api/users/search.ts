import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { verifyAccessToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const payload = await verifyAccessToken(token);
    if (!payload || !payload.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 20); // Max 20 for search
      const skip = (page - 1) * limit;

      if (!query || query.trim().length < 2) {
        return res.status(200).json({
          data: [],
          meta: {
            total: 0,
            page: 1,
            limit,
            totalPages: 0
          }
        });
      }

      const searchTerm = query.trim();
      
      const where = {
        OR: [
          { fullName: { contains: searchTerm, mode: 'insensitive' as const } },
          { email: { contains: searchTerm, mode: 'insensitive' as const } }
        ]
      };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          },
          orderBy: [
            { fullName: 'asc' },
            { email: 'asc' }
          ]
        }),
        prisma.user.count({ where })
      ]);

      return res.status(200).json({
        data: users,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('User search API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}