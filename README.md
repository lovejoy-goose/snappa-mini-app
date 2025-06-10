# Snappa Mini App

## a state-of-the-artlu Jun 2025 Farcaster Mini App

Singe Page Application (SPA) using Preact, TypeScript, TailwindCss v4 and Vite, designed to run forever on scale-to-zero Cloudflare Workers and other services that scale without provisioning.

### bleeding edge Mini App features

* Share Actions load specific casts from the feed into a Mini App

The DX features hot module replacement, fast Rust-based Biome linting, and zero-config services. It uses only the API of the Neynar Free Plan.

<!-- dash-content-start -->

🚀 Supercharged web development with this BHVR-adjacent stack:

* [**Preact**](https://preactjs.com/) - Fast 3kB alternative to React
* [**Vite**](https://vite.dev/) - Lightning-fast build tooling and development server
* [**Hono**](https://hono.dev/) - Ultralight, modern backend framework
* [**Cloudflare Workers**](https://developers.cloudflare.com/workers/) - Edge computing platform for global deployment
* [**Neynar**](https://neynar.com/) - Easiest way to build on Farcaster
* [**Momento Cache**](https://gomomento.com/) - Robust, turnkey caching with ultra low-latency and instance-free adaptive scalability

### ✨ Key Features

* 🎯 a modern and stable DX on Tailwind, JSX, Frames SDK
* 🛠️ Rust-based Biome formatting and linting
* ⚡ Hot Module Replacement (HMR) for rapid development
* 📦 end-to-end type safety with no-codegen autocomplete
* 🔥 API routes with Hono's elegant routing
* 🔄 Zero-config deployment to Cloudflare

<!-- dash-content-end -->

## Development

Install dependencies:

```bash
bun install
```

Update variables in `wrangler.jsonc` and `.dev.vars`:

```bash
vi wrangler.jsonc
bun run types
```

Start the development server with:

```bash
bun dev
```

Your application will be available at [http://localhost:5173](http://localhost:5173).

## Production

Build your project for production:

```bash
bun build
```

Deploy your project to Cloudflare Workers:

```bash
bun run deploy
```

Update secrets in prod, e.g.:

```bash
wrangler secret put MOMENTO_API_KEY
wrangler secret put NEYNAR_API_KEY
wrangler secret put SECRET
```

or via Cloudflare Workers dashboard (copy and paste contents of `.dev.vars`)

### checking auth

SECRET

### bookmarks

DECENT_BOOKMARKS_SECRET

### caching

MOMENTO_API_KEY

### defi

COINGECKO_API_KEY

ETHERSCAN_API_KEY

ZEROEX_API_KEY

### neynar

NEYNAR_API_KEY

### sassyhash

YOGA_WHISTLES_BEARER

YOGA_WHISTLES_WRITE_TOKEN

SASSY_SECRET_20250609,  <-- *obtain a properly-formed secret via random key generator microservice, documented in the* [backend repo](https://github.com/artlu99/yoga-whistles/blob/058514d06ece2a64bd51e8cc5f3572332771c754/test/unit.spec.ts#L6C1-L6C1).
