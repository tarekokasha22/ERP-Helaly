<div align="center">

<img src="https://img.shields.io/badge/version-2.0.0-orange?style=for-the-badge" alt="version"/>
<img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="license"/>
<img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react" alt="react"/>
<img src="https://img.shields.io/badge/TypeScript-4.9-3178C6?style=for-the-badge&logo=typescript" alt="typescript"/>
<img src="https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss" alt="tailwind"/>
<img src="https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel" alt="vercel"/>

<br/><br/>

<h1>🏗️ Al-Helaly ERP System</h1>
<h3>Enterprise Resource Planning for Construction & Infrastructure</h3>

<p align="center">
  A <strong>world-class, bilingual ERP platform</strong> purpose-built for construction companies managing large-scale infrastructure projects, multi-country workforces, and complex financial operations — with a premium UI that rivals SAP, Oracle, and Salesforce.
</p>

<br/>

[**Live Demo →**](https://helaly-erp.vercel.app) &nbsp;|&nbsp; [Report a Bug](https://github.com/tarekokasha22/erp-helaly/issues/new?template=bug_report.md) &nbsp;|&nbsp; [Request a Feature](https://github.com/tarekokasha22/erp-helaly/issues/new?template=feature_request.md)

<br/>


</div>

---

## ✨ Why Al-Helaly ERP?

> Most construction ERP tools are either too generic, too expensive, or too hard to use. Al-Helaly ERP was built from the ground up for **Arabic-speaking construction companies** that need a system that is fast, beautiful, bilingual, and domain-accurate.

| Feature | Al-Helaly ERP | Generic ERP |
|---|---|---|
| Full Arabic RTL support | ✅ Native | ⚠️ Partial |
| Construction-specific workflows | ✅ Built-in | ❌ Custom dev needed |
| Multi-country (Egypt 🇪🇬 / Libya 🇱🇾) | ✅ | ❌ |
| Dual-currency (EGP / USD) | ✅ | ⚠️ Add-on |
| Premium dark sidebar + orange brand | ✅ | ❌ |
| Offline-capable (localStorage) | ✅ | ❌ |
| Open source & self-hostable | ✅ MIT | ❌ |

---

## 🎯 Core Modules

<table>
<tr>
<td width="50%">

### 📊 Executive Dashboard
- Real-time KPI cards with animated count-up
- 6-chart premium layout (line, donut, bar, horizontal bar, ring gauges)
- Budget vs. actual spending comparison
- Project health at a glance
- Arabic / English toggle, instant re-render

</td>
<td width="50%">

### 🏗️ Projects & Sections
- Full lifecycle management (Not Started → In Progress → Completed)
- Progress tracking with target vs. completed quantity (km, m, m², units)
- Multi-section breakdown per project
- Budget allocation per section
- PDF report export with chart snapshots

</td>
</tr>
<tr>
<td width="50%">

### 👷 HR & Employees
- Three contract types: **Monthly**, **Daily**, **Piecework**
- Dual-currency salary management (EGP / USD)
- Per-employee payment history with balance tracking
- Project & department assignment
- Hire date, position, and status tracking

</td>
<td width="50%">

### 💰 Payments & Payroll
- Payment types: Salary, Advance, Loan, On-Account, Daily, Piecework
- Split-currency payments (pay part EGP, part USD)
- Receipt number enforcement (unique constraint)
- CSV export with full filtering
- Today / this-month totals dashboard

</td>
</tr>
<tr>
<td width="50%">

### 📦 Inventory Management
- Live stock tracking with low-stock alerts
- Category breakdown: Materials, Equipment, Tools, Consumables
- Per-project inventory linking
- Supplier, location, and unit-price tracking
- Inline edit without page navigation

</td>
<td width="50%">

### 📈 Reports & Analytics
- 7 report types: Overview, Financial, Projects, Sections, Inventory, Employees, Payments
- Auto-refresh financial data every 5 seconds
- Filter by project or date range
- PDF export with auto-table + chart screenshot
- Financial health indicator (Excellent / Good / Warning)

</td>
</tr>
</table>

---

## 🌐 Bilingual & Multi-Country

The entire system speaks **two languages natively** — switch mid-session with one click:

```
English ←→ عربي  (full RTL layout flip, all 7 modules, all charts, all tables)
```

**Country mode** determines default data context:
- 🇪🇬 **Egypt** — EGP-primary, Egyptian city/project data, Arabic names
- 🇱🇾 **Libya** — Projects across Tripoli, Benghazi, Misrata, Sebha

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 16
- npm �� 8

### Run locally in 60 seconds

```bash
# 1. Clone
git clone https://github.com/tarekokasha22/erp-helaly.git
cd erp-helaly

# 2. Install
cd client && npm install

# 3. Start
npm start
# → opens http://localhost:3000
```

### Login credentials (demo)
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@helaly.com` | `password` |
| Employee | `worker@helaly.com` | `password` |

> **Note:** The app runs fully client-side with a localStorage-based mock API — no backend required.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18.2** | UI library with concurrent features |
| **TypeScript 4.9** | Type safety across the entire codebase |
| **Tailwind CSS 3** | Utility-first styling with custom design tokens |
| **React Router v6** | Client-side routing + protected routes |
| **TanStack Query v4** | Data fetching, caching, and background refetch |
| **Chart.js + react-chartjs-2** | 6-chart analytics dashboard |
| **Heroicons** | Consistent SVG icon system |
| **React Toastify** | Non-blocking notification system |
| **jsPDF + html2canvas** | PDF report generation with chart snapshots |

### Architecture & Design
| Concern | Approach |
|---|---|
| State management | React Context (Language, Currency, Country, Auth) |
| Data persistence | localStorage with versioned migration (DATA_VERSION) |
| Translations | Namespace-keyed JSON (`en.json` / `ar.json`) |
| Design system | 3-layer CSS tokens (Primitive → Semantic → Component) |
| RTL | CSS `dir` attribute + conditional margin/padding utilities |

---

## 📁 Project Structure

```
erp-helaly/
├── client/                          # React frontend (the full app)
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── layouts/
│       │   │   └── MainLayout.tsx   # Sidebar + header shell
│       │   └── ui/
│       │       ├── Sidebar.tsx      # Collapsible, RTL-aware sidebar
│       │       ├── Header.tsx       # Frosted glass top bar
│       │       └── ProtectedRoute.tsx
│       ├── contexts/
│       │   ├── AuthContext.tsx      # Login state + JWT
│       │   ├── LanguageContext.tsx  # t(), language, dir()
│       │   ├── CurrencyContext.tsx  # formatMoney(), EGP/USD
│       │   └── CountryContext.tsx   # Egypt / Libya data routing
│       ├── pages/
│       │   ├── Dashboard.tsx        # 6-chart executive dashboard
│       │   ├── Projects.tsx         # Project CRUD
│       │   ├── Sections.tsx         # Section management
│       │   ├── Employees.tsx        # HR management
│       │   ├── Payments.tsx         # Payroll & payments
│       │   ├── Inventory.tsx        # Stock management
│       │   ├── Reports.tsx          # Analytics & exports
│       │   ├── Login.tsx            # Split-screen auth page
│       │   └── Profile.tsx          # User profile
│       ├── services/
│       │   └── mockApi.ts           # Full localStorage mock API
│       ├── translations/
│       │   ├── en.json              # English strings
│       │   └── ar.json              # Arabic strings (full RTL)
│       ├── index.css                # Design tokens + component classes
│       └── tailwind.config.js
├── vercel.json                      # Vercel SPA config
├── LICENSE
└── README.md
```

---

## 🎨 Design System

Al-Helaly ERP uses a **3-layer token architecture** inspired by [shadcn/ui v4](https://ui.shadcn.com):

```css
/* Layer 1 — Primitive */
--color-brand-500: #f97316;   /* Orange */

/* Layer 2 — Semantic */
--primary: var(--color-brand-500);
--sidebar-bg: #0f172a;
--shadow-card: 0 1px 3px rgb(0 0 0 / 0.05), inset 0 1px 0 rgba(255,255,255,0.80);

/* Layer 3 — Component */
.stat-card { box-shadow: var(--shadow-card); border-radius: var(--radius-2xl); }
.btn-primary { background: var(--primary); height: 40px; }
.badge-success { background: #d1fae5; color: #065f46; }
```

**Component spec compliance:**
- Buttons: 32px / 40px / 48px heights (sm / default / lg)
- Inputs: 40px height, `8px 12px` padding, 3px orange focus ring
- Table rows: 48px default height, `12px 16px` cell padding
- Badges: 24px height, `4px 10px` padding, 12px font

---

## 📸 Screenshots

<details>
<summary><strong>Dashboard (English)</strong></summary>

> 6 live charts, animated KPI cards, budget vs. spending comparison

</details>

<details>
<summary><strong>Dashboard (Arabic / RTL)</strong></summary>

> Full right-to-left layout, Arabic chart labels, Arabic number formatting

</details>

<details>
<summary><strong>Payments Management</strong></summary>

> Split-currency payments, per-type breakdown, CSV export

</details>

<details>
<summary><strong>Reports — Financial</strong></summary>

> Auto-refresh, financial health indicator, PDF export with chart capture

</details>

---

## 🔒 Security

- All data is stored client-side (localStorage) — no data leaves the browser
- Authentication tokens are validated locally
- No external API calls — fully offline-capable
- See [SECURITY.md](./SECURITY.md) for responsible disclosure

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

Quick guide:
1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit using [Conventional Commits](https://conventionalcommits.org): `git commit -m "feat: add payment export"`
4. Push and open a PR against `main`

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](./LICENSE) for details.

---

## 🌟 Acknowledgements

- [shadcn/ui](https://ui.shadcn.com) — design token inspiration
- [Heroicons](https://heroicons.com) — icon library
- [Chart.js](https://chartjs.org) — charting engine
- [TanStack Query](https://tanstack.com/query) — data-fetching layer
- [Tailwind CSS](https://tailwindcss.com) — utility-first CSS

---

<div align="center">

Built with ❤️ for the Al-Helaly Contracting Company

<br/>

⭐ **Star this repo** if you find it useful — it helps others discover it!

</div>
