"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ConnectionStatus } from './dashboard';

interface PowerChartProps {
  data: { time: string; power: number }[];
  status: ConnectionStatus;
}

export default function PowerChart({ data, status }: PowerChartProps) {
  const isLoading = status !== 'connected';

  if (isLoading) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
            <p className="text-sm text-muted-foreground">Connect your shoe to see live power data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={60}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 'dataMax + 0.5']}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip 
            cursor={{ stroke: 'hsl(var(--accent))', strokeWidth: 1, strokeDasharray: '3 3' }}
            contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                borderColor: 'hsl(var(--border))',
                color: 'hsl(var(--popover-foreground))',
                borderRadius: 'calc(var(--radius) - 2px)',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                padding: '8px 12px'
            }}
            labelStyle={{ fontWeight: '500' }}
            formatter={(value: number) => [`${value.toFixed(2)} W`, 'Power']}
          />
          <Area 
            type="monotone" 
            dataKey="power" 
            stroke="hsl(var(--accent))" 
            fillOpacity={1} 
            fill="url(#colorPower)" 
            strokeWidth={2} 
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
