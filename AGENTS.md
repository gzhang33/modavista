# Repository Guidelines

## Project Structure & Module Organization
- `frontend/`: React 18 + Vite + TypeScript app with Tailwind CSS and Radix UI components
  - `src/components/`: React components (PascalCase)
  - `src/pages/`: Page components (home, collections, product-detail)
  - `src/hooks/`: Custom React hooks
  - `src/lib/`: Utility functions and configurations
  - `src/types/`: TypeScript type definitions
  - Imports: `@` → `frontend/src`, `@shared` → `shared`

- `backend/`: PHP 8+ API and modern admin panel
  - `api/`: RESTful API endpoints (products, categories, materials, colors, seasons, media, contact_messages, translation, login)
  - `admin/`: Modern admin interface with component-based JavaScript
    - `dashboard.php`: Product management with filtering and CRUD operations
    - `contact_messages.php`: Customer inquiry management with status tracking
    - `translations.php`: AI-powered multi-language translation system
    - `login.html`: Modern authentication interface
  - `config/`: Environment configuration (`app.php`, `env_loader.php`)

- `shared/`: Shared schemas and type definitions
- `docs/`: Project documentation (architecture, API specs, CSP fixes)
- `scripts/`: Deployment and utility scripts
- `storage/`: File uploads and media (gitignored)

## Build, Test, and Development Commands

### Frontend Development
- `npm run dev`: Starts Vite dev server on `http://localhost:5173` with hot reload
- `npm run build`: TypeScript compilation + Vite production build to `frontend/dist/`
- `npm run preview`: Serves production build locally for testing
- `npm run install:all`: Installs all project dependencies
- `cd frontend && npm run lint`: ESLint code quality check

### Backend Development
- Serve PHP via Laragon/Apache/Nginx from project root
- API endpoints: `/backend/api/*.php`
- Admin panel: `/backend/admin/` (dashboard, contact_messages, translations, login)
- Media uploads: `/storage/uploads/product_images/`

### Development URLs
- Frontend: `http://localhost:5173`
- Admin Panel: `http://localhost/backend/admin/`
- API Base: `http://localhost/backend/api/`

## Coding Style & Naming Conventions

### Frontend (React + TypeScript)
- **Indentation**: 2-space indentation
- **Components**: PascalCase in `frontend/src/components/`
- **Files/Directories**: snake_case
- **CSS**: BEM methodology + Tailwind CSS utility-first
- **UI Components**: Reusable components in `@/components/ui`
- **Code Quality**: ESLint (`npm run lint`)

### Backend (PHP)
- **Standard**: PSR-12 compliance
- **Indentation**: 4-space indentation
- **Files**: snake_case.php
- **Architecture**: Keep API endpoints small, reuse helpers in `backend/api/utils.php`
- **Security**: Always use prepared statements, validate/sanitize inputs

### JavaScript Modules
- **Admin Components**: camelCase.js in `backend/admin/assets/js/components/`
- **Module System**: ES6 modules with EventBus pattern
- **Component Architecture**: BaseComponent inheritance pattern

## Testing Guidelines

### Current Status
- No test suite currently implemented
- Focus on manual testing and code quality tools

### Recommended Testing Setup
- **Frontend**: Vitest + React Testing Library
  - Test files: `*.test.tsx` colocated with components
  - Focus on component behavior and user interactions
- **Backend**: PHPUnit/Pest
  - Test files: `*Test.php` in `backend/tests/`
  - Mock network requests and file uploads
  - Test API endpoints and business logic

### Quality Assurance
- ESLint for frontend code quality
- TypeScript for type safety
- Prepared statements for SQL injection prevention
- Input validation and sanitization

## Commit & Pull Request Guidelines
- Conventional commits: `type(scope): subject` (e.g., `feat(api): add login`).
- Branch from `develop`; open PRs to `develop`; merge to `main` after verification.
- PRs include: clear description, linked issues, UI screenshots (when applicable), and any API changes reflected in `docs/`.

## Security & Configuration Tips

### Environment Security
- Never commit `.env` files or `storage/` contents
- Use environment-specific configuration in `backend/config/app.php`
- Implement automatic environment detection (localhost vs production)

### API Security
- Validate and sanitize all inputs in `backend/api/*`
- Always use prepared statements to prevent SQL injection
- Implement proper session management and CSRF protection
- Set appropriate CORS and upload limits for your environment

### Frontend Security
- Review CSP and media handling in `docs/CSP_BLOB_URL_FIX.md`
- Implement proper input validation with Zod schemas
- Use secure authentication flows

### Admin Panel Security
- Modern login interface with proper session handling
- Component-based architecture with secure data flow
- Real-time validation and error handling

