import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const nomFichierCourant = fileURLToPath(import.meta.url);
const dossierMigrationsParDefaut = join(
  dirname(nomFichierCourant),
  "..",
  "sql",
);

export async function listerMigrations(dossier = dossierMigrationsParDefaut) {
  const noms = await readdir(dossier);
  const nomsMigrations = noms
    .filter((nom) => /^\d+_.+\.sql$/.test(nom))
    .sort((a, b) => a.localeCompare(b, "en"));

  return Promise.all(
    nomsMigrations.map(async (nom) => ({
      nom,
      contenu: await readFile(join(dossier, nom), "utf8"),
    })),
  );
}

export async function migrerBaseDeDonnees(client, migrations) {
  const tablesBetterAuth = await client.query(`
    SELECT
      to_regclass('public."user"') IS NOT NULL AS utilisateur,
      to_regclass('public.organization') IS NOT NULL AS organisation
  `);
  const tablesAbsentes = [
    !tablesBetterAuth.rows[0]?.utilisateur && '"user"',
    !tablesBetterAuth.rows[0]?.organisation && "organization",
  ].filter(Boolean);

  if (tablesAbsentes.length > 0) {
    throw new Error(
      `Les tables Better Auth suivantes sont absentes : ${tablesAbsentes.join(", ")}. Exécutez d’abord \`pnpm auth:migrate\`.`,
    );
  }

  await client.query(`
    CREATE TABLE IF NOT EXISTS scouticket_migrations (
      nom TEXT PRIMARY KEY,
      appliquee_le TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  const dejaAppliquees = await client.query(
    "SELECT nom FROM scouticket_migrations",
  );
  const nomsDejaAppliques = new Set(
    dejaAppliquees.rows.map((ligne) => ligne.nom),
  );
  const migrationsAAppliquer = migrations.filter(
    (migration) => !nomsDejaAppliques.has(migration.nom),
  );

  for (const migration of migrationsAAppliquer) {
    try {
      await client.query("BEGIN");
      await client.query(migration.contenu);
      await client.query(
        "INSERT INTO scouticket_migrations (nom) VALUES ($1)",
        [migration.nom],
      );
      await client.query("COMMIT");
    } catch (erreur) {
      await client.query("ROLLBACK");
      throw new Error(`Échec de la migration ${migration.nom}`, {
        cause: erreur,
      });
    }
  }

  return migrationsAAppliquer.map((migration) => migration.nom);
}

async function principal() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL est requise pour exécuter les migrations.");
  }

  const { Pool } = pg;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const migrations = await listerMigrations();
    const appliquees = await migrerBaseDeDonnees(pool, migrations);
    console.log(
      appliquees.length === 0
        ? "Aucune migration Scouticket à appliquer."
        : `Migrations Scouticket appliquées : ${appliquees.join(", ")}.`,
    );
  } finally {
    await pool.end();
  }
}

if (process.argv[1] === nomFichierCourant) {
  principal().catch((erreur) => {
    console.error(erreur);
    process.exitCode = 1;
  });
}
