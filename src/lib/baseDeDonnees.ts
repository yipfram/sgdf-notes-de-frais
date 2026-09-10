import { Pool } from "pg";
import { journal } from "@/lib/logger";

const globalAvecPool = globalThis as typeof globalThis & {
  poolScouticket?: Pool;
};

export const pool =
  globalAvecPool.poolScouticket ??
  new Pool({ connectionString: process.env.DATABASE_URL });

pool.on("error", (erreur) => {
  journal.erreur("base_de_donnees.erreur_client_inactif", { erreur });
});

if (process.env.NODE_ENV !== "production") globalAvecPool.poolScouticket = pool;
