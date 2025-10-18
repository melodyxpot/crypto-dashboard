"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from "recharts"

interface CurrencyChartProps {
  data: Array<{ time: number; price: number }>
  color: string
}

export default function CurrencyChart({ data, color }: CurrencyChartProps) {
  return (
    <div className="h-[120px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <YAxis domain={["dataMin", "dataMax"]} hide />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
                    <div className="font-semibold">
                      {payload[0].value?.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(payload[0].payload.time).toLocaleTimeString()}
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Line type="monotone" dataKey="price" stroke={color} strokeWidth={2} dot={false} animationDuration={300} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
