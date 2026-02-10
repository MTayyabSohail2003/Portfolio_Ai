"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Building2, MapPin, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { ExperienceSkeleton } from "./skeletons";

export default function ExperienceContainer() {
  const [experience, setExperience] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExperience() {
      try {
        const res = await fetch("/api/experience");
        if (res.ok) {
          const data = await res.json();
          setExperience(data);
        }
      } catch (error) {
        console.error("Failed to fetch experience", error);
      } finally {
        setLoading(false);
      }
    }
    fetchExperience();
  }, []);

  if (loading) {
    return <ExperienceSkeleton />;
  }

  if (experience.length === 0) {
      return <div className="text-center py-20 text-muted-foreground">No experience entries found.</div>
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {experience.map((exp) => (
        <Card key={exp._id} className="border border-border border-l-4 border-l-primary relative overflow-hidden transition-all hover:bg-muted/50">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  {exp.position}
                </CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                  <Building2 className="h-4 w-4" />
                  {exp.company}
                </div>
              </div>
              <div className="flex flex-col gap-1 items-start md:items-end text-sm text-muted-foreground">
                 <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1 rounded-full">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {format(new Date(exp.startDate), "MMM yyyy")} -{" "}
                      {exp.current ? "Present" : exp.endDate ? format(new Date(exp.endDate), "MMM yyyy") : ""}
                    </span>
                 </div>
                 {exp.location && (
                    <div className="flex items-center gap-1.5 px-3">
                        <MapPin className="h-3.5 w-3.5" />
                        {exp.location}
                    </div>
                 )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html:  
                  exp.description
                    .replace(/\n-/g, "<br/>•")  // Simple markdown-ish list formatting
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") 
              }} />
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {exp.technologies.map((tech: string) => (
                <Badge key={tech} variant="secondary" className="bg-primary/10 hover:bg-primary/20 text-primary-foreground/90 dark:text-primary">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
