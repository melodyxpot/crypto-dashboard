"use client"

import { useEffect, useState } from "react"

export type ConnectionState = "connecting" | "connected" | "disconnected"

export interface CryptoPair {
  id: string
  from: string
  to: string
  currentPrice: number
  hourlyAverage: number
  change24h: number
  lastUpdate: number
  history: Array<{ time: number; price: number }>
  color: string
}

const PAIRS = [
  { id: "eth-usdc", from: "ETH", to: "USDC", basePrice: 2450, color: "var(--chart-1)" },
  { id: "eth-usdt", from: "ETH", to: "USDT", basePrice: 2448, color: "var(--chart-2)" },
  { id: "eth-btc", from: "ETH", to: "BTC", basePrice: 0.0625, color: "var(--chart-3)" },
]

const UPDATE_INTERVAL = 2000 // Update every 2 seconds
const HISTORY_LENGTH = 30 // Keep 30 data points

// Simulate realistic price movements
function generatePriceChange(basePrice: number, volatility = 0.002): number {
  const change = (Math.random() - 0.5) * 2 * volatility * basePrice
  return basePrice + change
}

export function useCryptoData() {
  const [pairs, setPairs] = useState<CryptoPair[]>([])
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate initial connection delay
    const connectionTimeout = setTimeout(() => {
      setConnectionState("connected")
      setError(null)

      // Initialize pairs with historical data
      const initialPairs = PAIRS.map((pair) => {
        const now = Date.now()
        const history = Array.from({ length: HISTORY_LENGTH }, (_, i) => ({
          time: now - (HISTORY_LENGTH - i - 1) * UPDATE_INTERVAL,
          price: generatePriceChange(pair.basePrice),
        }))

        return {
          ...pair,
          currentPrice: history[history.length - 1].price,
          hourlyAverage: pair.basePrice,
          change24h: (Math.random() - 0.5) * 10, // Random 24h change between -5% and +5%
          lastUpdate: now,
          history,
        }
      })

      setPairs(initialPairs)
    }, 1500)

    // Simulate periodic updates
    const updateInterval = setInterval(() => {
      setPairs((prevPairs) =>
        prevPairs.map((pair) => {
          const now = Date.now()
          const newPrice = generatePriceChange(pair.currentPrice, 0.003)

          // Update history
          const newHistory = [
            ...pair.history.slice(1),
            {
              time: now,
              price: newPrice,
            },
          ]

          // Calculate hourly average from recent history
          const hourlyAverage = newHistory.reduce((sum, point) => sum + point.price, 0) / newHistory.length

          return {
            ...pair,
            currentPrice: newPrice,
            hourlyAverage,
            lastUpdate: now,
            history: newHistory,
          }
        }),
      )
    }, UPDATE_INTERVAL)

    // Simulate occasional connection issues (5% chance every 10 seconds)
    const connectionCheckInterval = setInterval(() => {
      if (Math.random() < 0.05) {
        setConnectionState("disconnected")
        setError("Connection lost. Attempting to reconnect...")

        setTimeout(() => {
          setConnectionState("connected")
          setError(null)
        }, 3000)
      }
    }, 10000)

    return () => {
      clearTimeout(connectionTimeout)
      clearInterval(updateInterval)
      clearInterval(connectionCheckInterval)
    }
  }, [])

  return { pairs, connectionState, error }
}
