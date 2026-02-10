
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSystemMetrics } from "@/lib/hooks/use-system-metrics";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Activity, Cpu, HardDrive, Wifi, Thermometer, Zap, Globe, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function SystemMonitor() {
  const { current, history } = useSystemMetrics();
  const [logs, setLogs] = useState<string[]>([]);

  // Generate logs
  useEffect(() => {
    const actions = [
      "Optimizing database indexes...",
      "Garbage collection triggered",
      "New connection from 192.168.1.X",
      "Cache invalidated: /api/projects",
      "Syncing with Vector Store...",
      "Next.js build worker warm",
      "Auth token verified",
      "Rate limiter: 300/1000 requests"
    ];
    
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const action = actions[Math.floor(Math.random() * actions.length)];
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [`[${time}] ${action}`, ...prev.slice(0, 50)]);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 min-h-[calc(100vh-4rem)] text-xs md:text-sm font-mono text-green-500/80 bg-black/95 rounded-xl border border-green-900/50 shadow-2xl overflow-hidden relative">
      <div className="absolute inset-0 bg-size-[100%_2px,3px_100%] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,100,0,0.15)_0%,rgba(0,0,0,0.8)_100%)] z-0 pointer-events-none" />

      {/* Main Stats Row */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-1 bg-black/40 border-green-900/30 backdrop-blur-sm z-10">
        <CardHeader className="pb-2">
            <CardTitle className="text-green-500 flex items-center gap-2 text-sm uppercase tracking-widest">
                <Cpu className="h-4 w-4" /> CPU Load
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-4xl font-bold text-green-400 mb-2">{current?.cpu?.toFixed(1)}%</div>
            <Progress value={current?.cpu} className="h-2 bg-green-900/20" indicatorColor="bg-green-500" />
            <div className="h-[100px] mt-4 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                        <defs>
                            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="cpu" stroke="#22c55e" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} isAnimationActive={false} />
                    </AreaChart>
                 </ResponsiveContainer>
            </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2 lg:col-span-1 bg-black/40 border-green-900/30 backdrop-blur-sm z-10">
        <CardHeader className="pb-2">
            <CardTitle className="text-green-500 flex items-center gap-2 text-sm uppercase tracking-widest">
                <HardDrive className="h-4 w-4" /> Memory
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-4xl font-bold text-green-400 mb-2">{current?.memory?.toFixed(1)}%</div>
            <Progress value={current?.memory} className="h-2 bg-green-900/20" indicatorColor="bg-green-500" />
            <div className="h-[100px] mt-4 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                        <Line type="step" dataKey="memory" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                 </ResponsiveContainer>
            </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-black/40 border-green-900/30 backdrop-blur-sm z-10 flex flex-col">
          <CardHeader className="pb-2 border-b border-green-900/30">
             <CardTitle className="text-green-500 flex items-center gap-2 text-sm uppercase tracking-widest justify-between">
                <span className="flex items-center gap-2"><Activity className="h-4 w-4" /> Live Network Traffic</span>
                <span className="text-xs text-green-700 animate-pulse">● LIVE</span>
             </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 relative min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                         <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#14532d" opacity={0.3} vertical={false}/>
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #14532d' }}
                        itemStyle={{ color: '#22c55e' }}
                        formatter={(value: any) => [`${Number(value).toFixed(0)} KB/s`, '']}
                    />
                    <Area type="monotone" dataKey="networkIn" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIn)" strokeWidth={2} isAnimationActive={false} />
                    <Area type="monotone" dataKey="networkOut" stroke="#f59e0b" fillOpacity={1} fill="url(#colorOut)" strokeWidth={2} isAnimationActive={false} />
                </AreaChart>
            </ResponsiveContainer>
             <div className="absolute top-4 right-4 flex gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-xs text-blue-500">Inbound: {current?.networkIn?.toFixed(0)} KB/s</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full" />
                    <span className="text-xs text-amber-500">Outbound: {current?.networkOut?.toFixed(0)} KB/s</span>
                 </div>
             </div>
          </CardContent>
      </Card>

      {/* Side Stats */}
      <div className="col-span-1 space-y-4 z-10">
          <Card className="bg-black/40 border-green-900/30">
              <CardContent className="p-4 flex items-center justify-between">
                 <div>
                    <div className="text-xs text-green-700 uppercase">Active Users</div>
                    <div className="text-2xl font-bold text-green-500">{current?.activeConnections}</div>
                 </div>
                 <Users className="h-6 w-6 text-green-700" />
              </CardContent>
          </Card>
           <Card className="bg-black/40 border-green-900/30">
              <CardContent className="p-4 flex items-center justify-between">
                 <div>
                    <div className="text-xs text-green-700 uppercase">Core Temp</div>
                    <div className="text-2xl font-bold text-amber-500">{current?.temperature?.toFixed(1)}°C</div>
                 </div>
                 <Thermometer className="h-6 w-6 text-amber-700" />
              </CardContent>
          </Card>
           <Card className="bg-black/40 border-green-900/30">
              <CardContent className="p-4 flex items-center justify-between">
                 <div>
                    <div className="text-xs text-green-700 uppercase">Latency</div>
                    <div className="text-2xl font-bold text-green-500">{current?.latency?.toFixed(0)}ms</div>
                 </div>
                 <Zap className="h-6 w-6 text-green-700" />
              </CardContent>
          </Card>
      </div>

      {/* Terminal Logs */}
       <Card className="col-span-1 md:col-span-4 lg:col-span-1 bg-black/40 border-green-900/30 backdrop-blur-sm z-10 flex flex-col h-[250px]">
        <CardHeader className="pb-2 border-b border-green-900/30 min-h-[50px]">
            <CardTitle className="text-green-500 flex items-center gap-2 text-sm uppercase tracking-widest">
                <Globe className="h-4 w-4" /> System Logs
            </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-2 overflow-hidden font-mono text-xs">
            <ScrollArea className="h-full pr-2">
                <div className="space-y-1">
                    {logs.map((log, i) => (
                        <div key={i} className={cn("border-l-2 border-green-900 pl-2 py-0.5", i === 0 ? "text-green-400 opacity-100" : "text-green-700/80 opacity-60")}>
                            {log}
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </CardContent>
      </Card>

    </div>
  );
}
