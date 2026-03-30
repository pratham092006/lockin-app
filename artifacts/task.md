# AuraFit UI Overhaul Tasks

- `[x]` **Phase 1: Design System Foundation (`index.css` & `theme.js`)**
    - `[x]` Install/Import Google Fonts (Inter, Montserrat, JetBrains Mono)
    - `[x]` Define strict Dark Mode color palette (Charcoal, Electric Lime, Cyan, Purple-Pink gradients).
    - `[x]` Create base utility CSS classes for Apple-esque glassmorphism (1px border, blur, 24px radius).
    - `[x]` Define fluid micro-animations (glows, haptic pops) in `index.css`.
- `[x]` **Phase 2: Global UI Component Refactoring (`Layout.jsx`, `App.jsx`)**
    - `[x]` Refactor the global layout structure, sidebar, and bottom nav to match the dark glassmorphism context.
    - `[x]` Ensure routes use appropriate typography mappings for headers.
- `[x]` **Phase 3: The Dashboard Refactoring**
    - `[x]` Implement "Bento Box" layout grid in `Dashboard.jsx`.
    - `[x]` Overhaul Energy Balance ring into a 3D isometric look.
    - `[x]` Implement Habit Heatmap visually (Purple to Pink glowing gradient).
    - `[x]` Update typography hierarchy (Headers: Montserrat, Data: JetBrains Mono).
- `[x]` **Phase 4: Workouts View Refactoring**
    - `[x]` Create horizontal scrollable "Workout Cards" with image overlays and bold typography.
    - `[x]` Add neon cyan/lime glows for active and success states in the set tracking interactions.
