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

// Types pour TypeScript
export type Group = typeof groups.$inferSelect
export type NewGroup = typeof groups.$inferInsert

export type Branch = typeof branches.$inferSelect
export type NewBranch = typeof branches.$inferInsert

export type UserBranchRole = typeof userBranchRoles.$inferSelect
export type NewUserBranchRole = typeof userBranchRoles.$inferInsert

export type UserSession = typeof userSessions.$inferSelect
export type NewUserSession = typeof userSessions.$inferInsert

// Rôles possibles
export const USER_ROLES = ['admin', 'member', 'viewer'] as const
export type UserRole = typeof USER_ROLES[number]