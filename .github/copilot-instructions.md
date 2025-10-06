# Factures carte procurement SGDF - Developer Instructions

## Project Overview
Multi-group Next.js 15 expense tracking app for SGDF groups. Features Clerk authentication, PostgreSQL database with Drizzle ORM, and multi-branch access control. **Now supports multiple SGDF groups** with role-based permissions and branch management.

## Core Architecture

### Database Structure
- `groups` - SGDF groups (La Guillotière, Le Bourg, etc.)
- `branches` - SGDF branches (Louveteaux, Scouts, etc.) linked to groups
- `user_branch_roles` - User permissions for branches (admin/member/viewer)
- `user_sessions` - Active branch tracking per user

### Component Structure
- `src/app/page.tsx` - Main page with multi-branch context
- `src/app/admin/init-database/page.tsx` - Database initialization interface
- `src/contexts/AuthContext.tsx` - Multi-branch authentication context
- `src/components/ExpenseForm.tsx` - Form using dynamic branch data from DB
- `src/lib/db/` - Database schema, connection, and initialization
- `src/app/api/user/branches/` - API for user branch access
- `src/app/api/user/migrate/` - Legacy user migration from Clerk metadata

### Data Flow Pattern
1. Authentication → Clerk middleware validates user session
2. Branch loading → AuthContext fetches user's accessible branches via API
3. Branch selection → User can switch between authorized branches
4. Image capture → user captures or uploads a photo
5. Form submission → POST to `/api/send-expense` with branch context
6. Email generation → server converts base64 to buffer and sends via Gmail SMTP
7. Dual delivery → email sent to both treasury (configured via `TREASURY_EMAIL`) and user

## Development Workflow

### Essential Commands
```bash
pnpm install              # Install dependencies (Clerk, Drizzle, PostgreSQL)
pnpm dev                  # Development server on localhost:3000
pnpm build                # Production build
pnpm db:generate          # Generate database migrations
pnpm db:migrate           # Run database migrations
pnpm db:push              # Push schema changes to database
pnpm db:studio            # Open Drizzle Studio for database inspection
```

### Database Setup
```bash
# 1. Set up PostgreSQL database (Coolify recommended)
# 2. Configure POSTGRES_URL in .env.local
# 3. Generate and run migrations
pnpm db:generate
pnpm db:migrate

# 4. Initialize database with first group
# Visit /admin/init-database when logged in as admin
```

### Environment Setup
```bash
# Copy and configure environment variables
cp .env.example .env.local

# Required variables (see .env.example):
# - Clerk keys from https://dashboard.clerk.com/
# - PostgreSQL connection string
# - Gmail app password from Google Account settings
# - Treasury email address
```

## Multi-Branch Architecture

### Authentication Context
```typescript
// AuthContext provides:
const {
  user,                    // Clerk user object
  userBranches,            // Array of accessible branches
  activeBranch,            // Currently selected branch
  activeBranchRole,        // User's role on active branch
  setActiveBranch,         // Function to switch branches
  hasAccessToBranch,       // Check branch access permission
  isAdmin,                 // Check if admin on active branch
  isLoading               // Loading state
} = useAuth()
```

### Branch Access Control
- **Admin**: Full access to branch management and user permissions
- **Member**: Can submit expenses for the branch
- **Viewer**: Read-only access to branch data

### API Routes
- `/api/user/branches` - Get user's accessible branches with roles
- `/api/user/active-branch` - Set/get user's currently active branch
- `/api/user/migrate` - Migrate legacy users from Clerk metadata
- `/api/init-database` - Initialize database with first group and branches

### Migration Strategy
Legacy users with `publicMetadata.branch` are automatically migrated:
1. User signs in → no branches found in database
2. System calls `/api/user/migrate` → creates branch access
3. User gains access to their original branch as "member" role
4. Admin can upgrade roles via database management

## Database Schema

### Core Tables
```sql
-- Groups (SGDF units)
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  admin_user_id TEXT NOT NULL,  -- Clerk user ID
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Branches (SGDF age groups)
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  group_id UUID NOT NULL REFERENCES groups(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- User permissions
CREATE TABLE user_branch_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,        -- Clerk user ID
  branch_id UUID NOT NULL REFERENCES branches(id),
  role TEXT NOT NULL,           -- 'admin' | 'member' | 'viewer'
  is_active BOOLEAN DEFAULT true,
  granted_by TEXT,              -- Clerk user ID who granted access
  granted_at TIMESTAMP DEFAULT now(),
  last_access_at TIMESTAMP
);
```

## Testing Requirements

### Multi-Branch Testing
- Branch switching: Test that users can only access authorized branches
- Role validation: Verify admin/member/viewer permissions work correctly
- Migration: Test legacy user migration from Clerk metadata
- Isolation: Ensure users can't access other groups' data

### Authentication Flow
- Test Clerk sign-in/sign-up with Google and email
- Verify branch access is correctly loaded after authentication
- Test unauthorized access attempts to restricted branches

### Email Delivery
- Verify emails include correct branch information
- Test email delivery to both treasury and user addresses
- Validate email templates show active branch context

## Common Issues & Solutions

### Database Issues
- "POSTGRES_URL not set": Configure database connection in .env.local
- Migration fails: Check database permissions and connection
- No branches found: Initialize database via /admin/init-database

### Branch Access Issues
- User sees no branches: Check if database is initialized and user has permissions
- Branch switching fails: Verify user has role assignments for target branch
- Admin access missing: Ensure group admin has admin roles on all branches

### Migration Issues
- Legacy users not migrated: Check Clerk metadata contains branch information
- Migration API fails: Verify database connection and group initialization
- Duplicate branch assignments: Migration checks for existing access before creating

### Performance Considerations
- Database queries: All branch data fetched via API routes (no direct DB access from client)
- Branch switching: Updates user_sessions table for tracking
- Role validation: Checked server-side in all API routes

## Deployment Notes

### Coolify Configuration
- PostgreSQL database service
- Node.js runtime for Next.js application
- Environment variables: Clerk keys, database URL, Gmail settings
- Database migrations: Run `pnpm db:migrate` during deployment

### Database Initialization
1. Deploy application with database connection
2. Admin user logs in and visits `/admin/init-database`
3. System creates first group (La Guillotière) and all SGDF branches
4. Admin receives admin access to all branches
5. Additional users can be granted access via database management

### Multi-Group Expansion
- New groups added via database or management interface
- Each group has isolated branches and users
- Admin users can manage permissions within their group
- Cross-group access prevented by design

## Code Patterns & Conventions

### Database Access Pattern
```typescript
// Server-side: Direct Drizzle queries
const userBranches = await db
  .select({ branch: branches, role: userBranchRoles.role })
  .from(userBranchRoles)
  .innerJoin(branches, eq(userBranchRoles.branchId, branches.id))
  .where(and(
    eq(userBranchRoles.userId, userId),
    eq(userBranchRoles.isActive, true)
  ))

// Client-side: API calls through AuthContext
const response = await fetch('/api/user/branches')
const data = await response.json()
```

### Branch Selection Pattern
```typescript
// In ExpenseForm.tsx
const { userBranches, activeBranch, setActiveBranch } = useAuth()

const handleBranchChange = (branchName: string) => {
  const selectedBranch = userBranches.find(b => b.name === branchName)
  if (selectedBranch) {
    setActiveBranch(selectedBranch)
  }
}
```

### Permission Checking Pattern
```typescript
// In API routes
const userBranchRole = await db
  .select({ role: userBranchRoles.role })
  .from(userBranchRoles)
  .where(and(
    eq(userBranchRoles.userId, userId),
    eq(userBranchRoles.branchId, branchId),
    eq(userBranchRoles.isActive, true)
  ))

if (userBranchRole.length === 0) {
  return NextResponse.json({ error: 'Access denied' }, { status: 403 })
}
```

## Future Enhancements

### Session 2 Planned Features
- Admin interface for branch management
- User invitation system
- Group creation workflows
- Enhanced permission management
- Activity logging and audit trails

### Database Optimizations
- Redis for caching frequently accessed branch data
- Database connection pooling for high traffic
- Optimized queries for branch listing and permission checking