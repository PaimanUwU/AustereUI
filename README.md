# AustereUI
 
A copy-paste React UI kit in the spirit of shadcn/ui: neo-brutalist styling on
[Base UI](https://base-ui.com) primitives with Tailwind CSS. Users don\'t install it
as a dependency. The component source is copied into their own project.
 
## Layout
 
| Path | Purpose |
| --- | --- |
| `registry/components/` | Component source of truth (`button.tsx`) and its stories (`button.stories.tsx`) |
| `registry/lib/`, `registry/hooks/` | Shared utilities (`cn`) and hooks |
| `registry/styles/globals.css` | Tailwind entry, used by Storybook only |
| `.storybook/` | Storybook config. Reads stories straight from `registry/` |
| `scripts/build-registry.mjs` | Converts `registry/components/*.tsx` into JSON |
| `public/r/` | Generated output, hosted statically (gitignored) |
| `packages/` | Workspace packages. `cli/` is a placeholder for a future custom CLI |
| `docs/components-checklist.md` | Planned components and progress |
 
## Develop
 
```bash
npm install
npm run storybook        # http://localhost:6006
npm run typecheck
npm run build:registry   # → public/r/*.json
```
 
## Add a component
 
1. Create `registry/components/<name>.tsx` and `<name>.stories.tsx`.
2. Import `cn` from `@/lib/utils`. Import other AustereUI components as
   `@/components/ui/<other>`. **Never use relative imports between components.**
3. Run `npm run build:registry`. npm dependencies and inter-component
   dependencies are detected from the imports.
 
## Use it (consumer side)
 
```bash
npx shadcn@latest init
npx shadcn@latest add https://austereui.com/r/button.json
```
 
Test locally before deploying:
 
```bash
REGISTRY_URL=http://localhost:4000/r npm run build:registry
npx serve public -l 4000
# in a separate test project:
npx shadcn@latest add http://localhost:4000/r/button.json
```'
 
write_file docs/components-checklist.md '# Component checklist
 
Implementation tracker for AustereUI (61 components). Tick a box once the component is in `registry/components/`, has a story, and builds with `npm run build:registry`.
 
"(last)" = deliberately built after the primitives it depends on.
 
## 01 • Foundations & Inputs (19)
 
- [ ] Typography
- [ ] Kbd
- [ ] Separator
- [x] Button — starter, reference implementation
- [ ] Button Group
- [ ] Input
- [ ] Input Group
- [ ] Textarea
- [ ] Checkbox
- [ ] Radio Group
- [ ] Switch
- [ ] Toggle
- [ ] Toggle Group
- [ ] Select
- [ ] Native Select
- [ ] Combobox
- [ ] Date Picker
- [ ] Input OTP
- [ ] Field
 
## 02 • Navigation & Layout (22)
 
- [ ] Breadcrumb
- [ ] Sidebar (last)
- [ ] Navbar (last)
- [ ] Footer (last)
- [ ] Navigation Menu (last)
- [ ] Menubar
- [ ] Tabs
- [ ] Pagination
- [ ] Scroll Area
- [ ] Resizable
- [ ] Item
- [ ] Badge
- [ ] Avatar
- [ ] Bubble
- [ ] Message
- [ ] Message Scroller
- [ ] Marker
- [ ] Attachment
- [ ] Progress
- [ ] Spinner
- [ ] Skeleton
- [ ] Empty
 
## 03 • Feedback & Overlays (20)
 
- [ ] Popover
- [ ] Tooltip
- [ ] Toast
- [ ] Dialog
- [ ] Alert Dialog
- [ ] Sheet
- [ ] Drawer
- [ ] Hover Card
- [ ] Collapsible
- [ ] Context Menu
- [ ] Dropdown Menu
- [ ] Accordion
- [ ] Command
- [ ] Alert
- [ ] Calendar
- [ ] Table
- [ ] Data Table
- [ ] Questionnaire
- [ ] Slider
- [ ] Label
