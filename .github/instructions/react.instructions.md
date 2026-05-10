---
name: React Components
description: React component patterns, hooks usage, performance optimization, and Astro integration conventions.
applyTo: "web/src/**/*.tsx"
---

# React Guidelines

## Component Architecture

- Use functional components with hooks instead of class components — simpler to write, test, and reason about; the React community has standardized on this pattern.
- Never use "use client" and other Next.js directives — this project uses React with Astro, not Next.js; these directives will cause errors.

## Logic & Composition

- Extract logic into custom hooks in `src/components/hooks/` or feature-level hooks in `src/features/*/hooks/` — keeps components focused on presentation; makes logic testable and reusable across components.

## Performance Optimization

### Memoization

- Implement `React.memo()` for expensive components that render often with the same props — prevents unnecessary re-renders of child components when parent re-renders without prop changes.
- Prefer `useMemo` for expensive calculations to avoid recomputation on every render — only use when profiling confirms the calculation is actually expensive; premature memoization can hurt performance.

### Event Handlers & Callbacks

- Use `useCallback` hook for event handlers passed to child components to prevent unnecessary re-renders — stabilizes callback references so memoized children don't re-render due to "new" function references.

### Code Splitting & Loading

- Utilize `React.lazy()` and `Suspense` for code-splitting and performance optimization — defer loading heavy components until needed; always provide a fallback UI for the loading state.

## Accessibility & Utilities

- Implement `useId()` for generating unique IDs for accessibility attributes — ensures unique IDs across server/client rendering and avoids manual ID management.

## Advanced Patterns

- Consider using the new `useOptimistic` hook for optimistic UI updates in forms — improves perceived responsiveness by updating UI before server confirmation; gracefully reverts if submission fails.
- Use `useTransition` for non-urgent state updates to keep the UI responsive — prevents janky UI when processing large state updates; allows showing loading states for secondary operations.
