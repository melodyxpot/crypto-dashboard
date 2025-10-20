# Crypto Dashboard

A real-time cryptocurrency dashboard that displays live exchange rates for ETH/USDC, ETH/USDT, and ETH/BTC pairs using WebSocket connections.

## Features

- **Real-time data streaming** from Finnhub API
- **Live charts** for all three currency pairs
- **Hourly averages** calculated and displayed
- **WebSocket connection** between backend and frontend
- **Automatic reconnection** handling
- **Production-ready** turborepo monorepo setup

## Tech Stack

### Backend

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **Socket.IO** - Real-time bidirectional communication
- **WebSocket (ws)** - Finnhub API connection
- **Jest** - Testing framework

### Frontend

- **React 19** - UI library
- **Vite** - Fast build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Chart library
- **Socket.IO Client** - WebSocket client
- **Vitest** - Testing framework

## Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.15.5
- **Finnhub API Key** (free at https://finnhub.io)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd crypto-dashboard
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env` file in `apps/api` directory:

```bash
cd apps/api
cp .env.example .env
```

Edit `apps/api/.env` and add your Finnhub API key:

```env
FINNHUB_API_KEY=your_finnhub_api_key_here
```

**Get your free API key at:** https://finnhub.io

## Running the Application

### Development Mode

Run both backend and frontend in development mode with hot-reload:

```bash
pnpm dev
```

**Access the application:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

**Run individually:**

```bash
# Backend only
cd apps/api
pnpm dev

# Frontend only
cd apps/web
pnpm dev
```

### Production Mode

#### 1. Build all projects

```bash
pnpm build
```

#### 2. Start in production mode

```bash
pnpm start
```

**Access the application:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

**Run individually:**

```bash
# Backend only
cd apps/api
pnpm start

# Frontend only
cd apps/web
pnpm start
```

## Project Structure

```
crypto-dashboard/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── crypto/         # Crypto WebSocket module
│   │   │   │   ├── crypto.service.ts    # Finnhub connection
│   │   │   │   ├── crypto.gateway.ts    # Socket.IO gateway
│   │   │   │   └── crypto.module.ts
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── .env                # Environment variables
│   │   └── package.json
│   │
│   └── web/                    # React + Vite frontend
│       ├── src/
│       │   ├── components/     # UI components
│       │   ├── hooks/          # Custom hooks
│       │   │   └── use-crypto-data.ts   # WebSocket hook
│       │   ├── App.tsx
│       │   └── main.tsx
│       └── package.json
│
├── packages/                   # Shared packages
│   ├── api/                    # Shared API types
│   ├── eslint-config/          # Shared ESLint configs
│   ├── jest-config/            # Shared testing configs
│   ├── typescript-config/      # Shared TypeScript configs
│   └── vite-config/            # Shared Vite configs
│
├── package.json                # Root package.json
├── turbo.json                  # Turborepo config
└── pnpm-workspace.yaml         # pnpm workspace config
```

## Available Scripts

### Root Level

```bash
pnpm dev          # Run all apps in development mode
pnpm build        # Build all apps for production
pnpm start        # Run all apps in production mode
pnpm test         # Run tests in all apps
pnpm lint         # Lint all projects
pnpm format       # Format code with Prettier
```

### API (apps/api)

```bash
pnpm dev          # Development with hot-reload
pnpm build        # Build for production
pnpm start        # Run production build
pnpm test         # Run Jest tests
pnpm lint         # Lint TypeScript files
```

### Web (apps/web)

```bash
pnpm dev          # Development with Vite
pnpm build        # Build for production
pnpm start        # Preview production build
pnpm test         # Run Vitest tests
pnpm lint         # Lint TypeScript files
```

## Environment Variables

### Backend (apps/api/.env)

| Variable          | Description          | Required |
| ----------------- | -------------------- | -------- |
| `FINNHUB_API_KEY` | Your Finnhub API key | Yes      |

### Frontend (apps/web/.env.local) - Optional

| Variable           | Description     | Default               |
| ------------------ | --------------- | --------------------- |
| `VITE_BACKEND_URL` | Backend API URL | http://localhost:3000 |

## How It Works

### Backend Flow

1. **CryptoService** connects to Finnhub WebSocket API on module initialization
2. Subscribes to real-time trade data for:
   - `BINANCE:ETHUSDC`
   - `BINANCE:ETHUSDT`
   - `BINANCE:ETHBTC`
3. Calculates hourly averages from incoming price data
4. Stores price history (last hour) for each pair
5. **CryptoGateway** broadcasts updates to connected frontend clients every 2 seconds via Socket.IO

### Frontend Flow

1. **useCryptoData** hook establishes Socket.IO connection to backend
2. Listens for `crypto-update` events with latest price data
3. Updates React state with new data
4. Components re-render with updated prices, charts, and averages
5. Handles connection states (connecting, connected, disconnected)

### Data Flow Diagram

```
Finnhub API → WebSocket → NestJS Service → Socket.IO → React Frontend
                           ↓
                    Hourly Average
                    Calculation
```

## Troubleshooting

### Frontend can't connect to backend

- Ensure backend is running on port 3000
- Check `VITE_BACKEND_URL` environment variable
- Verify CORS is enabled (already configured)

### No data from Finnhub

- Verify `FINNHUB_API_KEY` is set correctly in `apps/api/.env`
- Check Finnhub API rate limits (60 requests/minute on free tier)
- Check backend logs for connection errors

### Build errors

```bash
# Clear all caches and reinstall
pnpm clean
pnpm install
pnpm build
```

### Port already in use

```bash
# Kill process on port 3000 (API)
npx kill-port 3000

# Kill process on port 5173 (Web)
npx kill-port 5173
```

## Testing

Run tests for all projects:

```bash
pnpm test
```

Run tests in watch mode:

```bash
cd apps/api && pnpm test:watch   # Backend
cd apps/web && pnpm test          # Frontend
```
