# Real Estate Agency - Codebase Architecture Overview

This document provides a comprehensive structural overview of the entire real estate agency application codebase, describing the purpose of each major directory, its internal components, and its dependency relationships.

---

## 🏗️ High-Level Technology Stack

- **Framework**: Next.js 16 (App Router) & React 19
- **Language**: TypeScript 5
- **Database & ORM**: PostgreSQL & Prisma ORM 6
- **Styling**: Tailwind CSS v4, Framer Motion, Lucide Icons, Next Themes
- **Authentication & Security**: Jose (JWT), BcryptJS, Next.js Edge Middleware
- **Form Handling & Validation**: React Hook Form, Zod

---

## 📁 Major Directory Breakdown

```
real-estate-agency/
├── prisma/                 # Database schemas and SQL migrations
├── public/                 # Static public assets (images, favicons)
├── src/                    # Primary application source code
│   ├── app/                # Next.js App Router (Pages, API Routes, Actions)
│   │   ├── (agent)/        # Authenticated Agent Portal route group
│   │   ├── actions/        # Next.js Server Actions (Auth, Sessions)
│   │   ├── api/            # RESTful API route endpoints
│   │   ├── register/       # User registration page
│   │   ├── globals.css     # Global styles & Tailwind configuration
│   │   ├── layout.tsx      # Root HTML layout wrapper
│   │   └── page.tsx        # Login / landing page
│   ├── components/         # React UI component library
│   │   ├── agent/          # Agent portal dashboards, forms & widgets
│   │   ├── shared/         # Reusable navigation & status badges
│   │   ├── auth/           # Reserved for authentication forms
│   │   └── ui/             # Design system base primitives
│   ├── lib/                # Shared utilities & singleton instances
│   ├── schemas/            # Zod validation schemas
│   ├── types/              # TypeScript interface & type declarations
│   ├── context/            # React Context providers directory
│   └── middleware.ts       # Edge route protection & auth middleware
└── package.json            # Dependencies and scripts configuration
```

---

### 1. `prisma/` — Database & Schema Layer

- **What it does**:
  Houses the data architecture definitions and migration scripts.
  - `schema.prisma`: The master database schema file defining 14 PostgreSQL models (`User`, `Landlord`, `Property`, `Tenant`, `Lease`, `RentPayment`, `Contractor`, `Maintenance`, `RatesAndLevy`, `RatesAndLevyEntry`, `MoveRecord`, `PropertyDocument`, `Client`, `MaintenanceContact`) and 8 domain enums (`UserRole`, `PropertyType`, `PropertyStatus`, `TenantStatus`, `LeaseStatus`, `PaymentStatus`, `MaintenancePriority`, `MaintenanceStatus`, `MaintenancePaymentStatus`).
  - `migrations/`: Version-controlled SQL migration files tracking database schema evolution over time.

- **Dependencies**:
  - Direct dependency on PostgreSQL via `DATABASE_URL` environment variable.
  - `@prisma/client` package.

- **What Depends on it**:
  - `src/lib/prisma.ts`: Instantiates the global `PrismaClient`.
  - All API routes in `src/app/api/` and Server Actions in `src/app/actions/` perform database operations based on the generated Prisma Client.

---

### 2. `src/app/` — Next.js App Router (Pages, APIs & Actions)

- **What it does**:
  Serves as the main routing engine for the web application, handling page rendering, layout composition, server actions, and RESTful API endpoints.

  - **`src/app/(agent)/` (Authenticated Route Group)**:
    - `dashboard/`: Overview dashboard featuring KPI metrics, revenue/rent collection charts, and urgent maintenance alerts.
    - `properties/`: Real estate listings management (Grid/List views, add/edit modals, search filtering).
    - `clients/`: Lead and client CRM management page.
    - `maintenance/`: Maintenance ticket request tracking and contractor contact directory.
    - `payments/`: Financial tracking for tenant rent payments and lease statements.
    - `layout.tsx`: Wraps agent pages with `AgentHeader`, `AgentSidebar`, and dark/light theme providers.

  - **`src/app/actions/` (Server Actions)**:
    - `auth.ts`: Handles user authentication actions (login credential verification, account registration, password hashing with `bcryptjs`, and session JWT management).

  - **`src/app/api/` (15 RESTful API Endpoints)**:
    - Contains individual route handlers (`route.ts`) executing CRUD operations for:
      `client`, `contractor`, `landlord`, `lease`, `maintenance`, `maintenance-contact`, `move-record`, `property`, `property-document`, `rate-and-levy-entry`, `rates-and-levy`, `rent-payment`, `search`, `tenant`, and `user`.

  - **Root Pages & Layout**:
    - `page.tsx`: Application landing and user authentication login portal.
    - `register/page.tsx`: New agent registration page.
    - `layout.tsx`: Root HTML shell with font definitions, metadata, and theme provider wrappers.
    - `globals.css`: Tailwind CSS imports and custom utility styles.

- **Dependencies**:
  - `src/components/` for UI rendering.
  - `src/lib/` for database access and JWT sessions.
  - `src/schemas/` for input validation.
  - `src/types/` for TypeScript type checking.

- **What Depends on it**:
  - Web browser clients accessing frontend routes.
  - Client-side fetch requests calling backend `/api/...` routes.

---

### 3. `src/components/` — React UI Component Library

- **What it does**:
  Modular repository of frontend React components powering the user interface.

  - `agent/`: Components customized for agent workflows:
    - `AgentHeader.tsx`: Top header navigation bar with search bar and user profile dropdown.
    - `AgentSidebar.tsx`: Navigation sidebar with links to Dashboard, Properties, Clients, Maintenance, and Payments.
    - `AgentLayoutClient.tsx`: Client-side wrapper for agent views.
    - `KpiCard.tsx`: Metric display cards with trend indicators.
    - `RentChart.tsx`: Chart visualization component for monthly rent collection.
    - `UrgentTickets.tsx`: High-priority maintenance alert list.
    - `PropertyForm.tsx`, `ClientForm.tsx`, `MaintenanceForm.tsx`: Modal forms for creating and editing entities.
    - `ThemeProvider.tsx` & `ThemeToggle.tsx`: Dark/light mode theme switching.
  - `shared/`: Reusable cross-cutting UI elements:
    - `Header.tsx`, `StatusBadge.tsx`, `EmptyState.tsx`, `MobileBottomNav.tsx`.
  - `auth/`: Reserved for auth-specific components.
  - `ui/`: Design system base primitives.

- **Dependencies**:
  - `lucide-react` icons.
  - `framer-motion` for transitions.
  - `react-hook-form` for form management.
  - `src/types/` & `src/schemas/`.

- **What Depends on it**:
  - Next.js page components in `src/app/`.

---

### 4. `src/lib/` — Core Utilities & Singletons

- **What it does**:
  Provides system-wide helper functions, singleton database client initializations, and session security utilities.
  - `prisma.ts`: Instantiates and caches a singleton instance of `PrismaClient` to avoid memory leaks during Next.js hot module reloads.
  - `session.ts`: Handles JWT creation, encryption, decryption, cookie storage, and verification using `jose`.
  - `utils.ts`: Exports class name merging helper `cn(...)` combining `clsx` and `tailwind-merge`.
  - `validation.ts`: Shared input sanitization helpers.
  - `constants.ts`: System configuration constants.

- **Dependencies**:
  - `@prisma/client`, `jose`, `clsx`, `tailwind-merge`.

- **What Depends on it**:
  - API routes in `src/app/api/`.
  - Server actions in `src/app/actions/`.
  - Middleware in `src/middleware.ts`.
  - UI components in `src/components/`.

---

### 5. `src/schemas/` — Zod Data Validation Schemas

- **What it does**:
  Defines strict runtime data validation schemas using `zod`.
  - `property.ts`: Validates property creation and edit payloads (e.g. `propertyCode`, `propertyName`, `address`, `propertyType`, `status`, `landlordId`).

- **Dependencies**:
  - `zod`.

- **What Depends on it**:
  - `src/components/agent/PropertyForm.tsx` (Client-side validation).
  - `src/app/api/property/route.ts` (Server-side API validation).

---

### 6. `src/types/` — TypeScript Type Definitions

- **What it does**:
  Provides central TypeScript interfaces and type declarations shared across client components and server logic.
  - `property.ts`: Interface definitions for `Property`, `PropertyFormData`, `Tenant`, `Lease`, `Landlord`, `Maintenance`.

- **Dependencies**:
  - Standard TypeScript.

- **What Depends on it**:
  - React components in `src/components/`.
  - Page views in `src/app/(agent)/`.
  - API response typing in `src/app/api/`.

---

### 7. `src/middleware.ts` — Edge Route Protection & Authentication

- **What it does**:
  Next.js Edge Middleware executed before a request completes.
  - Reads the `session` JWT cookie.
  - Protects agent routes (`/dashboard`, `/properties`, `/tenants`, `/leases`, `/maintenance`, `/landlords`, `/contractors`, `/financials`, `/rates-levies`, `/analytics`). Unauthenticated requests are redirected to `/`.
  - Redirects authenticated users away from public routes (`/`, `/register`) to `/dashboard`.

- **Dependencies**:
  - `next/server` (`NextResponse`, `NextRequest`), `jose` (`jwtVerify`).

- **What Depends on it**:
  - Entire application HTTP request lifecycle.

---

### 8. `public/` — Static Public Assets

- **What it does**:
  Stores static assets served by Next.js at the root domain path (icons, images, logos).
- **Dependencies**: None.
- **What Depends on it**: Rendered HTML `<img src="..." />` tags and layout icons.

---

## 🔄 Summary of Dependency Flow Architecture

```
[ Browser / User Request ]
         │
         ▼
 ┌────────────────┐
 │ middleware.ts  │ ◄── (Verifies JWT Session using src/lib/session.ts)
 └───────┬────────┘
         │
         ▼
 ┌────────────────┐
 │   src/app/     │ ◄── (Renders UI using src/components/)
 └───────┬────────┘
         │
         ├───► API Routes (src/app/api/) ──► Validates inputs with src/schemas/
         │                                   Imports types from src/types/
         │
         ▼
 ┌────────────────┐
 │  src/lib/      │ ◄── (Provides singleton PrismaClient instance)
 └───────┬────────┘
         │
         ▼
 ┌────────────────┐
 │    prisma/     │ ◄── (Connects to PostgreSQL Database)
 └────────────────┘
```
