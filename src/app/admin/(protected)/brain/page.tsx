
import { KnowledgeGraph } from "@/components/features/knowledge-graph";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Neural Graph | Portfolio Brain",
};

export default function BrainPage() {
    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-bold tracking-tight">Portfolio Brain</h2>
                    <p className="text-muted-foreground">3D Neural visualization of skills, projects, and experience connectivity.</p>
                </div>
            </div>
            
            <KnowledgeGraph />
        </div>
    )
}
