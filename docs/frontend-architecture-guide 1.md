# Frontend Architecture & Coding Standards — Next.js 16

**Audience:** Interns / new developers
**Goal:** Consistent, performant, fully responsive UI built with Atomic Design, Server Components by default, and flexbox-only layout. Follow this doc exactly — no guessing folder placement, no pixel-pushing with margins, no unnecessary `"use client"`.

---

## 1. Folder Structure — Atomic Design

```
src/
├── components/
│   ├── atoms/            # Smallest possible unit. Button, Input, Icon, Label, Spinner
│   │   └── Button/
│   │       ├── Button.tsx
│   │       └── index.ts
│   ├── molecules/         # Combination of atoms. SearchBar (Input + Button), FormField (Label + Input + ErrorText)
│   │   └── SearchBar/
│   │       ├── SearchBar.tsx
│   │       └── index.ts
│   ├── organisms/         # Combination of molecules/atoms, a distinct section. Navbar, ProductCard, Footer, UserForm
│   │   └── Navbar/
│   │       ├── Navbar.tsx
│   │       └── index.ts
│   ├── templates/         # Page-level layout skeleton, no real data — arranges organisms with placeholders/slots
│   │   └── DashboardTemplate/
│   │       ├── DashboardTemplate.tsx
│   │       └── index.ts
├── app/
│   └── dashboard/
│       └── page.tsx        # PAGE = template + real data. Pages are Server Components by default.
├── hooks/                  # Shared custom hooks (client-only logic)
├── lib/                    # utils, api, query (see API guide)
└── styles/
    └── globals.css
```

**Placement rule of thumb:**
- Can't be broken down further, no business meaning on its own → **atom**
- Groups 2+ atoms into one small reusable unit with one purpose → **molecule**
- A recognizable chunk of the UI made of molecules/atoms, may hold layout + local logic → **organism**
- Arranges organisms into a page skeleton, receives data as props, has no data-fetching itself → **template**
- `app/**/page.tsx` fetches data (Server Component) and passes it into a template → **page**

---

## 2. Server Components by Default — Client Components Are the Exception

**Rule:** Every component starts as a Server Component (RSC). You only add `"use client"` when a component genuinely needs one of these:

- `useState`, `useReducer`, `useEffect`, `useRef`
- Event handlers (`onClick`, `onChange`, `onSubmit`, etc.)
- Browser-only APIs (`window`, `localStorage`, `IntersectionObserver`)
- Third-party libraries that themselves require client rendering (some chart/animation libs)
- Context consumers (`useContext`) where the context is client-provided

### The "leaf client component" rule

When only *part* of an organism needs interactivity, **do not** mark the whole organism `"use client"`. Push the client boundary down to the smallest possible leaf.

```
organisms/ProductCard/
├── ProductCard.tsx          # Server Component — layout, static content, receives data as props
└── AddToCartButton.tsx      # "use client" — only this button needs interactivity
```

```tsx
// ProductCard.tsx — Server Component (no "use client")
import { AddToCartButton } from "./AddToCartButton";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export function ProductCard({ id, name, price, imageUrl }: ProductCardProps) {
  return (
    <div className="flex flex-col gap-3">
      <img src={imageUrl} alt={name} className="flex w-full" />
      <p className="flex justify-between">
        <span>{name}</span>
        <span>${price}</span>
      </p>
      <AddToCartButton productId={id} />
    </div>
  );
}
```

```tsx
// AddToCartButton.tsx — Client Component (leaf)
"use client";

import { useState } from "react";

export function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    // mutation call here (see React Query guide)
    setLoading(false);
  }

  return (
    <button onClick={handleClick} disabled={loading} className="flex justify-center">
      {loading ? "Adding..." : "Add to Cart"}
    </button>
  );
}
```

**Why this matters:** every `"use client"` boundary ships JS to the browser. Marking a whole page or organism as client when only a button needs interactivity bloats the bundle and kills the performance benefit of RSC. Atoms and molecules are almost always where `"use client"` lives (buttons, inputs, toggles) — organisms and templates should stay server unless they're inherently interactive (e.g. a client-side carousel).

---

## 3. Hooks — Correct Usage for Performance

| Hook | Use for | Common mistake to avoid |
|---|---|---|
| `useState` | Local, component-only UI state (toggle, input value, tab index) | Don't lift state higher than it needs to be — causes unnecessary re-renders of siblings |
| `useReducer` | Complex local state with multiple related fields/transitions | Don't use `useState` × 5 when a reducer models the transitions more clearly |
| `useEffect` | Syncing with external systems only (subscriptions, DOM measurements, analytics) | Never use `useEffect` to derive state from props/state — compute it directly during render instead |
| `useMemo` | Expensive computations that shouldn't rerun every render | Don't wrap trivial calculations — the memoization overhead can cost more than the calc itself |
| `useCallback` | Stabilizing function identity passed to memoized children or dependency arrays | Don't wrap every handler by default — only when it actually prevents a re-render or satisfies a dependency array |
| `React.memo` | Prevent re-render of a child when props are unchanged, especially list items | Don't memo components that always receive new object/array literals as props — memoize the value first |
| `useTransition` | Marking non-urgent state updates (filtering, tab switches on large trees) so input stays responsive | Don't use for data fetching — React Query already handles async state |
| Custom hooks (`useX`) | Extracting reusable stateful logic out of components | Don't create a custom hook for logic used only once — inline it until it's reused |

**General rule:** derive, don't sync. If a value can be computed from existing props/state during render, compute it directly — don't `useEffect` + `useState` to "sync" it.

---

## 4. Layout Rules — Flexbox Only, No Pixel Boxes, No Margin Adjustments

### 4.1 No fixed pixel dimensions for layout boxes

- Don't use `width: 320px` / `height: 200px` on layout containers. Use `flex`, `flex-1`, `min-w-0`, `max-w-*` (rem-based), or percentage/`fr` units.
- Pixel values are only acceptable for: border widths (`1px`), icon sizes at a fixed scale, and box-shadow offsets. Never for width/height/padding of layout containers.
- Use `rem`/`em` for anything spacing- or typography-related so it scales with root font size and respects user zoom/accessibility settings.

### 4.2 No margin for spacing between components

- **Never** use `margin-top` / `margin-bottom` / `mt-*` / `mb-*` on a component to space it from its sibling. Margins create invisible coupling — a component's spacing shouldn't depend on which component happens to sit next to it in a given page.
- Instead, the **parent** owns spacing via flexbox `gap`:

```tsx
// ❌ WRONG — child controls its own external spacing
<div>
  <Card className="mb-4" />
  <Card className="mb-4" />
  <Card />
</div>

// ✅ CORRECT — parent owns spacing via gap
<div className="flex flex-col gap-4">
  <Card />
  <Card />
  <Card />
</div>
```

- Exception: `margin: auto` for centering a single item within a flex container (`ml-auto` to push an item to the end) is fine — that's alignment, not spacing-between-siblings.

### 4.3 Flexbox-first responsiveness

- Every layout container is `flex` (row or column) unless it's a true grid of unknown-count repeating items (e.g. a photo grid), in which case CSS Grid with `auto-fit`/`minmax()` is acceptable — confirm with a senior dev before reaching for grid.
- Use `flex-wrap` + `gap` instead of manually breakpointing individual pixel widths.
- Responsive changes go through Tailwind breakpoint prefixes changing **flex-direction, gap size, or wrap**, not through changing fixed pixel widths per breakpoint:

```tsx
// ✅ Stacks on mobile, row on desktop, gap scales with breakpoint
<div className="flex flex-col md:flex-row gap-3 md:gap-6">
  <Sidebar />
  <MainContent />
</div>
```

- Children that should grow/shrink proportionally use `flex-1` / `flex-grow` / `flex-shrink-0`, not manual width percentages recalculated per breakpoint.
- Always set `min-w-0` on flex children that contain text, to prevent overflow breaking the layout on small screens.

### 4.4 Checklist for any new layout container

- [ ] Container uses `flex` (or documented Grid exception)
- [ ] Spacing between children uses `gap`, not child `margin`
- [ ] No hardcoded `px` width/height on the container itself
- [ ] Responsive behavior achieved via `flex-direction`/`gap`/`wrap` changes at breakpoints, not fixed-width overrides
- [ ] Text-containing flex children have `min-w-0` to prevent overflow

---

## 5. Component File Standards

```tsx
// atoms/Button/Button.tsx
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
}

export function Button({ variant = "primary", children, className, ...props }: ButtonProps) {
  const variantClasses = {
    primary: "bg-blue-600 text-white",
    secondary: "bg-gray-200 text-gray-900",
    ghost: "bg-transparent text-blue-600",
  };

  return (
    <button
      className={`flex items-center justify-center gap-2 rounded-md px-4 py-2 ${variantClasses[variant]} ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

**Rules:**
- One component per file. File name matches component name.
- Every component folder has an `index.ts` barrel export: `export * from "./Button";`
- Props always typed with an interface named `<Component>Props`, never `any`.
- Extend native HTML element props (`ButtonHTMLAttributes`, etc.) instead of re-declaring `onClick`, `disabled`, etc.
- No inline styles (`style={{}}`) except for genuinely dynamic values Tailwind can't express (e.g. a computed `transform` from JS). Everything else is Tailwind utility classes.

---

## 6. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Component files/folders | PascalCase | `ProductCard/ProductCard.tsx` |
| Hooks | camelCase, `use` prefix | `useDebouncedValue.ts` |
| Utility functions | camelCase | `formatCurrency.ts` |
| Types/interfaces | PascalCase, `Props` suffix for component props | `ProductCardProps` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_UPLOAD_SIZE_MB` |
| CSS/Tailwind class ordering | layout → spacing → sizing → typography → color → state | `flex flex-col gap-4 w-full text-sm text-gray-700 hover:text-black` |

---

## 7. Performance & Accessibility Standards

- Use `next/image` for all images (automatic responsive sizing, no manual pixel `width`/`height` guessing — use `fill` with a flex-sized parent when the container is fluid).
- Use `next/link` for all internal navigation — never `<a href>` for internal routes.
- Lazy-load below-the-fold organisms with `next/dynamic` when they're heavy (charts, editors, modals).
- Every interactive atom (`Button`, `Input`, icon-buttons) must have accessible labeling: `aria-label` when there's no visible text, proper `<label htmlFor>` association for inputs.
- Semantic HTML first: `<nav>`, `<main>`, `<section>`, `<button>` over generic `<div onClick>`.
- Keyboard navigability: anything clickable must be focusable and operable via keyboard (native `<button>`/`<a>` give you this for free — that's another reason to avoid `<div onClick>`).

---

## 8. Checklist Before Opening a PR

- [ ] New component placed in the correct atomic tier (atom/molecule/organism/template)
- [ ] Component is a Server Component unless it genuinely needs interactivity/browser APIs
- [ ] `"use client"` pushed to the smallest leaf component possible, not the whole organism/page
- [ ] No `useEffect` used to derive state that could be computed during render
- [ ] `useMemo`/`useCallback` only used where they prevent a real re-render, not by default
- [ ] No fixed `px` width/height on layout containers
- [ ] No `margin` used to space sibling components — parent uses `flex` + `gap`
- [ ] Responsive behavior handled via flex direction/gap/wrap at breakpoints
- [ ] Text-containing flex children have `min-w-0`
- [ ] Component has typed props (`<Component>Props` interface), no `any`
- [ ] Images use `next/image`, internal links use `next/link`
- [ ] Interactive elements are semantic and keyboard-accessible

---

## 9. Common Mistakes to Avoid

| Mistake | Why it's wrong | Fix |
|---|---|---|
| `"use client"` at the top of a whole page/organism for one button | Ships unnecessary JS to the client, kills RSC benefits | Extract the interactive bit into its own leaf client component |
| `<div className="mb-4">` on every card in a list | Couples spacing to component identity, breaks if order changes | Parent `<div className="flex flex-col gap-4">` |
| `width: 240px` on a sidebar | Breaks on smaller screens, not fluid | `flex-shrink-0 w-60` (rem-based) or `basis-1/4` inside a flex row |
| `useEffect(() => setFiltered(items.filter(...)), [items])` | Unnecessary render + effect cycle for a derivable value | Compute `const filtered = items.filter(...)` directly in the render body |
| Business logic and data fetching inside an atom/molecule | Breaks reusability, atoms should be presentation-only | Fetch in the page (Server Component) or organism, pass data down as props |
| Wrapping every function in `useCallback` "just in case" | Adds overhead without benefit unless passed to a memoized child or effect dependency | Only use when it demonstrably prevents a re-render |

---

## 10. Adding a New UI Piece — Step by Step

1. Decide the atomic tier: can it be built from existing atoms/molecules (→ molecule/organism), or is it a new primitive (→ atom)?
2. Create the folder under the right tier with `<Name>.tsx` + `index.ts`.
3. Default to a Server Component. Only add `"use client"` if you hit a real need (state, effects, events, browser APIs) — and if so, try to isolate just that part into its own leaf component first.
4. Layout inside the component: `flex` + `gap`, rem-based sizing, no margins for sibling spacing, no fixed pixel widths/heights.
5. Type all props with a `<Component>Props` interface.
6. If the component needs data, fetch it in the page (`app/**/page.tsx`) or a Server Component organism, and pass it down — don't fetch inside atoms/molecules.
7. Run through the checklist in section 8 before requesting review.

If a case doesn't fit neatly into atoms/molecules/organisms/templates, ask before inventing a new category — consistency matters more than a perfect taxonomy fit.
