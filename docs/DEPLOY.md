# Deploy checklist

## Vercel (recommended)

1. Push the repository to GitHub/GitLab/Bitbucket.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Framework preset: **Next.js** (auto-detected).
4. Build command: `npm run build`
5. Output: default (Next.js App Router)
6. Install command: `npm install`
7. **Environment variables:** none required (PokeAPI is public).
8. Deploy — note the production URL (e.g. `https://pokedex-xxx.vercel.app`).

## Pre-deploy verification

```bash
npm run lint
npm test
npm run build
npm start
# In another terminal:
npm run test:e2e
```

## Production checklist

- [ ] `npm run build` succeeds without errors
- [ ] Production URL loads and name index completes
- [ ] `/manifest.json` returns valid JSON
- [ ] `/sw.js` registers (HTTPS required for SW outside localhost)
- [ ] Icons at `/icons/icon-192.png` and `/icons/icon-512.png` load
- [ ] PWA install prompt works on Android Chrome / iOS Safari Add to Home Screen
- [ ] README production URL updated after first deploy

## Optional: other hosts

- **Netlify:** connect repo, build `npm run build`, publish `.next` via Next.js plugin or use Netlify Next runtime.
- **Node server:** run `npm run build && npm start` on any Node 20+ host behind HTTPS.

## Known limitations

- Pokémon data is fetched live from [PokeAPI](https://pokeapi.co/) — no API key needed, but offline detail requires network.
- Service worker caches the app shell and static assets only; list/detail API calls are not cached.

## Optional: Capacitor (deferred)

Native iOS/Android builds via Capacitor are optional. Simplest path: point Capacitor WebView at the deployed PWA URL rather than static export.
