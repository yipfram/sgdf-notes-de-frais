# SGDF Notes de Frais - Developer Instructions

## Project Overview
Mobile-first Next.js 15 expense tracking app for SGDF La Guillotière scouts. Features client-side OCR, automatic file renaming, and email generation. **No server-side processing or database** - everything runs in the browser.

## Core Architecture

### Component Structure
- `src/app/page.tsx` - Main page with state management for image capture and OCR data flow
- `src/components/PhotoCapture.tsx` - Handles image capture/upload + Tesseract.js OCR processing
- `src/components/ExpenseForm.tsx` - Form with SGDF branch selection, auto-generated filename, and email creation
- Custom Tailwind colors: `sgdf-blue` (#1E3A8A) and `sgdf-gold` (#FBB042)

### Data Flow Pattern
1. **Image Capture** → `PhotoCapture` component captures image and extracts amount via OCR
2. **State Lifting** → Both `capturedImage` and `extractedAmount` passed up to `page.tsx` then down to `ExpenseForm`
3. **File Generation** → Form creates filename pattern: `YYYY-MM-DD - Branch - Amount.jpg`
4. **Client Download** → Browser downloads renamed file + opens pre-filled mailto link

### Key Technical Decisions
- **OCR Language**: Tesseract configured for French (`'fra'`) to match receipt text
- **Amount Regex**: `/(\d+[.,]\d{2})\s*€?/g` captures European currency format
- **Mobile Camera**: File input uses `capture="environment"` for rear camera on mobile
- **Webpack Config**: Disables Node.js polyfills (`fs`, `path`, `crypto`) for client-side Tesseract.js

## Development Workflow

### Essential Commands
```bash
pnpm install       # Install dependencies (includes Tesseract.js worker files)
pnpm dev          # Development server on localhost:3000
pnpm build        # Production build (static export compatible)
pnpm lint         # ESLint + Next.js built-in linting
```

### Testing Requirements
- **Manual mobile testing essential** - Use browser dev tools mobile view or real device
- **Camera functionality** - Test both photo capture and file upload on mobile
- **OCR validation** - Test with French receipts containing "€" amounts
- **Download behavior** - Verify file downloads with correct renamed format
- **Email integration** - Confirm mailto links open with pre-filled content

### SGDF-Specific Business Logic

#### Branch Selection (hardcoded in `ExpenseForm.tsx`)
```typescript
const SGDF_BRANCHES = ['Louveteaux', 'Jeannettes', 'Scouts', 'Guides', 'Pionniers-Caravelles']
```

#### Filename Convention
Format: `YYYY-MM-DD - Branch - Amount.jpg`
- Amounts normalized: commas → periods for consistency
- Example: `2024-03-15 - Scouts - 12.50.jpg`

#### OCR Processing Pattern
- French language Tesseract worker: `await createWorker('fra')`
- Amount extraction regex targets European format: `(\d+[.,]\d{2})\s*€?`
- **Critical**: Always terminate worker after use to prevent memory leaks

## Common Issues & Solutions

### Tesseract.js Problems
- **"Worker failed"**: Check network for worker file loading
- **Wrong language detection**: Verify French worker loads correctly
- **Performance**: OCR takes 3-10 seconds on mobile - show loading state

### Mobile Camera Issues
- **No camera access**: Ensure HTTPS in production (required for `getUserMedia`)
- **Wrong camera**: `capture="environment"` targets rear camera
- **File format**: Accept only `image/*` to prevent non-image uploads

### Build Configuration
- **Webpack errors**: Next.js config disables Node.js polyfills for client-side compatibility
- **Static export**: App designed for serverless deployment (no API routes)

### Deployment Notes
- **Vercel config**: Includes security headers in `vercel.json`
- **No server dependencies**: Pure client-side app, works offline after initial load
- **HTTPS required**: Camera access needs secure context in production