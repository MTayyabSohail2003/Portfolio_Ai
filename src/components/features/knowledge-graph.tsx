
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Share2, Info, Loader2 } from "lucide-react";
import { getGraphData } from "@/app/actions/graph-actions";
import { Badge } from "@/components/ui/badge";

// Dynamic import to avoid SSR issues
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-cyan-400 animate-pulse font-mono tracking-widest">INITIALIZING NEURAL LINK...</div>
});

export function KnowledgeGraph() {
  const fgRef = useRef<any>(null);
  const [data, setData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
        setLoading(true);
        const graphData = await getGraphData();
        setData(graphData as any);
        setLoading(false);
    }
    loadData();
  }, []);

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
    const distance = 60;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

    if (fgRef.current) {
        fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, 
        node, 
        2000 
        );
    }
  }, []);

  const handleResetCamera = useCallback(() => {
      if (fgRef.current) {
          fgRef.current.cameraPosition({ x: 0, y: 0, z: 300 }, { x: 0, y: 0, z: 0 }, 1000);
      }
      setSelectedNode(null);
  }, []);

  const getNodeColor = (node: any) => {
      switch(node.group) {
          case 'skill': return "#06b6d4"; // Cyan-500
          case 'project': return "#d946ef"; // Fuchsia-500
          case 'experience': return "#eab308"; // Yellow-500
          default: return "#ffffff";
      }
  };

  return (
    <div className="relative w-full h-[calc(100vh-8rem)] rounded-xl overflow-hidden border border-cyan-900/50 shadow-2xl bg-black">
       {/* Cyberpunk Overlay */}
       <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_#000000_100%)]" />
       
       <div className="absolute top-6 left-6 z-10 space-y-1 pointer-events-none">
           <h2 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-fuchsia-400 to-yellow-400 uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
               Neural Graph v2.0
           </h2>
           <p className="text-xs font-mono text-cyan-700/80 uppercase tracking-[0.2em]">
               System Status: {loading ? "SYNCING..." : "ONLINE"}
           </p>
       </div>

       <div className="absolute bottom-6 left-6 z-10 hidden md:block">
            <div className="flex flex-col gap-2 p-3 rounded-lg border border-cyan-900/30 bg-black/60 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]"></span>
                    <span className="text-xs text-cyan-200 font-mono">SKILLS</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-fuchsia-500 shadow-[0_0_8px_#d946ef]"></span>
                    <span className="text-xs text-fuchsia-200 font-mono">PROJECTS</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_#eab308]"></span>
                    <span className="text-xs text-yellow-200 font-mono">CAREER</span>
                </div>
            </div>
       </div>

       <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
           <Button variant="outline" size="icon" onClick={handleResetCamera} className="border-cyan-800 bg-black/50 hover:bg-cyan-950/50 hover:text-cyan-400">
               <RotateCcw className="h-4 w-4" />
           </Button>
       </div>

       {selectedNode && (
           <Card className="absolute top-20 right-6 z-20 w-72 p-0 bg-black/80 backdrop-blur-xl border-cyan-500/30 overflow-hidden animate-in slide-in-from-right-10 fade-in duration-300">
               <div className={`h-1 w-full ${selectedNode.group === 'skill' ? 'bg-cyan-500' : selectedNode.group === 'project' ? 'bg-fuchsia-500' : 'bg-yellow-500'} shadow-[0_0_15px_currentColor]`} />
               <div className="p-5 space-y-3">
                   <div>
                       <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{selectedNode.group}</span>
                       <h3 className="font-bold text-xl text-white leading-tight mt-1">{selectedNode.id}</h3>
                   </div>
                   
                   {selectedNode.desc && (
                        <p className="text-sm text-gray-400 border-l-2 border-white/10 pl-3">
                            {selectedNode.desc}
                        </p>
                   )}

                   <div className="pt-2">
                        <Button size="sm" className="w-full bg-white/10 hover:bg-white/20 text-white border-0" onClick={() => setSelectedNode(null)}>
                           Close Uplink
                        </Button>
                   </div>
               </div>
           </Card>
       )}
        
       {!loading && (
        <ForceGraph3D
            ref={fgRef}
            graphData={data}
            nodeLabel="id"
            nodeColor={getNodeColor}
            nodeResolution={24}
            nodeVal="val"
            // Visuals
            showNavInfo={false}
            backgroundColor="#000000"
            linkWidth={1}
            linkColor={() => "#475569"} // Slate-600
            linkOpacity={0.3}
            linkDirectionalParticles={4}
            linkDirectionalParticleSpeed={0.005}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleColor={() => "#ffffff"}
            // Glow effect simulated by particle trails
            
            enableNodeDrag={false}
            onNodeClick={handleNodeClick}
            
            // Auto-rotation
            onEngineStop={() => {
                if (fgRef.current) {
                   fgRef.current.d3Force('charge').strength(-120);
                }
            }}
        />
       )}
    </div>
  );
}
