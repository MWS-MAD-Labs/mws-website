# Frontend Migration — MWS School Website

## Context

I already have an existing school website frontend built with vanilla HTML, CSS, and JavaScript.

Existing source:

```text
/home/mws-webdev/Downloads/Mockup_Remake_MWS/mockup3
```

This is a **frontend migration task**, not a redesign or backend/CMS implementation.

## Main Goal

Migrate the existing frontend to:

* React
* TypeScript / TSX
* React Router
* Existing styling approach or Tailwind CSS where appropriate

The final result must preserve the existing website's:

* visual design
* layout
* typography
* colors
* spacing
* responsive behavior
* navigation
* interactions
* content structure

**Do not redesign the website.**

The existing website is the source of truth.

---

## Important Scope

### DO

* Inspect the existing project first.
* Understand the existing pages, styles, assets, navigation, and JavaScript behavior.
* Migrate existing functionality to React.
* Create reusable React components where appropriate.
* Use TypeScript consistently.
* Use `.tsx` for React components.
* Use `.ts` for utilities, types, configuration, and non-JSX logic.
* Use React Router for navigation.
* Keep the architecture simple and maintainable.
* Preserve existing assets whenever possible.
* Keep the frontend ready for future CMS/backend integration.

### DO NOT

Do NOT build these yet:

* Backend
* Database
* API
* Authentication
* CMS
* Admin CRUD
* Admin dashboard
* Database schema
* CMS API
* Complex state management
* Unnecessary libraries

CMS/backend will be implemented later.

Do NOT rewrite the website from scratch without first inspecting the existing implementation.

Do NOT introduce unnecessary abstractions or enterprise-level architecture.

---

# Existing Frontend Architecture

Use this as the starting structure:

```text
client/
├── public/
└── src/
    ├── admin/
    ├── app/
    │   └── App.tsx
    ├── assets/
    ├── components/
    │   ├── layout/
    │   │   └── Navbar.tsx
    │   └── ui/
    ├── features/
    ├── hooks/
    └── pages/
        ├── level/
        ├── news/
        ├── Academic.tsx
        ├── admission.tsx
        ├── community-stories.tsx
        ├── contact.tsx
        ├── Home.tsx
        ├── kurikulum.tsx
        ├── our-school.tsx
        └── school-calendar.tsx
```

You may adjust this structure if inspection shows a simpler or more appropriate organization.

Prioritize:

1. Maintainability
2. Reusability
3. Clear separation of concerns
4. Simplicity

---

# Pages

Preserve all existing pages found during inspection.

Expected pages include:

```text
/
 /our-school
 /admission
 /academic
 /academic/kindergarten
 /academic/elementary
 /academic/high-school
 /school-calendar
 /news
 /community-stories
 /contact
```

Verify the actual existing project before assuming these are the complete list.

---

# Navigation

Public navbar should follow this concept:

```text
Home

Pages
├── Our School
├── Admission
├── School Calendar
├── School News
├── Community Stories
└── Other Pages

Academic
├── Kindergarten
├── Elementary
└── High School

Contact

Book a Tour
```

`Pages` and `Academic` are dropdown navigation items.

Use semantic navigation structure:

```text
header
└── nav
    ├── logo
    └── ul
        └── li
            └── Link / NavLink
```

Use React Router for navigation.

---

# Future CMS Consideration

Do not implement CMS now.

However, avoid tightly coupling content to UI components.

For example, reusable content structures may use local/static data for now:

```ts
const navigationItems = [
  {
    label: "Our School",
    path: "/our-school",
  },
];
```

The important thing is that future CMS data can replace these static values without requiring a major frontend rewrite.

---

# Migration Strategy

Follow this order:

## 1. Inspect

Inspect:

```text
/home/mws-webdev/Downloads/Mockup_Remake_MWS/mockup3
```

Identify:

* pages
* components
* assets
* styles
* scripts
* navigation
* interactions
* responsive behavior

## 2. Map

Map the existing implementation:

```text
HTML → React components/pages
CSS → React styling
JavaScript → React state/hooks/utilities
Links → React Router
Repeated UI → reusable components
```

## 3. Migrate

Migrate the frontend incrementally.

Do not change the design unless required for the migration.

## 4. Verify

Check:

* all pages work
* all routes work
* navigation works
* dropdowns work
* responsive layouts work
* assets load correctly
* existing interactions work
* no console errors
* no broken imports
* no broken routes

---

# Token / Agent Efficiency

**Be economical with tokens.**

* Do not repeatedly explain obvious changes.
* Do not output long explanations for simple tasks.
* Do not dump entire files unless necessary.
* Prefer concise progress updates.
* Inspect files directly instead of asking unnecessary questions.
* Make reasonable decisions based on the existing code.
* Do not narrate every command or internal step.
* Avoid unnecessary refactoring.
* Only discuss important findings, blockers, or decisions.

When a task is straightforward, implement it directly.

---

# Final Requirement

The result of this task should be:

```text
Existing HTML/CSS/JS
        ↓
React + TypeScript/TSX
        ↓
Reusable Components
        ↓
React Router
        ↓
Clean & Maintainable Frontend
        ↓
Future CMS/Backend Integration
```

**For this task, stop at the frontend migration.**

Do not implement the CMS or backend yet.
