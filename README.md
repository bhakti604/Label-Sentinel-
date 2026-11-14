# LABEL SENTINEL
**Legal Metrology & Regulatory Compliance Intelligence Platform**  
*Automated Verification, Consumer Grievance Redressal, and Enforcement Surveillance*

---

## 1. Product Introduction

**LABEL SENTINEL** is an independent, enterprise-grade compliance intelligence and verification platform built to enforce statutory transparency under **The Legal Metrology Act, 2009** and **The Legal Metrology (Packaged Commodities) Rules, 2011 (PCR 2011)** as amended.

In modern retail and e-commerce ecosystems, consumers and enforcement authorities face widespread non-compliance in pre-packaged commodities, including:
- Prohibited non-metric unit declarations (e.g., using abbreviations like `gms`, `kgs`, `ltrs` instead of statutory SI metric symbols `g`, `kg`, `l`, `ml`).
- Dual pricing stickers or retail prices charged above the printed Maximum Retail Price (MRP).
- Omission of the mandatory statutory qualifier `(inclusive of all taxes)` on price declarations.
- Missing Unit Sale Price (USP) declarations for packages containing more than 1 kg or 1 liter.
- Obscured, smudged, or missing Country of Origin declarations on imported commodities and e-commerce listings.
- Sub-standard font sizes (< 2.0 mm / 3.0 mm) rendering consumer care grievance contacts unreadable.

LABEL SENTINEL bridges the gap between regulatory intent and real-world compliance through an automated, deterministic verification workflow coupled with human officer adjudication.

---

## 2. Product Objectives

1. **Protect Consumer Rights**: Enable citizens to instantaneously audit physical packages and e-commerce product declarations against statutory standards.
2. **Deterministic Statutory Verification**: Maintain a version-controlled, 100% deterministic rule engine that strictly evaluates applicable legal clauses without probabilistic hallucinations.
3. **Statutory Human-in-the-Loop Triage**: Enforce the regulatory doctrine that automated OCR extraction does *not* issue final legal verdicts; ambiguous or low-confidence readings (< 72% confidence) are automatically quarantined into an Officer Review Queue.
4. **Streamline Enforcement Workflow**: Equip Legal Metrology Inspectors and Controllers with dedicated market surveillance tools, notice issuance, Section 48 compounding trackers, and judicial case dockets under Section 36(1).
5. **National Directorate Governance**: Provide national administrators with centralized rule registry versioning, territorial jurisdiction boundary mapping, and immutable cryptographic audit logging.

---

## 3. Core Features

- **Candidate Declaration OCR Extractor**: Captures raw packaging declarations with bounding confidence scores.
- **Deterministic Rule Engine (PCR 2011)**: Evaluates Rule 6(1)(a) through Rule 6(10) with exact statutory thresholds.
- **Four Standard Compliance Verdicts**:
  - `PASS`: Full conformity with all applicable statutory rules.
  - `FAIL`: Confirmed statutory infraction under Section 36(1).
  - `NEEDS_REVIEW`: Ambiguous declaration or low OCR confidence routed to human officer.
  - `NOT_APPLICABLE`: Commodity category or packaging volume exempt from clause (e.g. USP not required for items < 1kg).
- **Consumer Grievance Redressal**: Formal filing workflow for retail over-charging, non-standard units, and missing manufacturer details.
- **Know More AI (Statutorily Isolated)**: Conversational metrology assistant providing educational explanations of statutes, strictly separated from compliance verdicts.
- **Market Surveillance Inspections**: On-site retail check scheduler and infraction sampling logger.
- **Section 36 Case Dossiers**: Compounding penalty calculator and prosecution dossiers for Chief Metropolitan Magistrate courts.
- **Rule Registry Manager**: Live administrative console to amend rule specifications, regex patterns, and minimum font heights.
- **Immutable Audit Trail**: Cryptographically anchored event logs recording regulatory actions, review decisions, and rule modifications.

---

## 4. Three Dedicated Portals

LABEL SENTINEL is architected into exactly three distinct active portals across **20 application pages** (21 routes in Next.js App Router manifest including fallback, compiling 22 static generation units), accessible via a streamlined, minimal **Portal Selection** entry page (`/`) and unified **Role-Based Login** gateway (`/login`):

```
                          [ Portal Selection (/) ]
                                     |
                          [ Unified Login (/login) ]
                                     |
        +----------------------------+----------------------------+
        |                            |                            |
[ Citizen Portal ]           [ Officer Portal ]           [ Admin Portal ]
   (/citizen)                   (/officer)                   (/admin)
```

*(Note: Per specifications, no Manufacturer Portal exists in this platform).*

### 4.1 Citizen Portal (`/citizen`)
- **Dashboard (`/citizen`)**: Session summary metrics, quick action triggers, recent scans table, and statutory consumer rights guide.
- **Product Scan (`/citizen/scan`)**: Interactive declaration extractor with preset packaging scenarios (Compliant honey, Non-metric face wash infraction, Uncertain smartwatch print) and instant deterministic rule execution.
- **Compliance Results (`/citizen/results`)**: Searchable, filterable ledger of compliance dossiers with pass/fail ratios.
- **Detailed Dossier (`/citizen/results/[id]`)**: Comprehensive regulatory breakdown with clause citations, extracted raw text, confidence score, and mandated remedial actions.
- **Scan History (`/citizen/history`)**: Chronological audit log with CSV export capability.
- **Complaints (`/citizen/complaints`)**: Formal consumer grievance filing form with validation and direct routing to officer inboxes.
- **Know More AI (`/citizen/know-more`)**: Educational legal metrology knowledge assistant with statutory citation tags.

### 4.2 Officer Portal (`/officer`)
- **Dashboard (`/officer`)**: Enforcement command center displaying pending triage items, active inspections, open complaints, and court cases.
- **Review Queue (`/officer/review-queue`)**: Dedicated triage workstation where officers inspect sub-threshold OCR findings and issue binding `PASS` or `FAIL` adjudications.
- **Inspections (`/officer/inspections`)**: Field inspection scheduler for retail and warehouse premises under Section 15 powers.
- **Complaint Inbox (`/officer/complaints`)**: Triage inbox for citizen reports with one-click inspection dispatching.
- **Cases & Compounding (`/officer/cases`)**: Section 36 prosecution docket tracker and Section 48 compounding fee registrar.
- **Compliance Reports (`/officer/reports`)**: Regional compliance statistics, infraction distribution charts, and treasury revenue realization metrics.

### 4.3 Admin Portal (`/admin`)
- **Dashboard (`/admin`)**: National Directorate overview with system health, active rules count, and live audit stream.
- **Users & Roles (`/admin/users`)**: RBAC credential manager for Controllers, Inspectors, Directorate Admins, and Citizens.
- **Rule Registry (`/admin/rules`)**: Centralized repository of statutory rules under the Legal Metrology Act, allowing live activation, amendment dates, regex updates, and font height requirements.
- **Jurisdictions (`/admin/jurisdictions`)**: State headquarters and district enforcement boundary mapping.
- **Audit Logs (`/admin/audit-logs`)**: Cryptographically hashed immutable audit ledger with search, filtering, and CSV export.

---

## 5. Technology Stack

- **Framework**: Next.js 15 (App Router with Server Components & Client Boundaries)
- **Language**: Strict TypeScript 5
- **Library**: React 19
- **Styling**: Custom Enterprise CSS Design System with 8px grid tokens (`src/styles/design-tokens.css` & `globals.css`)
- **Icons**: Lucide React
- **Architecture**: Firebase-ready decoupled storage abstraction (`src/lib/storage/context.tsx`)

### Design System Color Palette
| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| **Primary Teal** | `#14857D` | Main branding, primary action buttons, active navigation states |
| **Dark Teal** | `#0F5F59` | Officer Portal theme, headers, key metric accents |
| **Background** | `#F6F8F8` | Page canvas background |
| **Surface** | `#FFFFFF` | Card surfaces, modals, data tables |
| **Primary Text** | `#1C2526` | High-contrast body typography, titles, table content |
| **Secondary Text** | `#6B7A7A` | Metadata, helper texts, table headers |
| **Borders** | `#E4EBEA` | Clean enterprise card borders, table dividers |
| **Success** | `#23845B` | `PASS` badges, compliant indicators, resolved states |
| **Warning** | `#B7791F` | `NEEDS_REVIEW` badges, sub-threshold confidence, alerts |
| **Error** | `#C44747` | `FAIL` badges, statutory infractions, prosecution warnings |

---

## 6. Folder Structure

```
LABEL SENTINEL/
├── next.config.mjs
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── types/
    │   ├── compliance.ts            # Metrology declarations, dossiers, rules
    │   └── portal.ts                # Users, complaints, inspections, cases, audit logs
    ├── lib/
    │   ├── rule-engine/
    │   │   ├── rules.ts             # Statutory rule registry (PCR 2011 Rule 6)
    │   │   └── evaluator.ts         # Deterministic statutory compliance evaluator
    │   ├── mock-data/
    │   │   ├── scans.ts             # Pre-packaged commodity scan records
    │   │   ├── complaints.ts        # Citizen grievances
    │   │   ├── inspections.ts       # Field inspection records
    │   │   ├── cases.ts             # Section 36 court & compounding cases
    │   │   ├── users.ts             # Enrolled officers and administrators
    │   │   ├── jurisdictions.ts     # Territorial jurisdiction offices
    │   │   └── audit-logs.ts        # SHA-256 anchored audit events
    │   └── storage/
    │       └── context.tsx          # Unified reactive client state & Firebase adapter
    ├── styles/
    │   ├── design-tokens.css        # Palette, spacing, typography, shadow variables
    │   └── globals.css              # Reset, utility classes, buttons, forms, tables
    ├── components/
    │   ├── common/
    │   │   ├── ApplicationLogo.tsx
    │   │   ├── StatusBadge.tsx
    │   │   ├── SummaryCard.tsx
    │   │   ├── DataTable.tsx
    │   │   ├── SearchInput.tsx
    │   │   ├── FilterDropdown.tsx
    │   │   ├── Modal.tsx
    │   │   ├── ConfirmationDialog.tsx
    │   │   ├── FormField.tsx
    │   │   ├── EmptyState.tsx
    │   │   ├── LoadingState.tsx
    │   │   ├── Notification.tsx
    │   │   ├── Breadcrumb.tsx
    │   │   └── PageHeader.tsx
    │   └── layout/
    │       ├── PortalLayout.tsx     # Master layout with statutory notice banner
    │       ├── Sidebar.tsx          # Dynamic responsive sidebar navigation
    │       └── Topbar.tsx           # Session status, badge indicators
    └── app/
        ├── layout.tsx               # Root provider & typography
        ├── page.tsx                 # Portal Selection Entry Page
        ├── login/page.tsx           # Role-Based Login Gateway with Demo Assistant
        ├── citizen/
        │   ├── layout.tsx
        │   ├── page.tsx             # Citizen Dashboard
        │   ├── scan/page.tsx        # Product Scan & OCR Extractor
        │   ├── results/page.tsx     # Compliance Results Ledger
        │   ├── results/[id]/page.tsx# Detailed Compliance Dossier
        │   ├── history/page.tsx     # Scan History & CSV Export
        │   ├── complaints/page.tsx  # Consumer Complaint Redressal
        │   └── know-more/page.tsx   # Know More AI Assistant
        ├── officer/
        │   ├── layout.tsx
        │   ├── page.tsx             # Officer Surveillance Dashboard
        │   ├── review-queue/page.tsx# Triage Review Queue for Ambiguous Findings
        │   ├── inspections/page.tsx # Field Inspections & Premises Audits
        │   ├── complaints/page.tsx  # Complaint Inbox & Action Orders
        │   ├── cases/page.tsx       # Section 36 Prosecution & Compounding
        │   └── reports/page.tsx     # Regional Compliance Reports & Realization
        └── admin/
            ├── layout.tsx
            ├── page.tsx             # National Directorate Administration
            ├── users/page.tsx       # Users & Role-Based Access Control
            ├── rules/page.tsx       # Version-Controlled Rule Registry
            ├── jurisdictions/page.tsx# Territorial Jurisdiction Boundaries
            └── audit-logs/page.tsx  # Immutable Regulatory Audit Trail
```

---

## 7. Installation Instructions

### Prerequisites
- Node.js (v18.18+ or v20+ recommended; developed & tested on Node v24.12.0)
- npm (v9+ or v11+)

### Clone & Install
```bash
# Navigate to the project root
cd "LABEL SENTINEL"

# Install dependencies
npm install
```

### Environment Configuration
Copy the template configuration file to configure local development variables:
```bash
# On Linux/macOS
cp .env.example .env.local

# On Windows PowerShell
Copy-Item .env.example .env.local
```
All variables in `.env.example` come pre-configured with safe local defaults.

---

## 8. Local Development Instructions

Start the Next.js local development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
- Public Landing: `http://localhost:3000/`
- Citizen Portal: `http://localhost:3000/citizen`
- Officer Portal: `http://localhost:3000/officer`
- Admin Portal: `http://localhost:3000/admin`

---

## 9. Build Instructions

### Type Checking
Run strict TypeScript validation across all routes and components:
```bash
npm run typecheck
```

### Production Build
Create an optimized production bundle:
```bash
npm run build
```

### Production Server Startup
Run the built production application:
```bash
npm run start
```

---

## 10. Implemented Frontend Interactions

Every visible UI control performs an explicit, meaningful action:
- **Sample Packaging Scenarios**: On `/citizen/scan`, selecting samples instantaneously populates candidates, confidence metrics, and barcode metadata.
- **Live OCR Extraction Simulation**: Re-extracts candidate declaration strings with animated progress and confidence calculations.
- **Deterministic Evaluation Engine**: Evaluates candidate strings against statutory rules, computes pass/fail/needs_review counts, generates unique dossiers (`DOS-2026-XXXX`), and redirects to the detailed dossier view.
- **Human Officer Triage**: On `/officer/review-queue`, officers can review low-confidence declarations, click "Adjudicate Declaration", enter findings, select `PASS` or `FAIL`, and commit the ruling. The item updates the global ledger and removes itself from the pending queue.
- **Complaint Filing & Notice Issuance**: Filing a complaint on `/citizen/complaints` validates form inputs, registers the record with a `CMP-2026-XXXX` reference, and instantly surfaces in the `/officer/complaints` inbox.
- **Inspection Dispatch**: When an officer changes a complaint status to `INSPECTION_ORDERED`, a field inspection is automatically generated in `/officer/inspections`.
- **Compounding Penalties**: Officers on `/officer/cases` can update docket statuses to `COMPOUNDED` and record collected treasury compounding fees.
- **Rule Registry Toggling**: Admins on `/admin/rules` can toggle individual statutory rules active or inactive, altering how the deterministic rule engine evaluates future scans.
- **Search, Filtering, & CSV Export**: All data tables feature live debounced search, category dropdowns, and instant CSV downloads.
- **Toast Notification System**: Instant feedback popups confirm when scans are logged, complaints are registered, or rulings are committed.

---

## 11. Current Architecture Scope & Integration Boundaries

| Component | Current Implementation Status | Architectural Scope |
| :--- | :--- | :--- |
| **Deterministic Rule Engine** | **Genuinely Implemented in TypeScript** | Executes deterministic regex & threshold logic directly in the browser runtime against PCR 2011 Rule 6. |
| **Live Barcode Scanning** | **Genuinely Implemented via ZXing** | Continuous real-time browser video stream barcode detection (`@zxing/browser` & `@zxing/library`) with audio feedback. |
| **OCR Text Extraction** | **Genuinely Implemented via Tesseract.js** | In-browser client-side WebAssembly OCR engine extracting raw package label text with confidence scoring. |
| **Declaration Parser** | **Genuinely Implemented in TypeScript** | Regex-based statutory declaration parser extracting candidate fields for Rule 6(1)(a)-(f) and Rule 6(10). |
| **State Persistence** | **Genuinely Implemented via LocalStorage** | Full cross-session client-side persistence for scans, complaints, inspections, cases, rules, users, jurisdictions, and audit logs. Automatically reloads saved state on application startup and synchronizes multi-tab sessions via window storage events. Includes one-click reset to default demonstrations in topbar profile menu. |
| **Know More AI Assistant** | **Knowledge Assistant Interface** | Returns structured statutory explanations and citations without requiring live third-party API keys. |
| **Audit Logs** | **Genuinely Computed** | Generates real ISO timestamps, event actions, and cryptographic hashes for all session activities. |

---

## 12. Future Backend Integration Scope

The architecture has been designed specifically for seamless drop-in backend connectivity:
1. **Firebase Auth & Cloud Firestore (Week 3 Roadmap)**:
   - Connect `SentinelProvider` in-memory state to live Firestore collection listeners (`scans`, `complaints`, `inspections`, `cases`, `rules`, `audit_logs`).
   - Implement Firebase Authentication with role-based access control (RBAC) and warrant credential checks for enforcement officers.
2. **Cloud Storage for Package Imagery**: Store captured front/back/side package images in secure Cloud Storage buckets with signed audit URLs.
3. **Statutory Compounding Payment Gateway**: Integrate Bharatkosh / Treasury e-payment gateway for instant online receipt generation under Section 48 compounding orders.
4. **Official National Metrology API**: Expose REST/gRPC endpoints for marketplace e-commerce crawlers to automate batch compliance screening before products are published.
