/**
 * List of popular packages known to use install scripts legitimately.
 * This acts as our database of safe packages to prevent false positives.
 */
const allowList = [
  // --- CORE BUILDERS & COMPILERS ---
  "esbuild",
  "fsevents",
  "node-gyp",
  "core-js",
  "@swc/core", // React/Next/Vite compiler (Rust)
  "@astrojs/compiler", // Astro core compiler (Go)
  "lightningcss", // Fast CSS compiler (Rust)

  // --- FRAMEWORKS, MONOREPOS & WATCHERS ---
  "nx",
  "turbo",
  "sass-embedded",
  "@parcel/watcher", // Fast file watcher (Nuxt/Svelte)

  // --- TESTING, LINTING & SEARCH ---
  "puppeteer", // Also heavily used in backend for scraping
  "cypress",
  "playwright",
  "@playwright/test",
  "@biomejs/biome", // Modern linter/formatter (Rust)
  "oxc", // Blazing fast linter (Rust)
  "pagefind", // Static search engine (Rust)

  // --- DATABASES & ORMS ---
  "prisma",
  "@prisma/client",
  "@libsql/client", // Turso / Astro DB (C++/Rust)
  "sqlite3",
  "better-sqlite3", // Fast sync SQLite (C++ / Svelte standard)
  "drizzle-kit", // Modern ORM migrations
  "lmdb",

  // --- UTILS, NATIVE CRYPTO & AUTH ---
  "bcrypt",
  "argon2",
  "oslo",
  "sharp",
  "msgpackr-extract",
  "sodium-native", // Enterprise-grade cryptography

  // --- BACKEND INFRASTRUCTURE & APMs ---
  "canvas", // Native image/PDF generation (Cairo)
  "node-rdkafka", // High-performance Kafka client (C++)
  "dd-trace", // Datadog native profiler
  "newrelic", // New Relic APM native extensions
  "isolated-vm", // Secure V8 sandboxes
];

module.exports = allowList;
