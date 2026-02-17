import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { hashPassword } from '../../../lib/auth';
import * as yup from 'yup';

const registerSchema = yup.object().shape({
  fullName: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
  phone: yup.string().required(),
  role: yup.string().oneOf(['admin', 'viewer']).default('viewer'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { fullName, email, password, phone, role } = await registerSchema.validate(req.body);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    const potentialDuplicates = await prisma.user.findMany({
      where: {
        email: trimmedEmail,
        phone: trimmedPhone,
      },
      select: { fullName: true }
    });

    const duplicateExists = potentialDuplicates.some(
      (u) => u.fullName.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (duplicateExists) {
      return res.status(409).json({ message: 'Usuario con el mismo nombre, email, y telefono ya existe' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        fullName: trimmedName,
        email: trimmedEmail,
        password: hashedPassword,
        phone: trimmedPhone,
        role: role as 'admin' | 'viewer',
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json(userWithoutPassword);
  } catch (error: unknown) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).json({ message: error.errors.join(', ') });
    }
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
