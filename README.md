# Card Operator

A polished, mobile-first arithmetic game. Choose three of six cards to complete an equation and hit the target before the 60-second timer expires.

## Development

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

Easy uses addition, Medium adds subtraction, and Hard adds multiplication. Normal mathematical precedence applies. Correct answers score 100, 200, or 300 points according to difficulty.

Best scores are stored locally. The app can be installed as a PWA and works offline after the first load.
