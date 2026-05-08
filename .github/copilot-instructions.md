# Copilot Instructions — rn-kcal-companion

**Project**: React Native + Expo calorie counting companion app  
**Package Manager**: bun (never npm, yarn, or pnpm)  
**Workspace**: Monorepo with `/mobile` as main app

## Architecture

```
rn-kcal-companion/
├── mobile/                 # React Native + Expo app (primary)
│   ├── src/
│   │   ├── api/           # API related code (Supabase client, queries, mutations)
│   │   ├── app/           # Expo Router routes (thin entry points only)
│   │   ├── components/    # Reusable UI components
│   │   ├── features/      # Domain feature modules (see Feature Modules below)
│   │   ├── hooks/         # Global custom React hooks
│   │   ├── providers/     # App providers (auth, theme, etc.)
│   │   ├── stores/        # App stores (state management)
│   │   ├── styles/        # Styles (NativeWind)
│   │   ├── types/         # Database & shared types
│   │   ├── utils/         # App utilities
│   │   ├── tw/            # CSS-enabled wrapper components
│   │   └── global.css     # Tailwind with dark mode support
│   ├── supabase/          # Database migrations & types
│   └── package.json       # Main app dependencies
└── .github/               # Copilot instructions & CI/CD
```

## Tech Stack

| Layer               | Technology                      | Version             |
| ------------------- | ------------------------------- | ------------------- |
| **Runtime**         | React Native                    | 0.81.5              |
| **Framework**       | Expo                            | ~54.0               |
| **Router**          | Expo Router                     | ~6.0                |
| **Styling**         | Tailwind CSS v4 + NativeWind v5 | 4.x / 5.0-preview.2 |
| **Animations**      | Reanimated                      | ~4.1                |
| **Gestures**        | react-native-gesture-handler    | ~2.28               |
| **Auth**            | Supabase Auth                   | (cloud)             |
| **Database**        | Supabase PostgreSQL             | (cloud)             |
| **Type Safety**     | TypeScript                      | ~5.9                |
| **Package Manager** | bun                             | 1.3+                |

## Development Workflow

### Starting the App

```bash
bun install          # Install dependencies
bun run start        # Start Expo dev server

# Platform-specific
bun run ios          # iOS (requires macOS + Xcode)
bun run android      # Android (requires Android Studio)
bun run web          # Web preview
```

### Database

```bash
cd supabase
supabase db pull     # Sync latest migrations
supabase db push     # Push local migrations to Supabase
```

### Linting

```bash
bun run lint         # Run ESLint
```

## Key Conventions

### Styling

- **Dark mode** enabled globally via CSS `@media (prefers-color-scheme: dark)` in `src/global.css`
- **Color tokens** defined as CSS custom properties (`--color-bg`, `--color-text`, etc.)
- **Tailwind classes** work directly in JSX via `className` prop (NativeWind integration)
- **Inline styles** for dynamic values; Tailwind classes for static styles
- Always use `borderCurve: 'continuous'` for rounded corners (Apple HIG)
- Prefer `gap` over margin for spacing between flex items

### Theme Switching

- Hook: `useTheme()` from `src/hooks/use-theme.ts`
- Returns: `{ preference, setTheme, resolvedScheme }`
- Updates app-wide via `Appearance.setColorScheme()`
- `StatusBar` automatically adapts via `style="auto"`
- Stack headers automatically adapt via `screenOptions` in root layout

### Components

- Location: `src/components/` (never co-locate with routes)
- File naming: kebab-case (e.g., `theme-switcher.tsx`)
- Styled with CSS-enabled wrapper components from `src/tw/index.tsx`
- Examples: `View`, `Text`, `Pressable`, `ScrollView`, `TextInput`

### Feature Modules

- Location: `src/features/<domain>/<screen-area>/` with subfolders `components/`, `hooks/`, `utils/`, and optionally `constants.ts`
- Examples: `features/lists/overview/` (list of lists), `features/lists/details/` (list details), `features/auth/sign-in/` (login), `features/profile/` (profile & account settings), `features/dev/gradient-playground/` (dev tools)
- Domain-specific components, hooks, and utilities live inside the feature — NOT in `src/components/` or `src/hooks/`
- Global/shared components stay in `src/components/`; global hooks in `src/hooks/`

### Routes

- Location: `src/app/` following Expo Router conventions — **thin entry points only**
- Route files compose the screen from feature hooks and components; no business logic, state, mutations, or API integration in route files
- Business logic, state, mutations, API calls → custom hooks in `src/features/.../hooks/`
- Formatting, labels, domain constants → `utils/` or `constants.ts` within the feature
- Domain UI components (lists, headers, cards) → `src/features/<domain>/<area>/components/`, not in `app/`
- When a handler matches the expected type, pass the reference directly: `onRefresh={refetch}` not `onRefresh={() => void refetch()}`
- Remove old route files when restructuring navigation
- Stack headers should always have a title (`headerTitle` or `title` option)
- Safe area: use `ScrollView contentInsetAdjustmentBehavior="automatic"`

### Animations

- Library: `react-native-reanimated` v4
- GPU-accelerated properties only: `transform` and `opacity`
- Never animate layout properties: `width`, `height`, `margin`, `padding`
- Use `useDerivedValue` for computed animation values
- For gesture-driven: use `Gesture.Tap` from gesture-handler (not Pressable alone)

### Lists & Scrolling

- Use FlashList or LegendList for any list (even short ones)
- Memoize list items with `React.memo()`
- Stable callback references: wrap with `useCallback` if used in renders
- Avoid inline styles in render functions
- Always set `estimatedItemSize` for virtualization efficiency

### Images

- Use `expo-image` (never `Image` from react-native)
- Supports blurhash, caching, and graceful fallbacks
- iOS: SF Symbols via `source="sf:symbolname"`

### Navigation

- Use native stack navigator (`@react-navigation/native-stack`)
- Use native bottom tabs (`@react-navigation/bottom-tabs`)
- Avoid JS-only navigators — they're slower and feel less native

## Supabase

All database changes go through migrations in `supabase/migrations/`:

- **Naming**: `YYYYMMDDHHmmss_description.sql` (UTC timestamp)
- **RLS policies**: Always define Row Level Security policies
- **Triggers**: Use for automatic timestamps (`created_at`, `updated_at`)
- **Seed data**: In `supabase/migrations/`, run in order

Database types auto-generated in `supabase/types/database.types.ts` after migrations.

## Git & Package Manager

- **Package manager**: bun (never npm/yarn/pnpm) — see `.github/instructions/package-manager.instructions.md`
- **Lockfile**: `bun.lockb` (tracked in git)
- **Trusted postinstall scripts**: `unrs-resolver` for native binary setup

## IDE Setup

Copilot will automatically apply:

1. `.github/copilot-instructions.md` (this file) — always applied
2. `.github/instructions/*.instructions.md` — applied based on matching file patterns
   - `package-manager.instructions.md` — all files (`**`)
   - `react-native.instructions.md` — source files (`src/**/*.{ts,tsx}`)
   - `supabase-migrations.instructions.md` — migrations (`supabase/migrations/**`)

## Coding Practices

- Use linter feedback to improve code when making changes
- Handle errors and edge cases at the beginning of functions
- Use early returns for error conditions to avoid deeply nested `if` statements
- Place the happy path last in the function for improved readability
- Avoid unnecessary `else` — use if-return pattern instead
- Use guard clauses to handle preconditions and invalid states early
- Implement proper error logging and user-friendly error messages
- Consider using custom error types or error factories for consistent error handling

## When in Doubt

- **New component?** → Read `src/components/` structure; follow React Native best practices from `.github/instructions/react-native.instructions.md`
- **Styling question?** → Check `src/global.css` for color tokens; use dark mode variants automatically
- **Performance?** → Reference list/animation conventions in React Native instructions
- **Database change?** → Follow Supabase migration format in `.github/instructions/supabase-migrations.instructions.md`
