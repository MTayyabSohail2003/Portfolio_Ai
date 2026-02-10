"use server";

import dbConnect from "@/lib/db/connect";
import Skill from "@/lib/db/models/Skill";
import Project from "@/lib/db/models/Project";
import Experience from "@/lib/db/models/Experience";

export async function getGraphData() {
  await dbConnect();

  try {
    const [skills, projects, experiences] = await Promise.all([
      Skill.find({}).lean(),
      Project.find({ published: true }).select("title tags").lean(),
      Experience.find({}).select("company position").lean(),
    ]);

    const nodes: any[] = [];
    const links: any[] = [];
    const skillSet = new Set(skills.map((s: any) => s.name));

    // 1. Add Skill Nodes
    skills.forEach((s: any) => {
      nodes.push({
        id: s.name,
        group: "skill",
        val: 10 + (s.proficiency || 50) / 10, // Size based on proficiency
        desc: s.category || "Tech",
      });
    });

    // 2. Add Project Nodes & Links to Skills
    projects.forEach((p: any) => {
      nodes.push({
        id: p.title,
        group: "project",
        val: 20,
        desc: "Project",
      });

      // Link to tags (skills)
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach((tag: string) => {
          // Case insensitive match
          const matchedSkill = Array.from(skillSet).find(
            (s) => s.toLowerCase() === tag.toLowerCase()
          );
          if (matchedSkill) {
            links.push({ source: p.title, target: matchedSkill });
          } else {
            // Determine if we want to add "orphan" tags as implicit skills?
            // For now, let's only link to defined skills to keep graph clean
          }
        });
      }
    });

    // 3. Add Experience Nodes
    experiences.forEach((e: any) => {
      const nodeId = e.company;
      if (!nodes.find((n) => n.id === nodeId)) {
        nodes.push({
          id: nodeId,
          group: "experience",
          val: 30,
          desc: e.position,
        });
      }
    });

    // (Optional) Link Experience to Skills?
    // Usually experience entries have a 'technologies' field too, if we added it?
    // Let's check Experience model later. For now, nodes are good.

    return { nodes, links };
  } catch (e) {
    console.error("Graph Data Error", e);
    return { nodes: [], links: [] };
  }
}
