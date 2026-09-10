import { Pool } from "pg";

const globalAvecPool = globalThis as typeof globalThis & {
  poolScouticket?: Pool;
};

export const pool =
  globalAvecPool.poolScouticket ??
  new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") globalAvecPool.poolScouticket = pool;
