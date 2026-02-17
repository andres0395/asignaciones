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
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const search = req.query.search as string;
      const skip = (page - 1) * limit;

      const where = search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { semana: { contains: search, mode: 'insensitive' as const } }
        ]
      } : {};

      const [asignaciones, total] = await Promise.all([
        prisma.asignacion.findMany({
          where,
          skip,
          take: limit,
          include: {
            presidente: { select: { id: true, fullName: true, email: true } },
            presidenteReunion: { select: { id: true, fullName: true, email: true } },
            lectorReunion: { select: { id: true, fullName: true, email: true } },
            oracionFinalVM: { select: { id: true, fullName: true, email: true } },
            oracionFinalPublica: { select: { id: true, fullName: true, email: true } },
            tesorosDeLaBiblia: {
              include: {
                encargado: { select: { id: true, fullName: true, email: true } }
              },
              orderBy: { createdAt: 'asc' }
            },
            seamosMejoresMaestros: {
              include: {
                encargado: { select: { id: true, fullName: true, email: true } }
              },
              orderBy: { createdAt: 'asc' }
            },
            nuestraVidaCristiana: {
              include: {
                encargado: { select: { id: true, fullName: true, email: true } }
              },
              orderBy: { createdAt: 'asc' }
            },
            _count: {
              select: {
                tesorosDeLaBiblia: true,
                seamosMejoresMaestros: true,
                nuestraVidaCristiana: true,
                children: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.asignacion.count({ where })
      ]);

      return res.status(200).json({
        data: asignaciones,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    }

    if (req.method === 'POST') {
      const {
        name,
        semana,
        month,
        parentId,
        presidenteId,
        presidenteReunionId,
        lectorReunionId,
        oracionFinalVMId,
        oracionFinalPublicaId,
        tesorosDeLaBiblia,
        seamosMejoresMaestros,
        nuestraVidaCristiana
      } = req.body;

      // Validation
      if (!name || !semana || !month) {
        return res.status(400).json({ message: 'Name, semana and month are required' });
      }

      // Validate array items have at least one element
      if (tesorosDeLaBiblia && (!Array.isArray(tesorosDeLaBiblia) || tesorosDeLaBiblia.length === 0)) {
        return res.status(400).json({ message: 'At least one tesoro de la biblia item is required' });
      }
      
      if (seamosMejoresMaestros && (!Array.isArray(seamosMejoresMaestros) || seamosMejoresMaestros.length === 0)) {
        return res.status(400).json({ message: 'At least one seamos mejores maestros item is required' });
      }
      
      if (nuestraVidaCristiana && (!Array.isArray(nuestraVidaCristiana) || nuestraVidaCristiana.length === 0)) {
        return res.status(400).json({ message: 'At least one nuestra vida cristiana item is required' });
      }

      const asignacion = await prisma.asignacion.create({
        data: {
          name: name.trim(),
          semana: semana.trim(),
          month,
          parentId,
          presidenteId,
          presidenteReunionId,
          lectorReunionId,
          oracionFinalVMId,
          oracionFinalPublicaId,
          tesorosDeLaBiblia: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            create: tesorosDeLaBiblia?.map((item: any) => ({
              name: item.name.trim(),
              minutos: parseInt(item.minutos) || 0,
              encargadoId: item.encargadoId
            })) || []
          },
          seamosMejoresMaestros: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            create: seamosMejoresMaestros?.map((item: any) => ({
              name: item.name.trim(),
              minutos: parseInt(item.minutos) || 0,
              encargadoId: item.encargadoId
            })) || []
          },
          nuestraVidaCristiana: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            create: nuestraVidaCristiana?.map((item: any) => ({
              name: item.name.trim(),
              minutos: parseInt(item.minutos) || 0,
              encargadoId: item.encargadoId
            })) || []
          }
        },
        include: {
          presidente: { select: { id: true, fullName: true, email: true } },
          presidenteReunion: { select: { id: true, fullName: true, email: true } },
          lectorReunion: { select: { id: true, fullName: true, email: true } },
          oracionFinalVM: { select: { id: true, fullName: true, email: true } },
          oracionFinalPublica: { select: { id: true, fullName: true, email: true } },
          tesorosDeLaBiblia: {
            include: {
              encargado: { select: { id: true, fullName: true, email: true } }
            }
          },
          seamosMejoresMaestros: {
            include: {
              encargado: { select: { id: true, fullName: true, email: true } }
            }
          },
          nuestraVidaCristiana: {
            include: {
              encargado: { select: { id: true, fullName: true, email: true } }
            }
          }
        }
      });

      return res.status(201).json(asignacion);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Assignment API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}