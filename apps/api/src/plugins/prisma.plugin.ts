// apps\api\src\plugins\prisma.plugin.ts
import 'dotenv/config'
import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { FastifyInstance } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

async function prismaPlugin(fastify: FastifyInstance) {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
  })
  const prisma = new PrismaClient({ adapter })
  await prisma.$connect()
  fastify.decorate('prisma', prisma)
  fastify.addHook('onClose', async () => {
    await prisma.$disconnect()
  })
}

export default fp(prismaPlugin)