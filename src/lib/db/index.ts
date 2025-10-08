import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Configuration PostgreSQL par défaut
const connectionString = process.env.POSTGRES_URL

if (!connectionString) {
  throw new Error('POSTGRES_URL environment variable is not set')
}

// Client PostgreSQL avec configuration de pooling
const client = postgres(connectionString, {
  prepare: false,
  max: 10, // Maximum 10 connections
  idle_timeout: 20,
  connect_timeout: 10,
})

// Instance Drizzle
export const db = drizzle(client, { schema })
console.log('🐘 Using PostgreSQL database')

// Export du schema pour les requêtes
export * from './schema'