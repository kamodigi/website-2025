# Project Structure

## Directory Organization

### Repository Structure
- `apps/website/` - The SvelteKit site (source, `package.json`, lockfile, `Dockerfile`). No root workspace; run pnpm commands here. All paths below are relative to this directory
- `docs/` - Documentation
- `.kiro/` - Kiro specifications and steering rules (repository root)

### Website Structure (`apps/website/`)
- `src/` - Main source code
- `static/` - Static assets (favicon, etc.)
- `messages/` - Internationalization message files
- `.husky/` - Git hooks configuration

### Source Code Structure
- `src/app.html` - HTML template
- `src/app.d.ts` - TypeScript declarations
- `src/hooks.ts` - SvelteKit hooks
- `src/hooks.server.ts` - Server-side SvelteKit hooks

### Library Structure
- `src/lib/` - Shared library code
  - `components/` - Reusable UI components
    - `layout/` - Layout components (Header, Footer, Navigation)
  - `styles/` - Global styles and CSS variables
  - `utils/` - Utility functions
  - `paraglide/` - Generated internationalization code
  - `data/` - Static data files (skills, profile)
  - `works/` - Work components and data

### Routing Structure
- `src/routes/` - SvelteKit routes
  - `+page.svelte` - Home page
  - `+layout.svelte` - Root layout
  - `works/` - Work routes
    - `+page.svelte` - Works list page
    - `[slug]/` - Dynamic work routes
      - `+page.svelte` - Work detail page

## Code Conventions

### Component Structure
- Use `.svelte` extension for Svelte components
- Use TypeScript with `<script lang="ts">` in components
- Follow the component structure:
  1. Script section
  2. Template section
  3. Style section

### Naming Conventions
- **Components**: PascalCase (e.g., `WorkCard.svelte`)
- **Files/Directories**: kebab-case (e.g., `scroll-utils.ts`)
- **Functions**: camelCase (e.g., `handleNavClick`)
- **CSS Classes**: kebab-case (e.g., `nav-item`)

### CSS Organization
- Global styles in `src/lib/styles/global.css`
- CSS variables in `src/lib/styles/variables.css`
- Component-specific styles within component files
- Follow BEM naming convention for CSS classes

### Data Management
- Work data stored in Svelte components with metadata exports
- Utility functions for data access in index files
- Type definitions for data structures

## Key Architectural Patterns

### Component Composition
- Small, focused components
- Composition over inheritance
- Props for component configuration

### Responsive Design
- Mobile-first approach
- CSS variables for consistent styling
- Media queries for breakpoints

### Internationalization
- Message keys organized by feature
- Paraglide.js for language switching
- URL-based language selection