# 🌿 EcoTrace — Carbon Footprint Awareness Platform

> Know Your Carbon. Change Your Future.

EcoTrace is a full-stack web application built for Virtual PromptWars (Hack2Skill × Google Cloud) that helps individuals understand, track, and reduce their carbon footprint through scientific calculations, AI-powered coaching, and hyperlocal green action.

## ✨ Features

- 🧮 **Scientific CO₂ Calculator** — 5-step quiz using real IPCC AR6, US EPA & India CEA 2023 emission factors
- 📊 **Interactive Dashboard** — Bento grid with Google Charts (pie, line, bar) + benchmark comparison
- 📅 **Daily Activity Tracker** — Log transport, diet, energy, shopping, waste with real-time CO₂ preview
- 🤖 **Gemini AI Coach** — Personalized eco personality, top 5 tips, weekly goals via Gemini API
- 🗺️ **Eco Map** — Google Maps showing EV stations, parks, organic stores, recycling centers near you
- 🔥 **Firebase Firestore** — Cloud sync of daily logs with anonymous auth
- 🏆 **Achievement Badges** — Gamified milestones to keep you motivated
- 🌙 **Dark Mode** — Earthy forest theme, day & night

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 + Vite | Frontend framework |
| Tailwind CSS | Styling with custom earthy theme |
| Framer Motion | Page transitions & micro-animations |
| **Gemini API** | AI insights & eco coaching |
| **Google Charts** | Data visualizations |
| **Google Maps JS API** | Nearby green places |
| **Firebase Firestore** | Cloud data persistence |
| **Firebase Auth** | Anonymous authentication |

## 🚀 Getting Started

```bash
cd ecotrace
npm install
npm run dev
```

Then open `http://localhost:5173` and paste your API keys in the setup modal.

## 🔑 API Keys Required

| Key | Where to get it | Required? |
|-----|----------------|-----------|
| Gemini API Key | [aistudio.google.com](https://aistudio.google.com/app/apikey) | ✅ Yes |
| Firebase Config | [Firebase Console](https://console.firebase.google.com) | Optional |
| Google Maps Key | [Google Cloud Console](https://console.cloud.google.com) | Optional |

Keys are stored in your browser's localStorage — never sent to any server.

## 📐 Architecture

```
src/
├── algorithms/       # CO₂ calculation, tip ranking, progress analysis
├── config/           # Firebase init, API key management
├── data/             # Emission factors (IPCC/EPA/CEA), quiz questions
├── pages/            # Home, Quiz, Dashboard, Tracker, Insights, Map
├── components/       # Navbar, SetupModal, ChartCard, TipCard, ActivityForm
└── hooks/            # useFirestore, useGemini
```

## 🧮 CO₂ Calculation

Uses real emission factors from:
- **IPCC AR6** (transport, diet)
- **US EPA** (waste, shopping)  
- **India CEA 2023** (electricity grid: 0.82 kg CO₂/kWh)

Compares your footprint against:
- 🇮🇳 India average: **1,900 kg CO₂/year**
- 🌍 Global average: **4,700 kg CO₂/year**
- 🌡️ Paris 1.5°C target: **2,300 kg CO₂/year**

## 👤 Author

Paramveer Singh — [GitHub](https://github.com/chparam612)

Built for Virtual PromptWars Challenge 3 — Hack2Skill × Google Cloud
