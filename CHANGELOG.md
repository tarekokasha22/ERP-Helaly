# Changelog

All notable changes to Al-Helaly ERP are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] — 2024-12-01

### 🎉 Major Release — World-Class UI Redesign + Full Bilingual Support

### Added
- **Premium design system** — 3-layer CSS token architecture (Primitive → Semantic → Component)
- **Full Arabic RTL** — every page, every chart, every table now fully translates to Arabic
- **Reports page translation** — 120+ hardcoded strings replaced with dynamic `tr` dictionary
- **Employees page translation** — corrected broken Arabic translation block
- **Payments page translation** — corrected broken Arabic translation block
- **Dashboard Arabic** — greeting, chart labels, stat cards, quick actions all bilingual
- **6-chart dashboard** — Line, Donut, Bar, Horizontal Bar, and Ring Progress gauges
- **Budget vs. Spending chart** — grouped bar chart comparing allocated vs. actual per month
- **Inventory inline edit** — edit button per row with pre-filled modal (no page navigation)
- **Libya country mode** — distinct project data for Misrata, Benghazi, Sebha, Tripoli
- **Financial health indicator** — live progress bar with Excellent / Good / Warning states
- **Auto-refresh financial reports** — re-fetches every 5 seconds when on Financial tab
- **PDF export** — chart snapshot + auto-table, English-safe filenames

### Changed
- **Sidebar** — premium dark gradient (`#0f172a → #0c1322`), active item orange pill indicator
- **Header** — frosted glass `backdrop-blur-md`, sticky top positioning
- **Stat cards** — `text-3xl font-extrabold`, hover lift `translateY(-3px)`, layered shadow
- **Buttons** — 40px default height, gradient primary with orange glow on hover
- **Inputs** — 40px height, 3px orange focus ring, inset highlight
- **Badges** — 24px height, `4px 10px` padding, semantic colour variants
- **Tables** — 48px row height, `12px 16px` cell padding, subtle hover states
- **Layout** — removed double-wrapper bug in `MainLayout.tsx`; clean `ms-64` / `ms-16` margin transition
- **Collapse button** — straddles sidebar edge with `translateX(50%)`, no content bleed
- **DATA_VERSION** — bumped to `'4'` to force localStorage migration for Libya data

### Fixed
- `StatCard` language scope bug — `language is not defined` runtime error when sidebar collapsed
- Arabic translation blocks in `Employees.tsx` and `Payments.tsx` were copies of English
- Sidebar overlap on page load (double-wrapper media query never applied)
- Reports page had no translation support — all strings hardcoded English
- View Details button removed from project cards (redundant navigation)
- Security section removed from Profile page

---

## [1.5.0] — 2024-10-15

### Added
- Inventory management module with low-stock alerts
- Section-level budget tracking
- Per-employee payment history with balance display
- Split-currency payment support (EGP + USD in one transaction)
- CSV export for payments

### Changed
- Dashboard redesigned with Chart.js integration
- Employees module restructured with three contract types

### Fixed
- Project delete confirmation modal now blocks background interaction
- Currency formatter handles zero-value edge cases

---

## [1.0.0] — 2024-08-01

### Initial Release

- Dashboard with basic KPI cards
- Projects CRUD (Create, Read, Update, Delete)
- Sections management with progress tracking
- Basic user authentication (admin / worker roles)
- English-only interface
- localStorage mock API
