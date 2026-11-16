# Real Estate Agency Portal - System Documentation & Scope Guide

## Executive Summary

The **Real Estate Agency Management Portal** is a web-based property and tenancy management system designed to streamline property agency operations. It centralizes real estate asset records, tenant occupancy tracking, lease lifecycle monitoring, contractor job tracking for maintenance, financial tracking for rent collections, and municipal rates/levies tracking.

This document outlines the project scope, system architecture, target user personas, database structure, and instructions for developers, business leadership, and system administrators.

---

## Stakeholder & Audience Overview

| Stakeholder Group | Needs & Expectations | Primary Interactions |
| :--- | :--- | :--- |
| **Business / Executive Leadership** | Scope visibility, Operational efficiency metrics, Portfolio oversight, Compliance & audit readiness. | Performance overview dashboard, Financial summaries, Portfolio occupancy status. |
| **Agents & Property Managers** | Intuitive workspace to manage daily listings, leases, tenant communications, and maintenance jobs. | Property catalog, Lease generation & monitoring, Maintenance request assignment, Client profiles. |
| **Accountants & Finance Staff** | Rent tracking, payment verification, overdue notices, municipal rates and levies tracking. | Payment ledger, Monthly billing grids, Landlord commission tracking. |
| **Developers & Tech Ops** | Clear codebase structure, database schema, extensible APIs, maintainable architecture. | Next.js 16 App Router, Prisma ORM, PostgreSQL database, Server Actions, JWT authentication. |

---

## Business Scope & Functional Features

```
               ┌─────────────────────────────────────────────────┐
               │          Real Estate Agency Portal              │
               └────────────────────────┬────────────────────────┘
                                        │
      ┌──────────────────┬──────────────┼──────────────┬──────────────────┐
      ▼                  ▼              ▼              ▼                  ▼
┌───────────┐      ┌───────────┐  ┌───────────┐  ┌───────────┐      ┌───────────┐
│ Property  │      │  Tenancy  │  │ Financial │  │Maintenance│      │  Client   │
│Management │      │  & Lease  │  │ & Rent    │  │ & Repair  │      │ Management│
└─────┬─────┘      └─────┬─────┘  └─────┬─────┘  └─────┬─────┘      └─────┬─────┘
      │                  │              │              │                  │
 ├─ Codes & Names   ├─ Active Leases  ├─ Rent Grids  ├─ Issue Logging   ├─ Landlords
 ├─ Sub-units       ├─ Expiry Alerts  ├─ Overdue Logs├─ Contractor Mgt  ├─ Tenants
 ├─ Rates & Levies  ├─ Deposits       ├─ Payment Recs├─ Cost & Priority ├─ Role Access
```

### Core System Domains

#### 1. Property Portfolio Management
* **Property Hierarchy**: Support for standalone properties as well as parent-child relationships (e.g., Building vs. Individual Apartments/Offices).
* **Property Classification**: Types including House, Apartment, Townhouse, Commercial, Office, Land, and custom categories.
* **Status Tracking**: Live operational status (`AVAILABLE`, `OCCUPIED`, `UNDER_MAINTENANCE`, `INACTIVE`).
* **Document Repository**: Associated file attachments and property documentation.

#### 2. Tenant & Lease Lifecycle Tracking
* **Lease Management**: Date tracking (Start, Expiry, Renewal dates), Monthly rental rate, and Security Deposits held.
* **Lease Status Logic**: Dynamic statuses (`ACTIVE`, `EXPIRING_SOON`, `EXPIRED`, `CRITICAL`, `TERMINATED`).
* **Move Records**: Logging Tenant Move-In and Move-Out events with historical notes.

#### 3. Financials & Utility Tracking
* **Rent Ledger**: Monthly payment matrix (`PAID`, `PARTIAL`, `PENDING`, `OVERDUE`) per lease.
* **Landlord Commission Management**: Tracking landlord profiles and configured commission rates.
* **Rates & Levies Accounts**: Tracking municipal accounts, monthly utility entries, due dates, and settlement status.

#### 4. Maintenance & Contractor Operations
* **Job Ticketing**: Issue description, priority level (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), status lifecycle (`REPORTED`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
* **Contractor Directory**: Beneficiary details, contact details, standard rates/specialties, and assigned maintenance logs.

#### 5. User Roles & Access Control
* **Authentication**: JWT-based session state (`jose`, `jsonwebtoken`) stored securely in HTTP-only cookies.
* **Role Hierarchy**:
  * `ADMIN`: Complete system configuration, user provisioning, database oversight.
  * `AGENT`: Portfolio listing operational management, tenant & lease administration, maintenance ticketing.
  * `ACCOUNTANT`: Read/Write access to payment reconciliations, rates/levies tracking, financial ledgers.

---

## Technical Stack & Architecture

### Core Technologies
* **Framework**: Next.js 16 (React 19, Server Actions, App Router)
* **Database & ORM**: PostgreSQL via Prisma ORM 6.x
* **Security & Auth**: `bcryptjs` for password hashing, `jose` for JWT session tokens
* **Validation**: `zod` schema validation
* **Styling & UI**: Tailwind CSS v4, Framer Motion animations, Lucide React / React Icons

### Data Architecture Overview

```mermaid
erDiagram
    User {
        int id PK
        string email UK
        string role
        boolean isActive
    }
    Landlord {
        int id PK
        string displayName
        decimal commissionRate
    }
    Property {
        int id PK
        string propertyCode UK
        string propertyName
        enum status
        int landlordId FK
        int parentPropertyId FK
    }
    Tenant {
        int id PK
        string email UK
        int propertyId FK
    }
    Lease {
        int id PK
        int propertyId FK
        int tenantId FK
        decimal monthlyRent
        enum status
    }
    RentPayment {
        int id PK
        int leaseId FK
        int month
        int year
        enum status
    }
    Maintenance {
        int id PK
        int propertyId FK
        int contractorId FK
        enum priority
        enum status
    }
    Contractor {
        int id PK
        string contractorName
        string speciality
    }

    Landlord ||--o{ Property : owns
    Property ||--o{ Property : parent_child
    Property ||--o{ Tenant : houses
    Property ||--o{ Lease : assigned_to
    Tenant ||--o{ Lease : holds
    Lease ||--o{ RentPayment : tracks
    Property ||--o{ Maintenance : requires
    Contractor ||--o{ Maintenance : resolves
```

---

## Directory & File Structure Guide

```
real-estate-agency/
├── prisma/
│   └── schema.prisma        # Database models & enums definition
├── src/
│   ├── app/                 # Next.js App Router root
│   │   ├── (agent)/         # Agent dashboard routes (layout, navbar, sidebars)
│   │   │   ├── dashboard/   # Key metrics and performance indicators
│   │   │   ├── properties/  # Property management pages
│   │   │   ├── clients/     # Tenants & Landlords view
│   │   │   ├── maintenance/ # Work orders & contractors
│   │   │   └── payments/    # Rent payment matrix & ledgers
│   │   ├── actions/         # Server Actions (Auth, Property CRUD, etc.)
│   │   ├── api/             # RESTful API route handlers
│   │   └── register/        # Registration & Auth onboarding
│   ├── components/          # Reusable UI components (Headers, Sidebars, Forms)
│   └── lib/                 # Core helper libraries (Prisma client instance, JWT session helpers)
├── .env                     # Environment variables configuration
└── package.json             # Package scripts & dependencies
```

---

## Developer Onboarding & Local Setup

### Prerequisites
* **Node.js**: `v20.x` or higher
* **npm**: `v10.x` or higher
* **PostgreSQL Database**: Local or hosted database instance

### Installation Steps

1. **Clone & Install Dependencies**:
   ```bash
   git clone <repository-url>
   cd real-estate-agency
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the project root:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/real_estate_db?schema=public"
   JWT_SECRET="your-secure-jwt-secret-key"
   ```

3. **Synchronize Database Schema**:
   ```bash
   npx prisma db push
   # Optional: Generate Prisma Client
   npx prisma generate
   ```

4. **Launch Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

---

## Operational Roadmap & Future Enhancements

* **Automated Invoice Generation**: Automated PDF billing statements generated for tenants prior to due dates.
* **Landlord Portal**: Dedicated self-service view for property owners to view payout statements and occupancy metrics.
* **Maintenance Photo Attachments**: Multi-file inspection image uploads for maintenance ticketing.
* **SMS / Email Payment Reminders**: Integration with messaging services (e.g., Twilio/SendGrid) for automated late payment notices.
