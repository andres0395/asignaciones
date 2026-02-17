import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { verifyAccessToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  const { id } = req.query;
  
  try {
    const payload = await verifyAccessToken(token);
    if (!payload || !payload.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      const asignacion = await prisma.asignacion.findUnique({
        where: { id: id as string },
        include: {
          presidente: { select: { id: true, fullName: true, email: true } },
          presidenteReunion: { select: { id: true, fullName: true, email: true } },
          lectorReunion: { select: { id: true, fullName: true, email: true } },
          oracionFinalVM: { select: { id: true, fullName: true, email: true } },
          oracionFinalPublica: { select: { id: true, fullName: true, email: true } },
          parent: { select: { id: true, name: true, semana: true } },
          children: {
            select: { id: true, name: true, semana: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
          },
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
          }
        }
      });

      if (!asignacion) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      return res.status(200).json(asignacion);
    }

    if (req.method === 'PUT') {
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

      // Check if assignment exists
      const existing = await prisma.asignacion.findUnique({
        where: { id: id as string }
      });

      if (!existing) {
        return res.status(404).json({ message: 'Assignment not found' });
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

      // Use transaction for complex update
      const updatedAsignacion = await prisma.$transaction(async (tx) => {
        // Delete existing items
        await tx.tesoroBibliaItem.deleteMany({ where: { asignacionId: id as string } });
        await tx.seamosMejoresItem.deleteMany({ where: { asignacionId: id as string } });
        await tx.nuestraVidaItem.deleteMany({ where: { asignacionId: id as string } });

        // Update assignment and create new items
        return await tx.asignacion.update({
          where: { id: id as string },
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
      });

      return res.status(200).json(updatedAsignacion);
    }

    if (req.method === 'DELETE') {
      // Check if assignment exists
      const existing = await prisma.asignacion.findUnique({
        where: { id: id as string },
        include: {
          _count: {
            select: {
              children: true,
              tesorosDeLaBiblia: true,
              seamosMejoresMaestros: true,
              nuestraVidaCristiana: true
            }
          }
        }
      });

      if (!existing) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      // Check for dependencies
      if (existing._count.children > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete assignment with child assignments',
          dependencies: {
            children: existing._count.children
          }
        });
      }

      // Delete assignment (cascade will handle related items)
      await prisma.asignacion.delete({
        where: { id: id as string }
      });

      return res.status(200).json({ message: 'Assignment deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Assignment API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}