# Crypto Dashboard Setup Guide

## Prerequisites

- Node.js >= 18
- pnpm >= 8.15.5
- Finnhub API key (get it free from https://finnhub.io)

## Installation

1. Install dependencies:

```bash
pnpm install
```

2. Configure Finnhub API key:
   - Go to `apps/api/.env`
   - Add your Finnhub API key: `FINNHUB_API_KEY=your_key_here`

## Running the Application

### Development Mode

In the root directory, run both apps:

```bash
pnpm dev
```

Or run them separately:

**Backend (API):**

```bash
cd apps/api
pnpm dev
```

Backend runs on http://localhost:3000

**Frontend (Web):**

```bash
cd apps/web
pnpm dev
```

Frontend runs on http://localhost:5173 (Vite default)

## How It Works

### Backend (NestJS)

- **CryptoService**: Connects to Finnhub WebSocket API and subscribes to:
  - BINANCE:ETHUSDC
  - BINANCE:ETHUSDT
  - BINANCE:ETHBTC
- Calculates hourly averages from received trade data
- Handles reconnection logic automatically
- Filters price history to last hour for average calculation

### Frontend (React + Vite)

- Connects to backend via Socket.IO WebSocket
- Displays real-time charts for all three pairs
- Shows current price, hourly average, and 24h change
- Handles connection states with visual feedback
- Auto-reconnects on connection loss

## Environment Variables

### Backend (apps/api/.env)

```
FINNHUB_API_KEY=your_finnhub_api_key
```

### Frontend (apps/web/.env) [Optional]

```
VITE_BACKEND_URL=http://localhost:3000
```

(Defaults to http://localhost:3000 if not set)

## Troubleshooting

**Frontend can't connect to backend:**

- Ensure backend is running on port 3000
- Check CORS is enabled in backend (already configured)
- Verify VITE_BACKEND_URL is correct

**No data from Finnhub:**

- Verify FINNHUB_API_KEY is set correctly in apps/api/.env
- Check Finnhub API rate limits (60 req/min on free tier)
- Check backend logs for connection errors

**WebSocket connection issues:**

- Both polling and WebSocket transports are enabled
- Auto-reconnection is configured with exponential backoff
