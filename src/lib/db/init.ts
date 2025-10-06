import { db, groups, branches, userBranchRoles } from './index'
import { eq, and } from 'drizzle-orm'

const SGDF_BRANCHES = [
  'Farfadets',
  'Louveteaux',
  'Jeannettes',
  'Scouts',
  'Guides',
  'Pionniers-Caravelles',
  'Compagnons',
  'Groupe'
]

export async function initializeDatabase(adminUserId: string) {
  try {
    // Verifier si le groupe "La Guillotière" existe deja
    const existingGroup = await db.select()
      .from(groups)
      .where(eq(groups.slug, 'la-guillotiere'))
      .limit(1)

    let groupId: string

    if (existingGroup.length === 0) {
      // Creer le groupe "La Guillotière"
      const [newGroup] = await db.insert(groups)
        .values({
          name: 'La Guillotière',
          slug: 'la-guillotiere',
          adminUserId,
        })
        .returning()

      groupId = newGroup.id
      console.log('✅ Groupe "La Guillotière" créé')
    } else {
      groupId = existingGroup[0].id
      console.log('ℹ️ Groupe "La Guillotière" déjà existant')
    }

    // Verifier si les branches existent deja
    const existingBranches = await db.select()
      .from(branches)
      .where(eq(branches.groupId, groupId))

    if (existingBranches.length === 0) {
      // Creer toutes les branches pour ce groupe
      const branchData = SGDF_BRANCHES.map(branchName => ({
        name: branchName,
        groupId,
      }))

      await db.insert(branches)
        .values(branchData)

      console.log(`✅ ${SGDF_BRANCHES.length} branches créées pour "La Guillotière"`)
    } else {
      console.log(`ℹ️ ${existingBranches.length} branches déjà existantes pour "La Guillotière"`)
    }

    // Donner accès admin à toutes les branches à l'utilisateur initial
    const allBranches = await db.select()
      .from(branches)
      .where(eq(branches.groupId, groupId))

    for (const branch of allBranches) {
      const existingAccess = await db.select()
        .from(userBranchRoles)
        .where(and(
          eq(userBranchRoles.userId, adminUserId),
          eq(userBranchRoles.branchId, branch.id)
        ))
        .limit(1)

      if (existingAccess.length === 0) {
        await db.insert(userBranchRoles)
          .values({
            userId: adminUserId,
            branchId: branch.id,
            role: 'admin',
            grantedBy: adminUserId, // Auto-accordé
          })
      }
    }

    console.log('✅ Accès admin accordé à toutes les branches')
    console.log('🎉 Base de données initialisée avec succès!')

    return { groupId, branchCount: allBranches.length }

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error)
    throw error
  }
}

// Script pour migrer les utilisateurs existants depuis Clerk metadata
export async function migrateExistingUsers(clerkUserId: string, currentBranch?: string) {
  if (!currentBranch) return

  try {
    // Recuperer le groupe "La Guillotière"
    let group = await db.select()
      .from(groups)
      .where(eq(groups.slug, 'la-guillotiere'))
      .limit(1)

    // Si le groupe n'existe pas, le créer avec l'utilisateur courant comme admin
    if (group.length === 0) {
      console.log('⚠️ Groupe "La Guillotière" non trouvé, création automatique...')
      const [newGroup] = await db.insert(groups)
        .values({
          name: 'La Guillotière',
          slug: 'la-guillotiere',
          adminUserId: clerkUserId,
        })
        .returning()

      group = [newGroup]
      console.log('✅ Groupe "La Guillotière" créé automatiquement lors de la migration')
    }

    // Trouver la branche correspondante
    let branch = await db.select()
      .from(branches)
      .where(and(
        eq(branches.groupId, group[0].id),
        eq(branches.name, currentBranch))
      )
      .limit(1)

    // Si la branche n'existe pas, la créer
    if (branch.length === 0) {
      console.log(`⚠️ Branche "${currentBranch}" non trouvée, création automatique...`)
      const [newBranch] = await db.insert(branches)
        .values({
          name: currentBranch,
          groupId: group[0].id,
        })
        .returning()

      branch = [newBranch]
      console.log(`✅ Branche "${currentBranch}" créée automatiquement lors de la migration`)
    }

    // Verifier si l'accès existe deja
    const existingAccess = await db.select()
      .from(userBranchRoles)
      .where(and(
        eq(userBranchRoles.userId, clerkUserId),
        eq(userBranchRoles.branchId, branch[0].id)
      ))
      .limit(1)

    if (existingAccess.length === 0) {
      await db.insert(userBranchRoles)
        .values({
          userId: clerkUserId,
          branchId: branch[0].id,
          role: 'member', // Les utilisateurs existants deviennent membres
          grantedBy: clerkUserId, // Auto-accordé si l'utilisateur a créé le groupe
        })

      console.log(`✅ Accès migré pour l'utilisateur ${clerkUserId} vers la branche ${currentBranch}`)
    } else {
      console.log(`ℹ️ L'utilisateur ${clerkUserId} a déjà accès à la branche ${currentBranch}`)
    }

  } catch (error) {
    console.error('❌ Erreur lors de la migration de l\'utilisateur:', error)
    throw error
  }
}