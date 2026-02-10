"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench } from "lucide-react";
import { SkillsSkeleton } from "./skeletons";

export default function SkillsContainer() {
  const [skillCategories, setSkillCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSkills() {
      try {
        const res = await fetch("/api/skills");
        if (res.ok) {
          const rawSkills = await res.json();
          // Grouping logic on client side to match the raw API response
          const grouped: Record<string, any[]> = {};
          rawSkills.forEach((skill: any) => {
            if (!grouped[skill.category]) {
              grouped[skill.category] = [];
            }
            grouped[skill.category].push(skill);
          });

          const categories = Object.keys(grouped).map((cat) => ({
            id: cat.toLowerCase().replace(/\s+/g, "-"),
            label: cat,
            skills: grouped[cat],
          }));

          // Sort categories explicitly if needed, or rely on API sort
          // Let's ensure "Featured" or "Frontend" comes first if possible, but API sort is alphabetical usually
          setSkillCategories(categories);
        }
      } catch (error) {
        console.error("Failed to fetch skills", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSkills();
  }, []);

  if (loading) {
    return <SkillsSkeleton />;
  }

  if (skillCategories.length === 0) {
    return <div className="text-center py-20 text-muted-foreground">No skills found.</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Tecical Arsenal</h1>
        <p className="text-muted-foreground max-w-2xl">
          A living database of my technical competencies, proficient frameworks, and engineering tools.
        </p>
      </div>

      <Tabs defaultValue={skillCategories[0]?.id} className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full justify-start h-auto flex-wrap gap-2 bg-transparent p-0">
            {skillCategories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-card hover:bg-muted/50 transition-all rounded-full px-6 py-2"
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {skillCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-8 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {category.skills.map((skill: any) => (
                <Card key={skill._id} className="hover:border-primary/50 transition-colors group">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg flex justify-between items-start gap-2">
                      <span>{skill.name}</span>
                      {skill.featured && <Wrench className="h-4 w-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex flex-col gap-2">
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500 ease-out"
                          style={{ width: `${skill.proficiency}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground text-right">{skill.proficiency}% Proficiency</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
