import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export async function memoriesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify()
  })

  app.get('/memories', async (request) => {
    const { sub } = request.user

    const memories = await prisma.memory.findMany({
      where: {
        userId: sub,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return memories.map((memorie) => ({
      id: memorie.id,
      coverUrl: memorie.coverUrl,
      excerpt: memorie.content.substring(0, 115).concat('...'),
      createdAt: memorie.createdAt,
    }))
  })

  app.get('/memories/:id', async (request, reply) => {
    const { sub } = request.user
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const memory = await prisma.memory.findUniqueOrThrow({ where: { id } })

    if (!memory.isPublic && memory.userId !== sub) {
      return reply.status(401).send({ error: 'Invalid user' })
    }

    return memory
  })

  app.post('/memories', async (request) => {
    const { sub } = request.user
    const memorySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })

    const { content, coverUrl, isPublic } = memorySchema.parse(request.body)

    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: sub,
      },
    })

    return memory
  })

  app.put('/memories/:id', async (request, reply) => {
    const { sub } = request.user
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const memorySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })

    const { id } = paramsSchema.parse(request.params)
    const { content, coverUrl, isPublic } = memorySchema.parse(request.body)

    let memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (!memory.isPublic && memory.userId !== sub) {
      return reply.status(401).send({ error: 'Invalid user' })
    }

    memory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        content,
        coverUrl,
        isPublic,
      },
    })

    return memory
  })

  app.delete('/memories/:id', async (request, reply) => {
    const { sub } = request.user
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (!memory.isPublic && memory.userId !== sub) {
      return reply.status(401).send({ error: 'Invalid user' })
    }

    await prisma.memory.delete({ where: { id } })
  })
}
