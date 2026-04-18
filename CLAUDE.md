# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build          # Compile TypeScript to build/
npm run watch          # Watch mode compilation
npm run check          # Type-check without emitting
npm run lint           # ESLint on src/
npm test               # Run unit tests + package tests
npm run test:ts        # Unit tests only (mocha, src/**/*.test.ts)
npm run test:package   # Package integrity tests
npm run test:integration  # Integration tests (requires running ioBroker instance)
npm run translate      # Sync i18n translation files
npm run release        # Release via @alcalzone/release-script
```

## Architecture

This is an **ioBroker adapter** that polls a Liquid-Check device's HTTP JSON API at a configurable interval and maps the response into ioBroker states.

**Entry point:** `src/main.ts` — a single class `LiquidCheck` extending `utils.Adapter` from `@iobroker/adapter-core`.

**Data flow:**
1. `onReady()` starts a polling interval and does an initial fetch
2. `fetchData()` calls `this.config.option2` (the device URL) via axios with a 10 s timeout
3. `processData()` recursively walks the `response.data.payload` object and creates/updates ioBroker states dynamically using `extendObjectAsync` + `setStateAsync`
4. `info.connection` boolean state reflects fetch success/failure

**Config** (set by user in admin UI, typed in `src/lib/adapter-config.d.ts`):
- `checkInterval` — poll interval in minutes (default 15)
- `option2` — URL of the Liquid-Check device's JSON endpoint (validated with `new URL()`)

**Admin UI:** `admin/jsonConfig.json` — JSON-based config form (ioBroker's `jsonConfig` pattern). Translations in `admin/i18n/*/translations.json`.

**ioBroker conventions:**
- Adapter runs in `daemon` mode (long-running process), compact mode supported
- `onUnload` must always call the callback; clear all intervals there
- Use `this.setInterval`/`this.clearInterval` (adapter wrappers) instead of global ones — except the `startInterval` method uses `this.setInterval` correctly
- States must be acknowledged (`ack: true`) when set by the adapter itself
- `io-package.json` defines metadata, instance objects (`info.connection`), and native config defaults

**Build output:** `build/` (gitignored). The main entry for ioBroker is `build/main.js`.