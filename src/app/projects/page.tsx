import ProjectsContainer from "@/components/features/projects-container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | Muhammad Tayyab Sohail",
  description: "Key projects demonstrating Full Stack SaaS, AI Automation, and Industrial ETL capabilities.",
};

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Case Studies</h1>
        <p className="text-muted-foreground max-w-2xl">
          Deep dives into complex systems I've architected. From SaaS platforms handling sensitive user data to autonomous AI agents.
        </p>
      </div>
      <ProjectsContainer />
    </div>
  );
}
