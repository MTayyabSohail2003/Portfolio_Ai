import ExperienceContainer from "@/components/features/experience-container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Experience | Muhammad Tayyab Sohail",
  description: "Professional career history including Wodwes Solution, Sofrix, and Gamica Cloud.",
};

export default function ExperiencePage() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Professional Trajectory</h1>
        <p className="text-muted-foreground">
          A timeline of my evolution from Industrial Production Control to Advanced AI Engineering.
        </p>
      </div>
      <ExperienceContainer />
    </div>
  );
}
