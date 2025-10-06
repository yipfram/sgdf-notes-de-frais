import { pgTable, text, timestamp, boolean, uuid, jsonb } from 'drizzle-orm/pg-core'

// Groups (ex: "La Guillotière", "Le Bourg", etc.)
export const groups = pgTable('groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  adminUserId: text('admin_user_id').notNull(), // Clerk user ID
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Branches (ex: "Louveteaux", "Scouts", etc.) - maintenant spécifiques à un groupe
export const branches = pgTable('branches', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  groupId: uuid('group_id').notNull().references(() => groups.id),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

// User-Branch-Role relationships (multi-branche avec rôles)
export const userBranchRoles = pgTable('user_branch_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(), // Clerk user ID
  branchId: uuid('branch_id').notNull().references(() => branches.id),
  role: text('role').notNull(), // 'admin' | 'member' | 'viewer'
  isActive: boolean('is_active').default(true),
  grantedBy: text('granted_by'), // Clerk user ID of who granted access
  grantedAt: timestamp('granted_at').defaultNow(),
  lastAccessAt: timestamp('last_access_at'),
})

// User sessions pour suivre la branche active
export const userSessions = pgTable('user_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  activeBranchId: uuid('active_branch_id').references(() => branches.id),
  lastSeen: timestamp('last_seen').defaultNow(),
  deviceInfo: jsonb('device_info'),
})

// Demandes d'accès en attente de validation
export const demandeAcces = pgTable('demande_acces', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  groupId: uuid('group_id').notNull().references(() => groups.id),
  branchId: uuid('branch_id').notNull().references(() => branches.id),
  userId: text('user_id'), // Clerk user ID (nullable until sign-up)
  statut: text('statut').notNull().default('en_attente'), // 'en_attente' | 'approuve' | 'refuse'
  message: text('message'), // Message optionnel du demandeur
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Validations des demandes d'accès par les trésoriers
export const validations = pgTable('validations', {
  id: uuid('id').primaryKey().defaultRandom(),
  demandeId: uuid('demande_id').notNull().references(() => demandeAcces.id),
  validateurUserId: text('validateur_user_id').notNull(), // Clerk user ID du trésorier
  decision: text('decision').notNull(), // 'approuve' | 'refuse'
  commentaire: text('commentaire'), // Commentaire optionnel du validateur
  createdAt: timestamp('created_at').defaultNow(),
})

// Emails d'unité par branche avec statut de validation
export const emailUnite = pgTable('email_unite', {
  id: uuid('id').primaryKey().defaultRandom(),
  branchId: uuid('branch_id').notNull().references(() => branches.id),
  email: text('email').notNull(),
  statut: text('statut').notNull().default('propose'), // 'propose' | 'valide' | 'refuse'
  proposePar: text('propose_par'), // Clerk user ID du chef qui propose
  validePar: text('valide_par'), // Clerk user ID du trésorier qui valide
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Types pour TypeScript
export type Group = typeof groups.$inferSelect
export type NewGroup = typeof groups.$inferInsert

export type Branch = typeof branches.$inferSelect
export type NewBranch = typeof branches.$inferInsert

export type UserBranchRole = typeof userBranchRoles.$inferSelect
export type NewUserBranchRole = typeof userBranchRoles.$inferInsert

export type UserSession = typeof userSessions.$inferSelect
export type NewUserSession = typeof userSessions.$inferInsert

export type DemandeAcces = typeof demandeAcces.$inferSelect
export type NewDemandeAcces = typeof demandeAcces.$inferInsert

export type Validation = typeof validations.$inferSelect
export type NewValidation = typeof validations.$inferInsert

export type EmailUnite = typeof emailUnite.$inferSelect
export type NewEmailUnite = typeof emailUnite.$inferInsert

// Rôles possibles
export const USER_ROLES = ['admin', 'member', 'viewer'] as const
export type UserRole = typeof USER_ROLES[number]

// Statuts possibles pour les demandes d'accès
export const DEMANDE_STATUTS = ['en_attente', 'approuve', 'refuse'] as const
export type DemandeStatut = typeof DEMANDE_STATUTS[number]

// Décisions de validation possibles
export const VALIDATION_DECISIONS = ['approuve', 'refuse'] as const
export type ValidationDecision = typeof VALIDATION_DECISIONS[number]

// Statuts possibles pour les emails d'unité
export const EMAIL_STATUTS = ['propose', 'valide', 'refuse'] as const
export type EmailStatut = typeof EMAIL_STATUTS[number]