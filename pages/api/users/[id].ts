import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { verifyAccessToken } from '../../../lib/auth';
import * as bcrypt from 'bcrypt';

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

    // Check if requester is admin
    const requester = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const userId = req.query.id as string;

    if (req.method === 'GET') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, fullName: true, email: true, phone: true, role: true },
      });
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.status(200).json(user);

    } else if (req.method === 'PUT') {
      const { password, ...data } = req.body;

      let updateData = { ...data };
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData = { ...updateData, password: hashedPassword };
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: { id: true, fullName: true, email: true, role: true },
      });
      return res.status(200).json(user);

    } else if (req.method === 'DELETE') {
      // Prevent deleting self (optional but good practice)
      if (userId === requester.id) {
        return res.status(400).json({ message: 'Cannot delete yourself' });
      }

      await prisma.user.delete({ where: { id: userId } });
      return res.status(200).json({ message: 'User deleted' });

    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
