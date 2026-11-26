# AGENTS.md — TailAdmin Pro

Next.js 16 (App Router) · React 19 · strict TypeScript · Tailwind CSS v4 · next-intl v4 · Base UI · react-hook-form + zod · TanStack Table · ApexCharts · FullCalendar · Swiper · flatpickr

- Scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint` (`eslint .`). Format with Prettier (`prettier-plugin-tailwindcss` sorts classes). Node >= 20.9.
- Path alias `@/*` → `src/*`. Use it for cross-folder imports; relative imports within a feature folder.
- Don't install new packages without asking the user. Check `package.json` first. Most needs are already covered.

## Repo map

Route groups `(name)/` don't affect URLs. Component folders mirror the route groups. Explore below this level directly.

```
src/
├── app/[locale]/                 # every page lives under [locale]
│   ├── (admin-layout)/           # sidebar + header shell
│   │   ├── (main)/               # dashboards, ai-assistant, e-commerce, forms, tables, task, calendar, pages, empty-state, profile
│   │   ├── (others)/             # charts, maps, ui-elements demos
│   │   └── (support)/            # chat, email, support tickets
│   ├── (full-width-pages)/       # no shell: (auth), (error-pages), coming-soon, success
│   ├── (layouts)/                # alternative shells: layout-one … layout-six
│   ├── [...rest]/                # catch-all → notFound()
│   ├── not-found.tsx
│   └── layout.tsx                # root: NextIntlClientProvider → ThemeProvider → DirectionProvider → TooltipProvider
├── components/
│   ├── ui/                       # primitives (Base UI + cva): button, dialog, sheet, field, input, select, combobox, table, tabs, sidebar…
│   ├── common/                   # component-card, page-breadcrumb, grid-shape, vector-map
│   ├── main/<area>/              # e.g. main/dashboard/analytics/active-user-graph/
│   ├── others/                   # charts, maps, ui-elements
│   ├── support/                  # chat, email, support
│   └── full-width-pages/         # auth, pages
├── layout/
│   ├── app-layout/{header,sidebar}/  # main shell; nav menu is sidebar/data.tsx
│   ├── header/                   # notification-dropdown, theme-toggler, user-dropdown
│   └── layout-one … layout-six/  # {header,sidebar} for the alternative shells
├── context/theme-context.tsx     # ThemeProvider / useTheme (light | dark | auto)
├── hooks/use-mobile.ts           # useIsMobile (< xl)
├── icons/                        # icon components + index.tsx barrel
├── i18n/                         # routing.ts, request.ts, navigation.ts, languages.ts
├── messages/                     # en.json, ar.json, es.json, de.json
├── utils/                        # cn, getInitials (barrel: "@/utils")
└── proxy.ts                      # next-intl middleware
```

- New admin page: add the route under the right group, then add its menu entry in `src/layout/app-layout/sidebar/data.tsx`. Renamed routes get a permanent redirect in `next.config.ts` `redirects()`.

## Components

- **Files and folders are kebab-case** (`card-header.tsx`, `use-mobile.ts`). Components use `export default function`.
- **One widget, one folder**: `index.tsx` composes the parts; split sections into sibling files (`card-header.tsx`, `transaction-row.tsx`) and keep static data/types/helpers in `data.ts`, `types.ts`, `utils.ts`. No monolithic files.
- Define a typed props interface per sub-component. Keep state in the container (`index.tsx`) and keep the parts presentational.
- Build from `@/components/ui/*` primitives before raw HTML or new libraries. They wrap `@base-ui/react` and use `cva` variants. Add a variant there instead of overriding styles at call sites. Merge classes with `cn` from `@/utils`.
- Pages: `PageBreadcrumb` (`@/components/common/page-breadcrumb`) at the top, sections wrapped in `ComponentCard` (`@/components/common/component-card`). Static `export const metadata` per page.
- Modals/drawers: `@/components/ui/dialog` / `sheet`. Tooltips: `@/components/ui/tooltip` (provider is already in the root layout).
- Add `"use client"` for hooks, event handlers, or browser APIs. Server layouts/pages inside `[locale]` call `setRequestLocale(locale)` (all `(layouts)/*` and the ai-assistant/support pages do).
- Global state: `useTheme` (`@/context/theme-context`) and `useSidebar` (`@/components/ui/sidebar`). Don't add new providers without need.
- **Forms**: `react-hook-form` + `zodResolver` with a zod schema, rendered with `ui/field` + `ui/input` (see `full-width-pages/auth/sign-in/form.tsx`).
- **Tables**: `@tanstack/react-table` rendered through `@/components/ui/table` (see `main/tables/data-tables/`).
- **Charts**: always `const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })`, never a static import.
- **FullCalendar / Swiper / flatpickr**: imported inside a `"use client"` component (see `main/calendar/`, `others/ui-elements/carousels/`, `main/forms/form-elements/default-inputs/date-picker-input.tsx`). Follow that pattern.
- **Icons**: each icon is `src/icons/<kebab-name>.tsx` exporting `function NameIcon(props: IconProps)`, re-exported from `src/icons/index.tsx`. Import from `@/icons`. Never inline SVG in components. (Multi-color assets like the flags are `.svg` files re-exported via SVGR.)

## i18n (next-intl)

- `Link`, `useRouter`, `usePathname`, `redirect` come from `@/i18n/navigation`, never `next/link` / `next/navigation`. (`notFound` and `useParams` from `next/navigation` are fine.)
- Locales `en`, `ar`, `es`, `de` are configured in `src/i18n/routing.ts` (`localePrefix: "never"`, so URLs carry no locale).
- Client: `useTranslations("ns")`. Server: `getTranslations("ns")` from `next-intl/server`. Nest keys by feature (`ecommerce.metrics.customers`).
- Translated today: dashboards (`main/dashboard/*`), headers, sidebar, dropdowns, not-found. Top-level namespaces: `common`, `sidebar`, `header`, `userDropdown`, `notFound`, plus one per dashboard. Other demo pages are still hardcoded English.
- New user-facing text uses translations. Never leave a hardcoded string in an already-translated area. Add every key to **all four** `src/messages/*.json` files.
- `ar` is RTL (`isRtl(locale)` in `src/i18n/languages.ts`). See the styling rules below.

## Styling (Tailwind v4)

- The theme lives in `src/app/globals.css` under `@theme`. There is no `tailwind.config`, so don't create one. Plugins: `@tailwindcss/forms`, `tw-animate-css`.
- Use tokens only, with no hex or pixel values in `className`:
  - Colors: `brand-50…950`, `gray-*`, `white`, `black`, `current`, `transparent`, plus Tailwind defaults.
  - Type: `font-outfit`, `text-heading-one…six`, `text-title-sm` / `text-title-lg`, plus standard sizes.
  - Shadows: `shadow-theme-xs…xl`, `shadow-focus-ring`, `shadow-tooltip`, `shadow-datepicker`, `shadow-slider-navigation`, `drop-shadow-4xl`.
  - Breakpoints: `2xsm` (375), `xsm` (425), `3xl` (2000) plus defaults. Z-index: `z-1`, `z-9`, `z-99` … `z-999999`.
  - Exception: chart option objects (`ApexOptions.colors`) take hex values copied from `@theme` (e.g. `#465fff` = brand-500).
- **Dark mode is class-based** (`.dark`). Every styled element needs its `dark:` variant.
- **Logical properties only** (RTL). Use `ms/me`, `ps/pe`, `start/end`, `border-s/e`, `rounded-s/e/ss/se/es/ee`, `text-start/end`, never `ml/mr`, `pl/pr`, `left/right`, `border-l/r`, `rounded-l/r`, `text-left/right`.
  - Flip directional glyphs (arrows, chevrons, prev/next) with `rtl:rotate-180` or `rtl:-scale-x-100`.
  - Mirror sliding elements: `-translate-x-full rtl:translate-x-full`. Use `ltr:` / `rtl:` for any other directional override.
- Reuse existing `@utility` classes in `globals.css` (`menu-item-*`, `menu-dropdown-*`, `nav-icon-item-*`, `docs-menu-item-*`, `docs-border-item-*`, `custom-scrollbar`, `no-scrollbar`) before adding new ones.
- Third-party overrides (ApexCharts, flatpickr, Swiper, simplebar, Prism, FullCalendar) go in the "third-party libraries CSS" section at the bottom of `globals.css`, in the existing `@apply` style. Their base CSS is imported in the root `layout.tsx`.

## AI Agent Development Rules

### 1. Core Principle

Your primary responsibility is to continue and improve the existing project without disrupting its current implementation.

IMPORTANT: Do not rebuild, redesign, refactor, or modify existing implementations unless explicitly instructed by the user.

Always prioritize maintaining the existing project structure, coding patterns, architecture, and behavior.

### 2. Preserve Existing Code

- Do not modify, delete, or rewrite existing code unnecessarily.
- Do not remove existing components, files, functions, or logic.
- Do not replace existing implementations with different approaches without explicit permission.
- Do not perform unnecessary refactoring or code optimization.
- Do not change existing dependencies or package versions unless explicitly requested.
- Only modify the specific parts required to complete the requested task.
- Ensure all existing functionality continues to work after every change.

### 3. Preserve UI/UX Design

- Do not change the existing UI design or layout.
- Do not redesign existing pages or components.
- Do not change colors, typography, spacing, sizing, borders, shadows, or animations.
- Do not change existing responsive behavior.
- Do not move, remove, or rearrange existing UI elements.
- Do not introduce a new design system or styling approach.
- Follow the existing visual design and component patterns when creating new UI elements.

Any new UI must seamlessly match the existing application's design and user experience.

### 4. Preserve Existing Functionality

- Never break, remove, or alter existing features.
- Preserve all existing business logic and application workflows.
- Do not change API integrations, authentication, authorization, or database logic unless explicitly requested.
- Maintain existing form validations and submission behavior.
- Preserve routing, navigation, and state management.
- Ensure existing buttons, links, menus, and interactive elements continue functioning as intended.

### 5. Next.js Project Guidelines

- Follow the existing Next.js architecture and project conventions.
- Respect the current App Router or Pages Router implementation.
- Maintain existing Server Components and Client Components boundaries.
- Follow the existing TypeScript and JavaScript conventions.
- Reuse existing components, hooks, utilities, and services whenever possible.
- Follow the existing API routes, server actions, and data-fetching patterns.
- Do not introduce unnecessary libraries or dependencies.
- Preserve existing environment variable names and configurations.

### 6. Development Approach

Before implementing any changes:

- Inspect the existing project structure.
- Understand the relevant components and their dependencies.
- Identify existing functions and implementations related to the requested task.
- Determine the smallest possible changes needed.
- Reuse existing code whenever possible.
- Implement only what is necessary.

Do not make assumptions about how the project works. Inspect the existing implementation first.

### 7. Modification Restrictions

You are only allowed to:

- Add new functionality requested by the user.
- Extend existing functionality without breaking its current behavior.
- Add new components when necessary.
- Add new files when necessary.
- Fix bugs directly related to the requested task.
- Make minimal changes required for compatibility.

You are NOT allowed to:

- Redesign existing pages.
- Rewrite the entire application.
- Change existing UI/UX.
- Remove existing features.
- Change unrelated code.
- Rename existing files, components, variables, or functions unnecessarily.
- Change the project's architecture without permission.

### 8. Code Quality

- Write clean, readable, and maintainable code.
- Follow the existing coding style.
- Avoid unnecessary duplication.
- Use existing utilities and shared components.
- Maintain proper TypeScript types where applicable.
- Avoid introducing unnecessary complexity.
- Handle errors appropriately.
- Keep changes minimal and focused.

### 9. Testing and Verification

After implementing changes:

- Verify that the requested functionality works correctly.
- Check that existing functionality remains unaffected.
- Check for TypeScript errors and linting issues when applicable.
- Verify that the application builds successfully when possible.
- Check responsive behavior if UI changes are involved.
- Do not claim that tests or builds passed unless they were actually executed.

### 10. Communication and Reporting

After completing each task, provide a short report containing:

- What was implemented.
- Which files were modified or added.
- What existing functionality was preserved.
- Any issues or limitations encountered.

If a requested change requires modifying existing functionality, UI/UX, layout, or architecture, ask for user confirmation before proceeding.

### 11. Most Important Rule

**CONTINUE, DON'T REBUILD.**

Your role is to continue developing the existing Next.js project, not to create a new implementation or change the developer's original vision.

- Preserve everything that already works.
- Make only the necessary changes.
- Do not modify existing code, UI/UX, layouts, or functionality unless explicitly instructed by the user.
- When in doubt, leave the existing implementation untouched and ask for clarification.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
