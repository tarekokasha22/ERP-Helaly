# Contributing to Al-Helaly ERP

First off — thank you for taking the time to contribute! 🎉

This document outlines how to get the project running locally, the conventions we follow, and how to submit high-quality pull requests.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Convention](#commit-convention)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Translation Contributions](#translation-contributions)
- [Reporting Bugs](#reporting-bugs)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you agree to uphold this standard. Please report any unacceptable behaviour to the project maintainer.

---

## Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/erp-helaly.git
cd erp-helaly
```

### 2. Install dependencies

```bash
cd client && npm install
```

### 3. Start the dev server

```bash
npm start
# → http://localhost:3000
```

### 4. Create your branch

```bash
git checkout -b feat/my-awesome-feature
# or
git checkout -b fix/bug-description
```

---

## Development Workflow

### File structure

All source code lives in `client/src/`. Key directories:

| Path | Purpose |
|------|---------|
| `pages/` | Top-level page components (one per route) |
| `components/ui/` | Reusable presentational components |
| `components/layouts/` | Shell layouts (Sidebar, Header) |
| `contexts/` | React Context providers (Auth, Language, Currency, Country) |
| `services/mockApi.ts` | localStorage mock API — the data layer |
| `translations/` | `en.json` and `ar.json` translation files |
| `index.css` | Design token definitions + global component classes |

### Adding a new page

1. Create `client/src/pages/MyPage.tsx`
2. Add the route in `client/src/App.tsx`
3. Add a navigation entry in `client/src/components/ui/Sidebar.tsx`
4. Add translations in both `en.json` and `ar.json`

### Translation requirement

**Every visible string must be translatable.** This is a hard requirement.

- Use `const { t } = useLanguage()` and `t('namespace', 'key')`
- Or maintain a local `translations = { en: {...}, ar: {...} }` object — but ensure the `ar:` block contains **actual Arabic**, not a copy of English

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
```

**Types:**

| Type | When to use |
|------|------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `style` | UI/CSS changes that don't affect logic |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `i18n` | Translation / localisation changes |
| `docs` | Documentation only |
| `chore` | Build process, tooling, dependencies |

**Examples:**

```bash
git commit -m "feat(payments): add split-currency payment support"
git commit -m "fix(dashboard): resolve StatCard language scope bug"
git commit -m "i18n(reports): translate all hardcoded strings to Arabic"
git commit -m "style(sidebar): apply premium dark gradient background"
```

---

## Pull Request Guidelines

1. **Branch from `main`** — never commit directly to `main`
2. **One concern per PR** — don't mix features with bug fixes
3. **Build must pass** — run `CI=false npm run build` before pushing
4. **No TypeScript errors** — the build will fail if you introduce type errors
5. **Test RTL** — if you touched any UI, verify it looks correct in Arabic mode
6. **Fill out the PR template** — do not delete the template sections

### PR title format

```
feat: add employee CSV import
fix: correct RTL table alignment in Reports
i18n: complete Arabic translation for Inventory page
```

---

## Translation Contributions

If you want to improve or extend translations:

1. Open `client/src/translations/en.json` — this is the source of truth
2. Match the same keys in `client/src/translations/ar.json`
3. Test by switching language in the app (Login screen → language selector)
4. Ensure **all pages** re-render correctly in RTL

**Do not** use Google Translate for Arabic without review — construction terminology requires domain accuracy.

---

## Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md).

Please include:
- Steps to reproduce
- Expected vs. actual behaviour
- Browser + OS
- Console errors (if any)
- Which language / country mode was active

---

Thank you again for contributing. Every PR, no matter how small, makes this project better. 🙏
