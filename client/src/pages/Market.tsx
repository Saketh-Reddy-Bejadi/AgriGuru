import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Loader2 } from "lucide-react";

// Mock data for supported crops and their market share percentage
const mockMarketData = [
  { crop: "Wheat", percentage: 28 },
  { crop: "Rice", percentage: 22 },
  { crop: "Maize", percentage: 15 },
  { crop: "Sugarcane", percentage: 10 },
  { crop: "Cotton", percentage: 8 },
  { crop: "Soybean", percentage: 7 },
  { crop: "Pulses", percentage: 5 },
  { crop: "Other", percentage: 5 },
];

const COLORS = [
  "#22c55e",
  "#0ea5e9",
  "#f59e42",
  "#a78bfa",
  "#f43f5e",
  "#fbbf24",
  "#6366f1",
  "#6ee7b7",
];

const Market: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState<typeof mockMarketData>([]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMarketData(mockMarketData);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto mt-8 animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              Market Data Overview
            </CardTitle>
            <CardDescription>
              Supported crops and their market share
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading market data...</p>
              </div>
            ) : (
              <div className="w-full h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={marketData}
                    layout="horizontal"
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <XAxis
                      dataKey="crop"
                      type="category"
                      interval={0}
                      angle={-20}
                      dy={20}
                      height={60}
                    />
                    <YAxis
                      type="number"
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                      {marketData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Market;
