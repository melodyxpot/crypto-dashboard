import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import WebSocket from "ws";

export interface CryptoPair {
  id: string;
  from: string;
  to: string;
  currentPrice: number;
  hourlyAverage: number;
  change24h: number;
  lastUpdate: number;
  history: Array<{ time: number; price: number }>;
  color: string;
}

interface PriceData {
  price: number;
  timestamp: number;
}

@Injectable()
export class CryptoService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CryptoService.name);
  private finnhubWs: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private readonly FINNHUB_API_KEY: string;
  private readonly RECONNECT_DELAY = 5000;
  private readonly HISTORY_LENGTH = 30;

  private pairs: Map<string, CryptoPair> = new Map();
  private priceHistory: Map<string, PriceData[]> = new Map();

  private readonly PAIR_CONFIGS = [
    {
      id: "eth-usdc",
      from: "ETH",
      to: "USDC",
      symbol: "BINANCE:ETHUSDC",
      color: "var(--chart-1)",
    },
    {
      id: "eth-usdt",
      from: "ETH",
      to: "USDT",
      symbol: "BINANCE:ETHUSDT",
      color: "var(--chart-2)",
    },
    {
      id: "eth-btc",
      from: "ETH",
      to: "BTC",
      symbol: "BINANCE:ETHBTC",
      color: "var(--chart-3)",
    },
  ];

  constructor(private configService: ConfigService) {
    this.FINNHUB_API_KEY = this.configService.get<string>("FINNHUB_API_KEY") || "";
  }

  onModuleInit() {
    this.initializePairs();
    this.connectToFinnhub();
  }

  onModuleDestroy() {
    this.disconnect();
  }

  private initializePairs() {
    this.PAIR_CONFIGS.forEach((config) => {
      this.pairs.set(config.id, {
        id: config.id,
        from: config.from,
        to: config.to,
        currentPrice: 0,
        hourlyAverage: 0,
        change24h: 0,
        lastUpdate: Date.now(),
        history: [],
        color: config.color,
      });
      this.priceHistory.set(config.id, []);
    });
  }

  private connectToFinnhub() {
    if (!this.FINNHUB_API_KEY) {
      this.logger.error("FINNHUB_API_KEY is not set in environment variables");
      return;
    }

    try {
      this.finnhubWs = new WebSocket(`wss://ws.finnhub.io?token=${this.FINNHUB_API_KEY}`);

      this.finnhubWs.on("open", () => {
        this.logger.log("Connected to Finnhub WebSocket");
        this.subscribeToSymbols();
      });

      this.finnhubWs.on("message", (data: WebSocket.Data) => {
        this.handleFinnhubMessage(data);
      });

      this.finnhubWs.on("error", (error) => {
        this.logger.error("Finnhub WebSocket error:", error.message);
      });

      this.finnhubWs.on("close", () => {
        this.logger.warn("Finnhub WebSocket closed. Reconnecting...");
        this.scheduleReconnect();
      });
    } catch (error) {
      this.logger.error("Failed to connect to Finnhub:", error);
      this.scheduleReconnect();
    }
  }

  private subscribeToSymbols() {
    if (!this.finnhubWs || this.finnhubWs.readyState !== WebSocket.OPEN) {
      return;
    }

    this.PAIR_CONFIGS.forEach((config) => {
      const subscribeMessage = JSON.stringify({
        type: "subscribe",
        symbol: config.symbol,
      });
      this.finnhubWs?.send(subscribeMessage);
      this.logger.log(`Subscribed to ${config.symbol}`);
    });
  }

  private handleFinnhubMessage(data: WebSocket.Data) {
    try {
      const message = JSON.parse(data.toString());

      if (message.type === "trade" && message.data) {
        message.data.forEach((trade: any) => {
          this.updatePriceForSymbol(trade.s, trade.p, trade.t);
        });
      }
    } catch (error) {
      this.logger.error("Error parsing Finnhub message:", error);
    }
  }

  private updatePriceForSymbol(symbol: string, price: number, timestamp: number) {
    const config = this.PAIR_CONFIGS.find((c) => c.symbol === symbol);
    if (!config) return;

    const pair = this.pairs.get(config.id);
    if (!pair) return;

    const history = this.priceHistory.get(config.id) || [];
    history.push({ price, timestamp });

    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const filteredHistory = history.filter((h) => h.timestamp > oneHourAgo);
    this.priceHistory.set(config.id, filteredHistory);

    const hourlyAverage =
      filteredHistory.length > 0
        ? filteredHistory.reduce((sum, h) => sum + h.price, 0) / filteredHistory.length
        : price;

    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    const dayOldPrice = filteredHistory.find((h) => h.timestamp <= twentyFourHoursAgo)?.price;
    const change24h = dayOldPrice ? ((price - dayOldPrice) / dayOldPrice) * 100 : 0;

    const now = Date.now();
    const chartHistory =
      pair.history.length >= this.HISTORY_LENGTH
        ? [...pair.history.slice(1), { time: now, price }]
        : [...pair.history, { time: now, price }];

    this.pairs.set(config.id, {
      ...pair,
      currentPrice: price,
      hourlyAverage,
      change24h,
      lastUpdate: now,
      history: chartHistory,
    });

    this.logger.debug(`Updated ${config.id}: ${price}`);
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      this.logger.log("Attempting to reconnect to Finnhub...");
      this.connectToFinnhub();
    }, this.RECONNECT_DELAY);
  }

  private disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.finnhubWs) {
      this.finnhubWs.close();
      this.finnhubWs = null;
    }
  }

  getAllPairs(): CryptoPair[] {
    return Array.from(this.pairs.values());
  }

  isConnected(): boolean {
    return this.finnhubWs?.readyState === WebSocket.OPEN;
  }
}
