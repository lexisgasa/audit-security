# 🛡️ Security Audit

[![npm version](https://img.shields.io/npm/v/audit-security.svg)](https://www.npmjs.com/package/audit-security)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightning-fast, zero-config CLI tool to scan Node.js repositories for hidden and potentially malicious installation scripts **before** you run `npm install`.

## The Problem

Supply chain attacks and dependency poisoning are on the rise. Hackers use `postinstall` scripts to execute malware on your machine the moment you run `npm install` on a cloned repository.

Native tools like `npm audit` only warn you about _known_ vulnerabilities after the fact. **Security Audit** acts as a zero-trust shield, analyzing the dependency tree proactively.

## Features

- 🚀 **Zero Setup:** No accounts, no API keys, no installation required.
- 🔍 **Root Check:** Scans the main `package.json` for malicious traps.
- 🌳 **Deep Tree Scan:** Analyzes `package-lock.json` to find any nested dependency attempting to execute code.
- 🧠 **Smart Allowlist:** Built-in intelligence to ignore legitimate heavy-lifting tools (like `esbuild`, `Prisma`, `@swc/core`, `Playwright`, etc.) across modern frameworks (React, Next, Nuxt, Astro, Svelte, NestJS).

## Usage

You don't need to install this package. Simply navigate to any Node.js project directory you just cloned and run:

```bash
npx audit-security
```

## How to safely generate a lockfile

If the repository you cloned does not have a `package-lock.json` (which this tool requires to scan deep dependencies), you can safely generate one without executing any scripts by running:

```bash
npm install --package-lock-only --ignore-scripts
```

Then, run `npx audit-security` again.

## Example Output

### Package-lock.json not found

```
🟢 [ROOT SAFE] Root 'package.json' has no hidden install scripts.

⚠️  [WARNING] 'package-lock.json' not found.
This is common if the author didn't commit it to Git.
To safely generate it and run this audit again, type:
npm install --package-lock-only --ignore-scripts
```

### Safe

```
🟢 [ROOT SAFE] Root 'package.json' has no hidden install scripts.
🟢 [DEPS SAFE] All dependencies are clean.

⚪ [INFO] Allowed packages detected (safe to compile):
   - @biomejs/biome
   - esbuild
   - fsevents

✅ VERDICT: Safe to run 'npm install'.
```

### Malicious

```
🔴 [DANGER] UNKNOWN dependencies attempting to execute code found:
  🚨 plain-crypto-js
  🚨 malicious-pkg-typosquat

💡 VERDICT: DO NOT RUN 'npm install'.
If you must proceed, strictly use: npm ci --ignore-scripts
```

## 🤝 Contributing & Feedback

Security is a community effort! If you find a legitimate package that is being flagged as dangerous, or you want to suggest a new feature:

1. **Submit a Pull Request:** Add the package to `allowlist.js`.
2. **Open an Issue:** Tell me which package should be ignored at the [GitHub Repository](https://github.com/lexisgasa/audit-security).
3. **Feedback:** Reach out on [LinkedIn](https://www.linkedin.com/in/alexisgasa/?locale=en).

## License

MIT
