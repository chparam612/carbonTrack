---
name: React version mismatch in ecotrace monorepo
description: Root node_modules has React 19, ecotrace/node_modules has React 18 — vite alias must point to LOCAL to avoid test failures
---

# React Version Mismatch — ecotrace

## The Rule
`vite.config.js` resolve aliases for `react`, `react-dom`, `react/jsx-runtime`, and `react/jsx-dev-runtime` must point to **`./node_modules`** (ecotrace local), NOT `../node_modules` (root).

## Why
Root node_modules was updated to React 19 (when `npm install prop-types dompurify` was run at root level). ecotrace/node_modules still has React 18. @testing-library/react uses ecotrace's local react-dom 18. If the vite alias points jsx-runtime to React 19, the elements it creates have a different internal format than what react-dom 18 expects, causing: "Objects are not valid as a React child (found: object with keys {$$typeof, type, key, props, _owner, _store})".

## How to Apply
In `ecotrace/vite.config.js`:
```js
const LOCAL_MODULES = resolve('./node_modules')
resolve: {
  alias: {
    'react': `${LOCAL_MODULES}/react`,
    'react-dom': `${LOCAL_MODULES}/react-dom`,
    'react/jsx-runtime': `${LOCAL_MODULES}/react/jsx-runtime`,
    'react/jsx-dev-runtime': `${LOCAL_MODULES}/react/jsx-dev-runtime`,
  },
}
```

If anything is installed at root level again that bumps React, this same error will recur.
