# Label Sentinel — Week 2 Frontend Application Development Report

**Project Title:** Label Sentinel  
**Domain:** Legal Metrology & Regulatory Compliance Technology  
**Milestone:** Week 2 — Front-End Application Development & Polish  
**Architecture:** Enterprise Single-Page Application (Next.js 15 App Router, React 19, TypeScript 5.7, Tailwind CSS)  
**Document Classification:** Technical Architecture & QA Verification Report  

---

## 1. Executive Summary & Objective

During Week 2 of the engineering cycle, the Label Sentinel engineering team finalized the complete front-end architecture, user experience, responsive layout system, and interactive client-side scanning engine. Label Sentinel is an enterprise-grade digital oversight and compliance verification platform designed specifically for the **Legal Metrology (Packaged Commodities) Rules, 2011** and statutory consumer protection standards.

The primary objective of Week 2 was transforming initial prototype modules into a coherent, professional, production-ready SaaS interface that strictly separates public awareness from operational portals, guarantees seamless accessibility across all form factors (desktop, laptop, tablet, and mobile), and embeds deterministic regulatory rule validation directly into the client-side scanning workflow.

---

## 2. Front-End Development Completed

The front-end build encompasses **21 routes** in the Next.js 15 App Router manifest (comprising **20 application pages** authored across three operational portals, the portal selection entry page, and dedicated login interface, plus 1 standard `_not-found` fallback route; generating **22 static build units** including the root document layout during production prerendering).

### Architectural Structure:
- **Portal Selection Surface (`/`):** Clean, minimal, and professional portal selection entry interface presenting three large, elegant selection cards (Citizen, Officer, Admin) directing users to their respective login views.
- **Dedicated Login Gateway (`/login`):** Unified role-based authentication interface with show/hide password, remember me, portal role authorization validation, and demo credentials assistant.
- **Citizen Portal (`/citizen/*` — 7 pages):** Consumer-facing interface facilitating live package verification, manual declaration entry, automated violation detection, formal complaint filing, and tracking of submitted grievances (`/citizen`, `/citizen/scan`, `/citizen/results`, `/citizen/results/[id]`, `/citizen/history`, `/citizen/complaints`, `/citizen/know-more`).
- **Officer Portal (`/officer/*` — 6 pages):** Field and enforcement interface for inspectors and Legal Metrology Officers (LMOs) providing real-time compliance queue audits, case management, notice generation, physical inspection logging, and analytics (`/officer`, `/officer/review-queue`, `/officer/inspections`, `/officer/complaints`, `/officer/cases`, `/officer/reports`).
- **Admin Portal (`/admin/*` — 5 pages):** Supervisory control center providing system configuration, officer role management, statutory rule engine threshold customization, jurisdiction boundaries, and immutable audit logs (`/admin`, `/admin/users`, `/admin/rules`, `/admin/jurisdictions`, `/admin/audit-logs`).

*Note: Per statutory architecture specifications, no Manufacturer Portal exists in this release. All enforcement, review, and verification flows are strictly consumer-, officer-, and administrator-oriented.*

---

## 3. UI/UX Design System & Theme Implementation

To elevate the application beyond generic dashboard templates, an enterprise regulatory design system was codified in `src/styles/design-tokens.css` and applied across all views:

| Token Name | Hex Code | Semantic Role |
| :--- | :--- | :--- |
| `--color-primary` | `#14857D` | Primary Deep Teal for authoritative headers, active tabs, and primary actions |
| `--color-primary-dark` | `#0F5F59` | Dark Teal hover states and solid navbars |
| `--color-background` | `#F6F8F8` | Light cool background minimizing ocular fatigue during high-volume document reviews |
| `--color-surface` | `#FFFFFF` | Card, table, and modal surfaces with crisp separation |
| `--color-text-primary` | `#1C2526` | High-contrast body text providing strong visual contrast (>10:1 ratio against light backgrounds) |
| `--color-text-secondary` | `#6B7A7A` | Subdued metadata labels, helper text, and secondary navigation elements |
| `--color-border` | `#E4EBEA` | Crisp 1px geometric borders defining layout containers |
| `--color-status-pass` | `#23845B` | Affirmative compliance verdict indicator |
| `--color-status-warning` | `#B7791F` | Ambiguous OCR / Advisory Review indicator |
| `--color-status-fail` | `#C44747` | Statutory violation / Non-compliance indicator |

The typography utilizes a 4px/8px modular spacing grid, structured card containers, clear visual hierarchy, accessible breadcrumbs, and real-time interactive badges indicating regulatory status.

---

## 4. Interactive Components & Scanning Engine

The client-side scanning subsystem is a fully functioning, interactive computer vision and parsing pipeline:

1. **Live Camera Capture (`src/components/scanner/LiveCamera.tsx`):**
   - Direct integration with HTML5 `navigator.mediaDevices.getUserMedia`.
   - Dual-mode environment selection with mobile rear camera (`facingMode: { ideal: "environment" }`).
   - Active stream lifecycle management with explicit track termination (`track.stop()`) on component unmount to prevent battery drain or memory leaks.
   - Comprehensive error recovery for camera permission denial (`NotAllowedError`), device missing (`NotFoundError`), and hardware constraints.
   - Accessible drag-and-drop file upload fallback for devices lacking physical optical sensors.

2. **Real Barcode Extraction (`src/components/scanner/BarcodeReader.tsx`):**
   - Continuous frame analysis powered by `@zxing/browser` (`BrowserMultiFormatReader`).
   - Supports 1D and 2D formats: EAN-13, EAN-8, UPC-A, UPC-E, Code 128, QR Code, and Data Matrix.
   - Integrated debounce mechanism preventing duplicate reads within a 2.5-second scan window.
   - Manual barcode input fallback with format validation.

3. **Multi-Angle Package Image Capture (`src/components/scanner/PackageCapture.tsx`):**
   - Multi-angle capture queue supporting Front Panel, Back/Information Panel, Side Panel, and MRP Declaration.
   - High-resolution canvas extraction (`image/jpeg` at 0.92 quality) preserving fine typographic details.
   - Thumbnail preview strip with retake, remove, and magnification capabilities.

4. **WASM-Powered Client OCR Engine (`src/lib/ocr/worker.ts` & `src/lib/ocr/parser.ts`):**
   - Integrated Tesseract.js running local WebAssembly (WASM) workers.
   - Dual-language support for English (`eng`) and Marathi (`mar`) using local offline trained data (`eng.traineddata`, `mar.traineddata`).
   - Real-time character confidence scoring and bounding box preservation.
   - Regex-driven statutory declaration parser targeting Rule 6(1) mandatory fields:
     - Manufacturer / Packer / Importer Details
     - Country of Origin
     - Common or Generic Commodity Name
     - Net Quantity with metric unit standardization
     - Month and Year of Manufacture / Pre-packing / Import
     - Maximum Retail Price (MRP) including all taxes
     - Unit Sale Price (USP) per gram, kilogram, millilitre, or litre
     - Consumer Care / Grievance Redressal Contact Details

5. **Deterministic Regulatory Rule Engine (`src/lib/rule-engine/*`):**
   - Pure, rule-driven evaluation matrix strictly adhering to Legal Metrology Rules, 2011.
   - Evaluates mandatory presence, font height compliance, illegal metric unit abbreviation detection (e.g., rejecting `mltrs`, `mls`, `gms`), and USP calculation consistency.
   - Returns deterministic statuses: `PASS`, `FAIL`, `NEEDS_REVIEW`, and `NOT_APPLICABLE`.
   - Zero hardcoded outcomes: verdicts are derived strictly from extracted OCR tokens or verified manual entries.

---

## 5. Responsive Design & Accessibility Audits

- **Mobile Viewport Optimization:**
  - Responsive hamburger drawer navigation on the public landing page with accessible toggle buttons (`aria-label`, `aria-expanded`).
  - Mobile overflow mitigation on small viewports (<640px) via `.hide-xs` and responsive text clipping.
  - Horizontally scrollable data tables with `-webkit-overflow-scrolling: touch` ensuring compliance tables remain inspectable on smartphones.
- **Verified Accessibility Implementations:**
  - Dialog semantics with `role="dialog"`, `aria-modal="true"`, and explicit `aria-label` attributes on modal containers.
  - Screen-reader accessible labels on icon-only buttons, search inputs, clear triggers, pagination controls, and filter dropdowns.
  - Minimum touch target dimensions of 40px to 44px on primary interactive buttons, inputs, and tab triggers.
  - High-visibility keyboard focus rings using `:focus-visible` styling (`outline: 2px solid var(--color-primary)`).
  - Explicit semantic labelling on form fields, file uploads, and status chips.
  - *(Note: A certified third-party accessibility audit has not been conducted; full WCAG 2.1 AA conformity across all edge success criteria is not claimed).*

---

## 6. Verification & Test Results

A comprehensive verification regimen was executed across the codebase:
- **TypeScript Static Analysis:** `npm run typecheck` passed with **0 errors** across 42 source files.
- **Production Build:** `npm run build` completed successfully in 15.9s, emitting **21 routes** in the App Router route table (comprising **20 application pages** across 3 portals, portal selection entry, and login, plus 1 standard `_not-found` fallback route; generating **22 static build units** during prerendering).
- **Rule Engine Regression Suite:** Verified across a comprehensive suite of **34 statutory test scenarios** covering metric net quantity parsing, illegal abbreviation rejection (`mltrs`, `mls`, `gms`), USP statutory qualifiers, and font size thresholds with a **34/34 (100%) test pass rate**.
- **End-to-End QA Automation Suite:** 32 automated verification checkpoints covering barcode detection, image acquisition, OCR worker lifecycle, declaration parsing, and privacy boundaries.

---

## 7. Current Architecture Status & Roadmap

- **State Management, Local Storage Persistence & Cross-Portal Synchronization:**
  - Client-side reactive architecture is fully operational via React 19 Context API and custom state providers (`SentinelProvider`).
  - **Full LocalStorage Persistence:** Scans, citizen complaints, field inspections, enforcement cases, statutory rule definitions, user profiles, jurisdictions, and immutable audit logs persist directly in the browser's `localStorage` across page reloads and browser sessions.
  - **Cross-Portal & Multi-Tab Synchronization:** Integrated window `storage` event listeners ensure that actions performed in one tab (e.g., citizen complaint submission) instantly update another tab (e.g., officer review inbox) in real-time.
  - **Statutory Enforcement Flow:** When an officer adjudicates an item in `/officer/review-queue`, the corresponding dossier in `/citizen/results/[id]` and `/citizen/history` is immediately updated with official officer findings and timestamp. When a complaint is updated to `INSPECTION_ORDERED`, a field inspection is automatically scheduled. When an administrator adjusts statutory rule parameters in `/admin/rules`, subsequent compliance evaluations directly apply the updated rules.
  - **Demo Data Restoration:** A dedicated reset mechanism is provided in the Topbar user menu, allowing testers to restore default demonstration datasets at any time.
  - *Cloud Database Integration:* The architecture is prepared for seamless connection to Firebase/Firestore or PostgreSQL backends via `.env.example` configurations. No live external database is claimed in this release.
- **Hardware Sensing:**
  - Live camera video capture is verified via standard WebRTC APIs; on headless or virtualized test machines lacking physical optical hardware, the application automatically presents the responsive file upload and manual entry fallbacks.
