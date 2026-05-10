---
name: Astro
description: Conventions for Astro pages and components. Covers routing, data handling, API patterns, optimization, and rendering strategies.
applyTo: "web/**/*.astro,web/src/pages/*"
---

# Astro Guidelines

## Navigation & Transitions

- Use View Transitions API with `<ClientRouter />` for smooth page transitions — improves perceived performance without external dependencies.

## Data & Content

- Use content collections with type-safe schemas for organized data (blog posts, documentation, product catalogs).
- Extract business logic into services in `src/lib/services/` — keep `.astro` files focused on presentation and data composition.

## Server Endpoints (API Routes)

- Use uppercase HTTP method names: `export const POST`, `export const GET`, etc. — follows standard REST convention and improves readability.
- Use `zod` for input validation in all API routes — ensures type safety and clear error messages.
- Add `export const prerender = false` to all API route files — prevents compilation errors since endpoints cannot be prerendered.

## Server-side Features

- Use `Astro.cookies` for server-side cookie management — provides secure access without exposing cookies to client-side code.
- Implement middleware for request/response modification — centralize cross-cutting concerns like authentication, logging, and header management.
- Use `import.meta.env` for environment variables — Astro's type-safe environment variable access.

## Rendering & Performance

- Implement hybrid rendering with server-side rendering where needed — use `export const prerender = false` for dynamic routes; rely on static generation for content that doesn't change.
- Use Astro's Image integration for image optimization — automatic format selection (WebP, AVIF), responsive sizing, and lazy loading.

## Code Organization

- API route files should remain thin — import and call service functions; no business logic directly in route handlers.
- Service functions should handle validation, transformation, and database interactions — keep route handlers focused on HTTP contract.
