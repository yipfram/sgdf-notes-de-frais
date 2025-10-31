# Factures carte procurement SGDF - Developer Instructions

## Project Overview
Hybrid Next.js 15 expense tracking app for SGDF La Guillotière scouts. Features Clerk authentication, and server-side email sending via generic SMTP (supports Gmail, Outlook, Office 365, custom servers). **No database** - authentication via Clerk, emails sent directly to recipients.

## Core Architecture

### Component Structure
- `src/app/page.tsx` - Main authenticated page with Clerk user management and state coordination
- `src/app/sign-in/page.tsx` & `src/app/sign-up/page.tsx` - Clerk authentication pages
- `src/components/PhotoCapture.tsx` - Image capture/upload
- `src/components/ExpenseForm.tsx` - Form with SGDF branch selection, validation, and API submission
- `src/middleware.ts` - Clerk middleware protecting routes and API endpoints
- `src/lib/email.ts` - Generic SMTP email sending utilities
- `src/app/api/send-expense/route.ts` - Protected API route for email sending
## Project Overview
Hybrid Next.js 15 expense tracking app for SGDF La Guillotière scouts. The app uses Clerk for authentication and sends invoice emails server-side via generic SMTP. There is no central database: emails are delivered directly to the treasury and the user.

## Core Architecture

### Component Structure
- `src/app/page.tsx` - Main authenticated page with Clerk user management and state coordination
- `src/app/sign-in/page.tsx` & `src/app/sign-up/page.tsx` - Clerk authentication pages
- `src/components/PhotoCapture.tsx` - Image capture / upload UI
- `src/components/ExpenseForm.tsx` - Form with SGDF branch selection, validation, and API submission
- `src/middleware.ts` - Clerk middleware protecting routes and API endpoints
- `src/lib/email.ts` - Generic SMTP email sending utilities
- `src/app/api/send-expense/route.ts` - Protected API route for email sending

### Data Flow Pattern
1. Authentication → Clerk middleware validates user session
2. Image capture → user captures or uploads a photo
3. State lifting → data flows up to `page.tsx` then down to `ExpenseForm`
4. Form submission → POST to `/api/send-expense` with base64 image
5. Email generation → server converts base64 to buffer and sends via SMTP
6. Dual delivery → email sent to both treasury (configured via `TREASURY_EMAIL`) and user

### Key Technical Decisions
- Authentication: Clerk for Google/Email auth (no custom user management)
- Email Service: Generic SMTP support (works with Gmail, Outlook, Office 365, custom servers)
- Image Handling: Base64 encoding/decoding between client and server
- Validation: Server-side validation with specific error messages
- State Management: React useState with loading/success/error states
- Mobile Camera: File input uses `capture="environment"` for rear camera
- Webpack Config: Disables Node.js polyfills for client-side compatibility when needed

## Development Workflow

### Essential Commands
```bash
pnpm install       # Install dependencies (Clerk, nodemailer)
pnpm dev           # Development server on localhost:3000
pnpm build         # Production build (serverless deployment)
pnpm lint          # ESLint + Next.js built-in linting
```

### Environment Setup
```bash
# Copy and configure environment variables
cp .env.example .env.local

# Required variables (see .env.example):
# - Clerk keys from https://dashboard.clerk.com/
# - SMTP server configuration (host, port, credentials)
# - Treasury email address
# Supports Gmail, Outlook, Office 365, and custom SMTP servers
```

### Testing Requirements
- Authentication flow: Test Clerk sign-in/sign-up with Google and email
- Manual mobile testing: Use browser dev tools mobile view or real device
- Camera functionality: Test photo capture and file upload on mobile
- Email delivery: Verify emails arrive at both treasury and user addresses
- Error handling: Test invalid SMTP credentials, network failures, malformed data

## SGDF-Specific Business Logic

### Branch Selection (hardcoded in `ExpenseForm.tsx`)
```typescript
const SGDF_BRANCHES = ['Louveteaux', 'Jeannettes', 'Scouts', 'Guides', 'Pionniers-Caravelles']
```

### Filename Convention
Format: `YYYY-MM-DD - Branch - Amount.jpg`
- Amounts normalized: commas → periods for consistency
- Example: `2024-03-15 - Scouts - 12.50.jpg`

### Email Template Structure
- Recipients: Treasury + authenticated user
- Subject: `Facture carte procurement - {Branch} - {Date}`
- Content: Structured HTML table with SGDF branding
- Attachment: JPEG image with formatted filename

## Authentication & Security

### Clerk Integration
- Middleware Protection: `src/middleware.ts` protects `/` and `/api/send-expense`
- User Context: `useUser()` hook provides email for form pre-population
- Session Management: Automatic token refresh and logout handling
- Route Protection: Automatic redirects for unauthenticated users

### Server-Side Validation
```typescript
// API route validates:
- Clerk authentication (userId exists)
- Required environment variables
- Email format regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
- Amount format (positive number)
- All required fields present
```

### SMTP Security
- Secure Authentication: TLS/SSL encryption for all SMTP connections
- Port Configuration: Port 587 (TLS) or 465 (SSL) recommended
- Provider-Specific: Gmail requires app passwords, Outlook uses standard passwords
- Rate Limiting: Varies by provider (Gmail: 500/day, typically sufficient for associations)
- Error Handling: Specific error messages for auth failures vs connection issues

## Common Issues & Solutions

### Authentication Problems
- "Non autorisé": Check Clerk keys in `.env.local` and dashboard configuration
- Redirect loops: Verify middleware route matching patterns
- User context undefined: Ensure ClerkProvider wraps the app in `layout.tsx`

### Email Sending Issues
- "Configuration SMTP invalide": Verify SMTP host, port, credentials are correct
- "Invalid login": Check SMTP username and password (Gmail needs app password)
- "Erreur de connexion SMTP": Verify SMTP server is accessible and credentials are valid
- Large attachments: Most SMTP servers support up to 25MB (photos are typically <5MB)
- Provider-specific: Gmail requires app passwords with 2FA, Outlook uses standard passwords

### Mobile Camera Issues
- No camera access: Ensure HTTPS in production (required for `getUserMedia`)
- Wrong camera: `capture="environment"` targets rear camera
- File format: Accept only `image/*` to prevent non-image uploads
- Base64 conversion: Handle both data URLs and direct base64 strings

### Build Configuration
- Webpack errors: Next.js config disables Node.js polyfills for client compatibility
- Serverless deployment: No static export (API routes require server runtime)
- Environment variables: All secrets must be in `.env.local` (gitignored)

## Deployment Notes

### Vercel Configuration
- Runtime: Node.js (not static export)
- Environment Variables: Copy all from `.env.local` to Vercel dashboard (10+ variables)
- Build Command: `pnpm build` (includes API routes)
- Security Headers: Configured in `vercel.json`

### Development vs Production
- Local: Use `.env.local` for development
- Production: Environment variables set in hosting platform
- HTTPS Required: Camera access needs secure context
- Domain Configuration: Update Clerk dashboard with production domain
- SMTP Testing: Test with your chosen provider before deploying

## Code Patterns & Conventions

### Error Handling
```typescript
// Client-side: User-friendly messages with emoji indicators
setSubmitStatus({
  type: 'error',
  message: 'Erreur de connexion. Veuillez réessayer.'
})

// Server-side: Specific error types with appropriate HTTP codes
if (error.message.includes('Invalid login')) {
  return NextResponse.json(
    { error: 'Erreur d\'authentification Gmail...' },
    { status: 500 }
  )
}
```

### State Management
```typescript
// Loading/success/error pattern used throughout
const [isSubmitting, setIsSubmitting] = useState(false)
const [submitStatus, setSubmitStatus] = useState<{
  type: 'success' | 'error' | null
  message: string
}>({ type: null, message: '' })
```

### Form Validation
```typescript
// Client-side validation before API call
const isFormValid = /* ... */ formData.branch && formData.amount && formData.description

// Server-side validation with specific error messages
if (!emailRegex.test(userEmail)) {
  return NextResponse.json({ error: 'Format email invalide' }, { status: 400 })
}
```

### Email Template
- Responsive HTML: Works on mobile and desktop email clients
- SGDF Branding: Blue (#1E3A8A) and gold (#FBB042) color scheme
- Structured Data: Table format for consistent rendering
- Fallback Text: Plain text version for accessibility