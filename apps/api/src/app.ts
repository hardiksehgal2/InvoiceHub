import 'dotenv/config'
import Fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
} from '@fastify/type-provider-zod'
import cors from '@fastify/cors';
import sensible from '@fastify/sensible'
import prismaPlugin from './plugins/prisma.plugin'
import { invoiceRoutes } from './modules/invoices/invoices.routes'

import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'

const fastify = Fastify({ logger: true })

fastify.setValidatorCompiler(validatorCompiler)
fastify.setSerializerCompiler(serializerCompiler)

fastify.register(sensible)
fastify.register(prismaPlugin)
fastify.register(cors, {
   origin: [
    "http://localhost:3000",
    "http://localhost:5173",
  ],
  methods: ['GET', 'POST', 'PATCH'],
});

fastify.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Invoice API',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3001',
      },
    ],
  },

  transform: jsonSchemaTransform,
})

fastify.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

fastify.register(invoiceRoutes, {
  prefix: '/invoices',
})

const start = async () => {
  try {
    await fastify.listen({
      port: 3001,
      host: '0.0.0.0',
    })

    console.log('API running on http://localhost:3001')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()