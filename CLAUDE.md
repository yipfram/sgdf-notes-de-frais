# Claude AI Assistant - Project Guide

## Project Overview
SGDF Notes de Frais - Multi-group expense tracking application for Scouts et Guides de France groups.

## Architecture & Key Components

### Multi-Group Database Structure
- **Groups**: SGDF units (La Guillotière, Le Bourg, etc.)
- **Branches**: Age groups (Louveteaux, Scouts, etc.) linked to groups
- **User Branch Roles**: Permissions (admin/member/viewer) per branch
- **User Sessions**: Active branch tracking per user

### Authentication Flow
1. **Clerk Authentication** handles user login/signup
2. **AuthContext** loads user's accessible branches via API calls
3. **Branch Selection** allows switching between authorized branches
4. **Role-based Access** controls what users can do per branch

### Key Files & Patterns

#### Database Layer (`src/lib/db/`)
- `schema.ts` - Drizzle schema definitions
- `index.ts` - Database connection and exports
- `init.ts` - Database initialization and migration logic

#### Authentication (`src/contexts/`)
- `AuthContext.tsx` - Multi-branch authentication context
- Provides: `userBranches`, `activeBranch`, `activeBranchRole`, `setActiveBranch`
- Handles legacy user migration from Clerk metadata

#### API Routes (`src/app/api/`)
- `/user/branches` - Get user's accessible branches with roles
- `/user/active-branch` - Set/get current active branch
- `/user/migrate` - Migrate legacy users
- `/init-database` - Initialize database with first group

#### Components
- `ExpenseForm.tsx` - Updated to use dynamic branch data from AuthContext
- `ClerkSignInClient.tsx` / `ClerkSignUpClient.tsx` - Auth wrappers

### Database Queries Pattern
```typescript
// Use `and()` for multiple conditions
const userBranches = await db
  .select({ branch: branches, role: userBranchRoles.role })
  .from(userBranchRoles)
  .innerJoin(branches, eq(userBranchRoles.branchId, branches.id))
  .where(and(
    eq(userBranchRoles.userId, userId),
    eq(userBranchRoles.isActive, true)
  ))
```

### Migration Strategy
1. Users with legacy `publicMetadata.branch` automatically migrate
2. Migration API creates branch access with "member" role
3. Admin users get admin access to all branches
4. Backward compatibility maintained during transition

## Development Commands
```bash
pnpm db:generate    # Generate migrations
pnpm db:migrate     # Run migrations
pnpm db:push        # Push schema changes
pnpm db:studio      # Open Drizzle Studio
```

## Important Notes

### Database Access
- **Never import database code directly in client components**
- Always use API routes from client-side
- Server-side code can use Drizzle directly

### Query Building
- **Don't chain multiple `.where()` calls**
- Use `and()` for multiple conditions: `where(and(eq(...), eq(...)))`

### Environment Setup
- PostgreSQL connection via `POSTGRES_URL`
- Clerk authentication unchanged
- Database initialization required: visit `/admin/init-database`

### Migration Considerations
- Legacy users automatically detected and migrated
- Maintain backward compatibility during transition
- Test migration with existing users before deployment

## Current State
✅ Session 1 Complete: Auth & Access multi-branch architecture implemented
✅ Database schema and migrations ready
✅ AuthContext with API integration
✅ Legacy user migration system
✅ Branch switching functionality

## Next Steps (Session 2)
- Admin interface for branch management
- User invitation system
- Group creation workflows
- Enhanced permission management UI