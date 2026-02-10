
import { KnowledgeGraph } from "@/components/features/knowledge-graph";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Neural Graph | Portfolio Brain",
    description: "Interactive 3D visualization of skills, projects, and experience.",
};

export default function BrainPage() {
    return (
        <div className="h-full w-full p-4 md:p-6 lg:p-8 space-y-6">
             <div className="flex flex-col gap-2">
                 <h1 className="text-3xl font-bold tracking-tight">Neural Graph</h1>
                 <p className="text-muted-foreground">
                     Explore the semantic connections between my skills, projects, and professional history.
                 </p>
             </div>
            
            <KnowledgeGraph />
        </div>
    )
}
