/* Exécution unique : CLERK_SECRET_KEY=... DATABASE_URL=... node scripts/migrate-clerk.mjs */
import pg from "pg";

const { Pool } = pg;
const cle = process.env.CLERK_SECRET_KEY;
const urlBaseDeDonnees = process.env.DATABASE_URL;
if (!cle || !urlBaseDeDonnees)
  throw new Error(
    "CLERK_SECRET_KEY et DATABASE_URL sont requis dans .env (ou dans l’environnement).",
  );
const pool = new Pool({ connectionString: urlBaseDeDonnees });
const entetes = { Authorization: `Bearer ${cle}` };

async function lister(chemin) {
  const elements = [];
  for (let decalage = 0; ; decalage += 100) {
    const reponse = await fetch(
      `https://api.clerk.com/v1/${chemin}?limit=100&offset=${decalage}`,
      { headers: entetes },
    );
    if (!reponse.ok) throw new Error(`Clerk ${chemin}: ${reponse.status}`);
    const resultat = await reponse.json();
    const page = Array.isArray(resultat) ? resultat : resultat.data;
    if (!Array.isArray(page))
      throw new Error(`Réponse Clerk inattendue pour ${chemin}`);
    elements.push(...page);
    if (page.length < 100) return elements;
  }
}
function slug(nom, id) {
  return (
    `${nom || "groupe"}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 70) + `-${id.slice(-8)}`
  );
}
function date(valeur) {
  return new Date(valeur || Date.now());
}

try {
  const utilisateurs = await lister("users");
  for (const utilisateur of utilisateurs) {
    const email = utilisateur.email_addresses?.find(
      (item) => item.id === utilisateur.primary_email_address_id,
    )?.email_address;
    if (!email) continue;
    await pool.query(
      `INSERT INTO "user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
      [
        utilisateur.id,
        [utilisateur.first_name, utilisateur.last_name]
          .filter(Boolean)
          .join(" ") || email,
        email,
        Boolean(
          utilisateur.email_addresses?.find(
            (item) => item.email_address === email,
          )?.verification?.status === "verified",
        ),
        utilisateur.image_url ?? null,
        date(utilisateur.created_at),
        date(utilisateur.updated_at),
      ],
    );
    for (const compte of utilisateur.external_accounts ?? []) {
      if (compte.provider !== "oauth_google" || !compte.provider_user_id)
        continue;
      await pool.query(
        `INSERT INTO account (id, "accountId", "providerId", "userId", "createdAt", "updatedAt") VALUES ($1,$2,'google',$3,$4,$5) ON CONFLICT DO NOTHING`,
        [
          compte.id,
          compte.provider_user_id,
          utilisateur.id,
          date(compte.created_at),
          date(compte.updated_at),
        ],
      );
    }
  }
  const organisations = await lister("organizations");
  for (const organisation of organisations) {
    await pool.query(
      `INSERT INTO organization (id, name, slug, "createdAt") VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
      [
        organisation.id,
        organisation.name,
        organisation.slug || slug(organisation.name, organisation.id),
        date(organisation.created_at),
      ],
    );
    const metadataPrivees = organisation.private_metadata ?? {};
    await pool.query(
      `INSERT INTO scouticket_group_data (organization_id, units, treasury_email, treasury_verification) VALUES ($1,$2::jsonb,$3,$4::jsonb) ON CONFLICT DO NOTHING`,
      [
        organisation.id,
        JSON.stringify(organisation.public_metadata?.units ?? []),
        metadataPrivees.treasuryEmail ?? "",
        JSON.stringify(
          metadataPrivees.treasuryVerification ?? { status: "pending" },
        ),
      ],
    );
    const membres = await lister(
      `organizations/${organisation.id}/memberships`,
    );
    for (const membership of membres) {
      const role = membership.role === "org:admin" ? "admin" : "member";
      await pool.query(
        `INSERT INTO member (id, "organizationId", "userId", role, "createdAt") VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
        [
          membership.id,
          organisation.id,
          membership.public_user_data?.user_id,
          role,
          date(membership.created_at),
        ],
      );
    }
  }
  console.log(
    `Migration terminée : ${utilisateurs.length} utilisateurs, ${organisations.length} organisations.`,
  );
} finally {
  await pool.end();
}
