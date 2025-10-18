"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export type ConnectionState = "connecting" | "connected" | "disconnected";

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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export function useCryptoData() {
  const [pairs, setPairs] = useState<CryptoPair[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    socket.on("connect", () => {
      setConnectionState("connected");
      setError(null);
    });

    socket.on("disconnect", () => {
      setConnectionState("disconnected");
      setError("Connection lost. Attempting to reconnect...");
    });

    socket.on("connect_error", (err) => {
      setConnectionState("disconnected");
      setError(`Connection error: ${err.message}`);
    });

    socket.on(
      "crypto-update",
      (data: { type: string; pairs: CryptoPair[]; connected: boolean }) => {
        if (data.pairs && data.pairs.length > 0) {
          setPairs(data.pairs);
          setConnectionState(data.connected ? "connected" : "disconnected");

          if (!data.connected) {
            setError("Backend is connecting to data source...");
          } else if (error) {
            setError(null);
          }
        }
      },
    );

    return () => {
      socket.close();
    };
  }, []);

  return { pairs, connectionState, error };
}
