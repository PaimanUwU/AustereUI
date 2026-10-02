# Contributing to AustereUI

Thank you for your interest in contributing to **AustereUI**! 

AustereUI is a headless-primitive, copy-paste UI component library built on top of **React**, **Base UI** (`@base-ui/react`), **Tailwind CSS**, and **class-variance-authority (CVA)**. Like shadcn/ui, components live directly in user codebases rather than as black-box npm package dependencies.

Please take a moment to read this guide before submitting issues or pull requests.

---

## 🏛 Repository Architecture

AustereUI is organized into distinct zones within this repository:

| Directory | Purpose | Rule |
| :--- | :--- | :--- |
| **`registry/components/<name>/`** | **Component Source of Truth** | Where all real UI component code and their stories live. |
| **`registry/lib/`** | **Shared Utilities & Design Tokens** | Shared helpers (`utils.ts`, `colors.ts`) distributed to consumers. |
| **`scripts/`** | **Engine Room** | Registry builder (`build-registry.js`) and CLI tool (`bin.js`). |
| **`public/r/`** | **Distribution Hub** | Auto-generated endpoint files (`.json`, `.css`) consumed by `npx austereui add`. Never edit manually. |
| **`src/`** | **Consumer Playground** | Local Vite app to test how components behave when installed. |
| **`.storybook/`** | **Component Workbench** | Isolated visual testing, keyboard accessibility, and state inspection. |

---

## 🛠 Local Development Setup

### 1. Prerequisites
- **Node.js**: v20 or newer
- **npm** (or pnpm / yarn / bun)

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Start Storybook (Component Development)
Storybook discovers all component stories inside `registry/components/**`:
```bash
npm run storybook
```

### 4. Start the Playground App
To test how installed components render inside a consumer Vite app:
```bash
npm run dev
```

---

## 🧩 Adding or Modifying a Component

When developing a component from the checklist:

### 1. Create the Component Directory
Create a dedicated folder inside `registry/components/<component-name>/`:
```
registry/components/dialog/
├── dialog.tsx          # Component implementation
├── dialog.stories.tsx  # Storybook stories & a11y tests
└── index.ts            # Barrel export
```

### 2. Follow Component Standards
* **Headless Primitives**: Always use `@base-ui/react` primitives for accessibility, keyboard navigation, focus management, and ARIA attributes.
* **Styling with CVA**: Use `class-variance-authority` (`cva`) for variants and sizes.
* **Class Merging**: Combine class names using the `cn()` helper (`import { cn } from "../../lib/utils"`).
* **Theme Tokens**: **Never hardcode accent colors** (e.g. `bg-blue-600`). Use design tokens:
  - `bg-primary`
  - `text-primary-foreground`
  - `hover:opacity-90`
* **Forwarding Refs**: Always forward refs (`React.forwardRef`) and set `Component.displayName`.

### 3. Add Storybook Stories
In `<component-name>.stories.tsx`:
* Provide a default story and stories for all major variants and interactive states.
* Test keyboard navigation (e.g., `Esc` key to close, Arrow keys for navigation, Tab focus trap).

### 4. Build the Registry Output
After modifying or adding components, regenerate the registry JSON:
```bash
npm run build:registry
```
This automatically updates `public/r/<component-name>.json` so the CLI can serve it.

### 5. Test with the Local CLI
Test installing your component into the local consumer playground:
```bash
node scripts/bin.js add <component-name>
```
Verify that:
1. The file arrives in `src/components/ui/<component-name>.tsx`.
2. Relative imports resolve cleanly to `@/lib/utils`.
3. The component can be imported and rendered in `src/App.tsx`.

---

## 🎨 Working with Design Tokens & Themes

* Available built-in Tailwind colors and custom HEX palette logic are defined in [`registry/lib/colors.ts`](registry/lib/colors.ts).
* If you modify color token generation, run `npm run build:registry` to refresh all theme files in `public/r/themes/` and `public/r/colors.json`.
* You can test theme initialization prompts via:
  ```bash
  node scripts/bin.js init
  ```

---

## 📋 Quality & Testing Checklist

Before opening a pull request, ensure all verification steps pass locally:

- [ ] **Type check**: Run `npx tsc --noEmit` with zero errors.
- [ ] **Lint check**: Run `npm run lint` with zero errors.
- [ ] **Build validation**: Run `npm run build` to confirm the Vite app compiles.
- [ ] **Storybook build**: Run `npm run build-storybook` to confirm stories build without broken imports.
- [ ] **Registry up to date**: Run `npm run build:registry` and ensure no uncommitted registry drift.

---

## 💬 Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) to keep the git history clean and automate releases:

| Prefix | Description | Example |
| :--- | :--- | :--- |
| `feat(component)` | Adds or updates a registry component | `feat(dialog): implement modal with focus trap` |
| `fix(component)` | Fixes a bug or accessibility issue | `fix(button): preserve active shadow on click` |
| `theme(tokens)` | Updates color tokens or theme logic | `theme(colors): add oklch palette definitions` |
| `cli` | Improvements to the AustereUI CLI | `cli: support custom target directories` |
| `docs` | Documentation changes | `docs: add contributing guide` |
| `chore` | Maintenance or dependency bumps | `chore: update base-ui primitives` |

---

## 🚀 Submitting a Pull Request

1. Fork the repo and create your branch from `main`:
   ```bash
   git checkout -b feat/my-component
   ```
2. Commit your changes following the commit convention.
3. Push to your fork and submit a Pull Request targeting `main`.
4. Fill in the PR description detailing what component was added/changed and link to any relevant issue or checklist item.
