import CurrencyChart from "./components/currency-chart";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { useCryptoData } from "./hooks/use-crypto-data";
import { ActivityIcon, AlertCircleIcon, WifiIcon, WifiOffIcon } from "lucide-react";
import "./App.css";
import { Badge } from "./components/ui/badge";

function App() {
  const { pairs, connectionState, error } = useCryptoData();

  const getConnectionBadge = () => {
    switch (connectionState) {
      case "connected":
        return (
          <Badge className="gap-1.5 border-success text-success">
            <WifiIcon className="h-3 w-3" />
            Connected
          </Badge>
        );
      case "connecting":
        return (
          <Badge className="gap-1.5 border-warning text-warning">
            <ActivityIcon className="h-3 w-3 animate-pulse" />
            Connecting
          </Badge>
        );
      case "disconnected":
        return (
          <Badge className="gap-1.5 border-destructive text-destructive">
            <WifiOffIcon className="h-3 w-3" />
            Disconnected
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-balance">
            Crypto Exchange Dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Real-time cryptocurrency exchange rates
          </p>
        </div>
        {getConnectionBadge()}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pairs.map((pair) => (
          <Card key={pair.id} className="overflow-hidden border-border bg-card backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium tracking-tight">
                  {pair.from} → {pair.to}
                </CardTitle>
                <Badge
                  className={
                    pair.change24h >= 0
                      ? "bg-success/10 text-success border-success/20 font-medium"
                      : "bg-destructive/10 text-destructive border-destructive/20 font-medium"
                  }
                >
                  {pair.change24h >= 0 ? "+" : ""}
                  {pair.change24h.toFixed(2)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-3xl font-semibold tracking-tight tabular-nums">
                  {pair.currentPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6,
                  })}
                </div>
                <div className="mt-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {pair.to}
                </div>
              </div>

              <CurrencyChart data={pair.history} color={pair.color} />

              <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                <div>
                  <div className="font-medium text-muted-foreground uppercase tracking-wider">
                    1h Avg
                  </div>
                  <div className="mt-1 text-sm font-semibold tabular-nums text-foreground">
                    {pair.hourlyAverage.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}{" "}
                    <span className="text-muted-foreground">{pair.to}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-muted-foreground uppercase tracking-wider">
                    Last Update
                  </div>
                  <div className="mt-1 text-sm font-medium tabular-nums text-foreground">
                    {new Date(pair.lastUpdate).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pairs.length === 0 && !error && (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <ActivityIcon className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
            <p className="mt-4 text-base font-medium text-muted-foreground">
              Loading exchange rates...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
