---
name: Frontend Components & Styling
description: Conventions for React and Astro components, Tailwind CSS styling, and accessibility patterns (ARIA).
applyTo: "web/**/*.{tsx,astro}"
---

# Frontend Guidelines

## Component Patterns

- Use Astro components (`.astro`) for static content and layout — Astro ships zero JavaScript by default, improving performance.
- Implement framework components in React only when interactivity is needed — avoid adding React overhead for presentation-only content.

## Tailwind CSS Styling

### Organization & Theme

- Use the `@layer` directive to organize styles into `components`, `utilities`, and `base` layers — keeps CSS maintainable and prevents specificity conflicts.
- Implement the Tailwind configuration file for customizing theme, plugins, and variants — ensures design consistency and enables shared tokens across the app.
- Leverage the `theme()` function in CSS for accessing Tailwind theme values — prevents hardcoding theme values and keeps styles DRY.

### Custom & Responsive Values

- **Use parenthesis syntax** for CSS variables: `text-(--color-primary)` instead of `text-[var(--color-primary)]` (Tailwind CSS v4 canonical syntax).
- Use arbitrary values with square brackets (e.g., `w-[123px]`) for precise one-off designs — balances utility-first approach with design flexibility.
- Use responsive variants (`sm:`, `md:`, `lg:`, etc.) for adaptive designs — ensures content looks good across all viewport sizes.

### Interactive & Theme States

- Leverage state variants (`hover:`, `focus-visible:`, `active:`, etc.) for interactive elements — explicitly communicates intended interactions to users and Copilot.
- Implement dark mode with the `dark:` variant — provides accessible visual experience for users preferring reduced brightness.

## Accessibility (ARIA)

### Semantic Structure

- Use ARIA landmarks to identify regions of the page (`main`, `navigation`, `search`, etc.) — helps screen reader users quickly navigate and understand page structure.
- Avoid redundant ARIA that duplicates semantics of native HTML elements — `<button>` already implies `role="button"`, and `<nav>` already implies `role="navigation"`.

### Custom Components & Interactive Elements

- Apply appropriate ARIA roles to custom interface elements lacking semantic HTML equivalents — ensures screen readers announce custom components correctly.
- Set `aria-expanded` and `aria-controls` for expandable content like accordions and dropdowns — screen reader users can understand state and relationships.
- Implement `aria-current` to indicate the current item in a set, navigation, or process — helps users orient themselves within multi-step flows or lists.

### Content & Labels

- Apply `aria-label` or `aria-labelledby` for elements without visible text labels (icon buttons, form inputs without labels) — provides screen readers with accessible names.
- Use `aria-describedby` to associate descriptive text with form inputs or complex elements — provides additional context beyond the label.

### Dynamic Content

- Use `aria-live` regions with appropriate politeness settings (`polite`, `assertive`) for dynamic content updates — announces content changes to screen reader users without forcing them to stop reading.
- Implement `aria-hidden` to hide decorative or duplicative content from screen readers — prevents clutter and improves experience for assistive technology users.
