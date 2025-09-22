# SGDF Notes de Frais - Developer Instructions

## Project Overview
Hybrid Next.js 15 expense tracking app for SGDF La Guillotière scouts. Features client-side OCR, Clerk authentication, and server-side email sending via Gmail SMTP. **No database** - authentication via Clerk, emails sent directly to recipients.

## Core Architecture

### Component Structure
- `src/app/page.tsx` - Main authenticated page with Clerk user management and state coordination
- `src/app/sign-in/page.tsx` & `src/app/sign-up/page.tsx` - Clerk authentication pages
- `src/components/PhotoCapture.tsx` - Image capture/upload + Tesseract.js OCR processing
- `src/components/ExpenseForm.tsx` - Form with SGDF branch selection, validation, and API submission
- `src/middleware.ts` - Clerk middleware protecting routes and API endpoints
- `src/lib/email.ts` - Gmail SMTP email sending utilities
- `src/app/api/send-expense/route.ts` - Protected API route for email sending

### Data Flow Pattern
1. **Authentication** → Clerk middleware validates user session
2. **Image Capture** → `PhotoCapture` captures image and extracts amount via OCR
3. **State Lifting** → Data flows up to `page.tsx` then down to `ExpenseForm`
4. **Form Submission** → POST to `/api/send-expense` with base64 image
5. **Email Generation** → Server converts base64 to buffer and sends via Gmail SMTP
6. **Dual Delivery** → Email sent to both treasury (`sgdf.tresolaguillotiere@gmail.com`) and user

### Key Technical Decisions
- **Authentication**: Clerk for seamless Google/Email auth (no custom user management)
- **Email Service**: Gmail SMTP with app passwords (free, reliable for association use)
- **Image Handling**: Base64 encoding/decoding between client and server
- **Validation**: Server-side validation with specific error messages
- **State Management**: React useState with loading/success/error states
- **OCR Language**: Tesseract configured for French (`'fra'`) to match receipt text
- **Amount Regex**: `/(\d+[.,]\d{2})\s*€?/g` captures European currency format
- **Mobile Camera**: File input uses `capture="environment"` for rear camera
- **Webpack Config**: Disables Node.js polyfills for client-side Tesseract.js compatibility

## Development Workflow

### Essential Commands
```bash
pnpm install       # Install dependencies (Clerk, nodemailer, Tesseract.js)
pnpm dev          # Development server on localhost:3000
pnpm build        # Production build (serverless deployment)
pnpm lint         # ESLint + Next.js built-in linting
```

### Environment Setup
```bash
# Copy and configure environment variables
cp .env.example .env.local

# Required variables (see .env.example):
# - Clerk keys from https://dashboard.clerk.com/
# - Gmail app password from Google Account settings
# - Treasury email address
```

### Testing Requirements
- **Authentication flow**: Test Clerk sign-in/sign-up with Google and email
- **Manual mobile testing**: Use browser dev tools mobile view or real device
- **Camera functionality**: Test both photo capture and file upload on mobile
- **OCR validation**: Test with French receipts containing "€" amounts
- **Email delivery**: Verify emails arrive at both treasury and user addresses
- **Error handling**: Test invalid Gmail credentials, network failures, malformed data

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
- **Recipients**: Treasury + authenticated user
- **Subject**: `Note de frais - {Branch} - {Date}`
- **Content**: Structured HTML table with SGDF branding
- **Attachment**: JPEG image with formatted filename

### OCR Processing Pattern
- French language Tesseract worker: `await createWorker('fra')`
- Amount extraction regex targets European format: `(\d+[.,]\d{2})\s*€?`
- **Critical**: Always terminate worker after use to prevent memory leaks

## Authentication & Security

### Clerk Integration
- **Middleware Protection**: `src/middleware.ts` protects `/` and `/api/send-expense`
- **User Context**: `useUser()` hook provides email for form pre-population
- **Session Management**: Automatic token refresh and logout handling
- **Route Protection**: Automatic redirects for unauthenticated users

### Server-Side Validation
```typescript
// API route validates:
- Clerk authentication (userId exists)
- Required environment variables
- Email format regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
- Amount format (positive number)
- All required fields present
```

### Gmail SMTP Security
- **App Passwords**: Dedicated password for SMTP (not main account password)
- **TLS Encryption**: Port 587 with STARTTLS
- **Rate Limiting**: Gmail's 500 emails/day limit (sufficient for association)
- **Error Handling**: Specific error messages for auth failures vs connection issues

## Common Issues & Solutions

### Authentication Problems
- **"Non autorisé"**: Check Clerk keys in `.env.local` and dashboard configuration
- **Redirect loops**: Verify middleware route matching patterns
- **User context undefined**: Ensure ClerkProvider wraps the app in `layout.tsx`

### Email Sending Issues
- **"Configuration SMTP invalide"**: Verify Gmail app password and 2FA enabled
- **"Invalid login"**: Regenerate Gmail app password (16-character format)
- **"Erreur de connexion SMTP"**: Check Gmail account isn't blocked/suspended
- **Large attachments**: Gmail SMTP supports up to 25MB (photos are typically <5MB)

### OCR & Image Processing
- **"Worker failed"**: Check network for Tesseract.js CDN loading
- **Wrong language detection**: Verify French worker loads correctly
- **Performance**: OCR takes 3-10 seconds on mobile - always show loading state
- **Memory leaks**: Always call `worker.terminate()` after OCR completion

### Mobile Camera Issues
- **No camera access**: Ensure HTTPS in production (required for `getUserMedia`)
- **Wrong camera**: `capture="environment"` targets rear camera
- **File format**: Accept only `image/*` to prevent non-image uploads
- **Base64 conversion**: Handle both data URLs and direct base64 strings

### Build Configuration
- **Webpack errors**: Next.js config disables Node.js polyfills for client compatibility
- **Serverless deployment**: No static export (API routes require server runtime)
- **Environment variables**: All secrets must be in `.env.local` (gitignored)

## Deployment Notes

### Vercel Configuration
- **Runtime**: Node.js (not static export)
- **Environment Variables**: Copy all from `.env.local` to Vercel dashboard
- **Build Command**: `pnpm build` (includes API routes)
- **Security Headers**: Configured in `vercel.json`

### Development vs Production
- **Local**: Use `.env.local` for development
- **Production**: Environment variables set in hosting platform
- **HTTPS Required**: Camera access needs secure context
- **Domain Configuration**: Update Clerk dashboard with production domain

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
const isFormValid = capturedImage && formData.branch && formData.amount && formData.description

// Server-side validation with specific error messages
if (!emailRegex.test(userEmail)) {
  return NextResponse.json({ error: 'Format email invalide' }, { status: 400 })
}
```

### Email Template
- **Responsive HTML**: Works on mobile and desktop email clients
- **SGDF Branding**: Blue (#1E3A8A) and gold (#FBB042) color scheme
- **Structured Data**: Table format for consistent rendering
- **Fallback Text**: Plain text version for accessibility