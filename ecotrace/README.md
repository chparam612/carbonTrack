# 🌿 EcoTrace — Know Your Carbon. Change Your Future.

> A full-featured carbon footprint tracker built with React + Vite, powered by Google Gemini AI.

[![Live App](https://img.shields.io/badge/Live%20App-ecotrace--carbontrack.web.app-2d5016?style=for-the-badge&logo=firebase)](https://ecotrace-carbontrack.web.app)
[![GitHub](https://img.shields.io/badge/GitHub-chparam612%2FcarbonTrack-181717?style=for-the-badge&logo=github)](https://github.com/chparam612/carbonTrack)

---

## Features

### Scientific Carbon Calculator
- 5-step quiz covering **Transport, Diet, Energy, Shopping, and Waste**
- Emission factors from **IPCC AR6**, **US EPA 2023**, and **India CEA 2023** (grid: 0.82 kg CO2/kWh)
- Instant breakdown by category with tree-offset count

### Interactive Dashboard
- Animated bento-grid with footprint score, streak tracker, and daily average
- **Real-world equivalents** — your CO2 as flights, car km, and trees
- Pie chart (breakdown), line chart (trends), bar chart (vs. benchmarks)
- Category progress bars comparing against India avg (1,900 kg), global avg (4,700 kg), and Paris target (2,300 kg)
- Achievement badge system

### Daily Activity Tracker
- Log activities by category (transport, diet, energy, shopping, waste)
- Calendar heatmap of daily emissions
- Running totals with moving average trend

### Gemini AI Insights
- **Eco Personality** — your unique sustainability archetype
- **Personal Reduction Plan** — top 5 personalised tips with annual savings in kg CO2
- Weekly goal + monthly challenge tailored to your profile
- Fun climate fact + motivational message
- Cached for 24 hours, session-rate-limited (10 calls/session)

### Eco Map
- Nearby EV chargers, parks, organic stores, and recycling centres
- Powered by Google Maps API

### Science and Benchmarks
- IPCC AR6 (transport and diet), US EPA 2023 (waste and shopping), India CEA 2023 (energy)
- Benchmarks displayed throughout: India avg, Global avg, Paris 1.5 degrees C target

---

## Getting Started

### Prerequisites
- Node.js 18+
- A free [Google Gemini API key](https://aistudio.google.com/app/apikey)
- (Optional) Firebase project + Google Maps API key

### Installation

```bash
git clone https://github.com/chparam612/carbonTrack.git
cd carbonTrack
npm install
cd ecotrace
npm run dev
```

The app opens at `http://localhost:5173`. On first launch, a setup modal prompts you to enter API keys — **keys are stored only in your browser's localStorage, never sent to any server**.

### Running Tests

```bash
cd ecotrace
npm test
```

### Building for Production

```bash
cd ecotrace
npm run build
```

---

## API Keys

| Key | Required | Where to get |
|-----|----------|--------------|
| Gemini API Key | Yes | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| Firebase Config | Optional | [console.firebase.google.com](https://console.firebase.google.com) — Project Settings |
| Google Maps API Key | Optional | [console.cloud.google.com](https://console.cloud.google.com) — APIs and Services |

All keys are stored in `localStorage` only. The app validates Gemini and Maps keys against the expected `AIza...` pattern before use.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 (custom earthy palette) |
| Animations | Framer Motion |
| Charts | Google Charts |
| AI | Google Gemini (gemini-2.0-flash with auto-fallback) |
| Database | Firebase Firestore (optional, anonymous auth) |
| Maps | Google Maps JavaScript API |
| Testing | Vitest + Testing Library |
| Deployment | Firebase Hosting |

---

## Project Structure

```
ecotrace/
├── public/
│   └── _headers              # CSP + security headers
├── src/
│   ├── algorithms/
│   │   ├── carbonCalculator.js   # Core CO2 engine (IPCC/EPA/CEA factors)
│   │   ├── tipRanker.js          # Sorts tips by annual CO2 saving
│   │   └── progressAnalyzer.js   # Moving average, trend, streak
│   ├── components/
│   │   ├── ErrorBoundary.jsx     # Catches page-level crashes gracefully
│   │   ├── Navbar.jsx
│   │   ├── ActivityForm.jsx      # DOMPurify-sanitised user input
│   │   ├── TipCard.jsx
│   │   ├── ChartCard.jsx
│   │   ├── EmptyState.jsx
│   │   └── SetupModal.jsx
│   ├── config/
│   │   ├── keys.js               # localStorage key management + regex validation
│   │   └── firebase.js           # Lazy Firebase initialisation
│   ├── data/
│   │   └── emissionFactors.js    # IPCC/EPA/CEA emission constants
│   ├── hooks/
│   │   └── useGemini.js          # Gemini hook with auto-detection + rate limit
│   ├── pages/
│   │   ├── Home.jsx              # Hero + science section + stats strip
│   │   ├── Quiz.jsx              # 5-step footprint quiz
│   │   ├── Dashboard.jsx         # Bento grid + equivalents + methodology
│   │   ├── Tracker.jsx           # Daily activity logger + heatmap
│   │   ├── Insights.jsx          # Gemini AI analysis + reduction plan
│   │   └── Map.jsx               # Eco places near you
│   ├── test/
│   │   ├── integration.test.js   # Full pipeline: quiz, footprint, tips, progress
│   │   └── *.test.js             # Unit tests (algorithms + components)
│   └── utils/
│       ├── constants.js          # Shared labels, colours, difficulty strings
│       └── scoring.js            # Score colour + label helpers
├── firestore.rules               # Firestore security rules
└── tailwind.config.js
```

---

## Accessibility

- WCAG 2.1 AA compliant focus rings via `*:focus-visible`
- Skip-to-main-content link
- All interactive elements have `aria-label` or visible labels
- All form inputs have associated labels via `htmlFor`
- `aria-current="page"` on active nav links
- `prefers-reduced-motion` respected — animations disabled system-wide
- High-contrast mode support via `forced-colors: active`
- Colour palette passes AA contrast ratios

---

## Security

- No hardcoded API keys — all stored in `localStorage`
- API key format validated with regex `^AIza[0-9A-Za-z_-]{35}$`
- User input sanitised with **DOMPurify** (strips all HTML)
- CSP headers via `public/_headers`
- Firestore rules: users can only read/write their own documents
- `console.*` statements wrapped in `import.meta.env.DEV` guards
- Session-level Gemini rate limit (10 calls per session)

---

## License

MIT (c) 2025 EcoTrace
