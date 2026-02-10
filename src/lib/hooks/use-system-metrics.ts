"use client";

import { useState, useEffect } from "react";

export interface SystemMetrics {
  cpu: number;
  memory: number;
  networkIn: number;
  networkOut: number;
  activeConnections: number;
  temperature: number;
  latency: number;
  timestamp: string;
}

export function useSystemMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics[]>({} as any); // Initialize empty, will fill in effect
  const [history, setHistory] = useState<SystemMetrics[]>([]);

  useEffect(() => {
    // Initial Fill
    const initial: SystemMetrics[] = Array.from({ length: 20 }).map((_, i) => ({
      cpu: 10 + Math.random() * 20,
      memory: 40 + Math.random() * 10,
      networkIn: Math.random() * 500,
      networkOut: Math.random() * 200,
      activeConnections: 5 + Math.floor(Math.random() * 10),
      temperature: 45 + Math.random() * 5,
      latency: 20 + Math.random() * 10,
      timestamp: new Date(Date.now() - (20 - i) * 1000).toLocaleTimeString(),
    }));
    setHistory(initial);

    const interval = setInterval(() => {
      setHistory((prev) => {
        const last = prev[prev.length - 1];

        // Random walk for smoother transitions
        const nextCpu = Math.max(
          5,
          Math.min(95, last.cpu + (Math.random() - 0.5) * 10)
        );
        const nextMem = Math.max(
          20,
          Math.min(80, last.memory + (Math.random() - 0.5) * 5)
        );

        const nextMetric: SystemMetrics = {
          cpu: nextCpu,
          memory: nextMem,
          networkIn: Math.max(0, last.networkIn + (Math.random() - 0.5) * 200),
          networkOut: Math.max(
            0,
            last.networkOut + (Math.random() - 0.5) * 100
          ),
          activeConnections: Math.max(
            1,
            Math.floor(last.activeConnections + (Math.random() - 0.5) * 2)
          ),
          temperature: 45 + (nextCpu / 100) * 30, // Temp correlated with CPU
          latency: 20 + Math.random() * 15,
          timestamp: new Date().toLocaleTimeString(),
        };

        return [...prev.slice(1), nextMetric];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    current: history[history.length - 1] || {
      cpu: 0,
      memory: 0,
      networkIn: 0,
      networkOut: 0,
      activeConnections: 0,
      temperature: 0,
      latency: 0,
    },
    history,
  };
}
