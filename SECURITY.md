# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 2.x     | ✅ Current — fully supported |
| 1.x     | ⚠️ Security fixes only |
| < 1.0   | ❌ No longer supported |

---

## Scope

Al-Helaly ERP v2.x is a **client-side only** application. All data is stored in the browser's `localStorage` — no data is transmitted to any external server or third-party service.

This means:

- ✅ No server-side vulnerabilities (there is no backend in the demo build)
- ✅ No database exposure
- ✅ No API keys or credentials in the codebase
- ⚠️ Data is readable by anyone with access to the browser / device

---

## Reporting a Vulnerability

If you discover a security vulnerability, **please do not open a public GitHub issue.**

Instead, please report it responsibly via one of the following channels:

- **Email:** security@helaly-erp.dev *(monitored by maintainers)*
- **GitHub Private Advisory:** [Security Advisories](https://github.com/tarekokasha22/erp-helaly/security/advisories/new)

### What to include in your report

1. A clear description of the vulnerability
2. Steps to reproduce
3. Potential impact / attack scenario
4. Suggested fix (if you have one)

---

## Response Timeline

| Stage | Target time |
|-------|-------------|
| Acknowledgement | Within 48 hours |
| Initial assessment | Within 5 business days |
| Patch or mitigation | Within 30 days (critical: 7 days) |
| Public disclosure | After patch is released |

---

## Known Limitations (by design)

The following are **not** considered vulnerabilities — they are intentional design decisions for a demo/local-first application:

- Authentication is simulated client-side (no real JWT verification)
- localStorage data can be inspected by browser dev tools
- There is no rate limiting or brute-force protection on the login form

For production deployments, we recommend connecting to a real backend API with proper authentication (e.g., the included `server/` directory).

---

Thank you for helping keep Al-Helaly ERP secure! 🔐
