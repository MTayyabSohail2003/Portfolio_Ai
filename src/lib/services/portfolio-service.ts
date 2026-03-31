import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import Project from "@/lib/db/models/Project";
import Experience from "@/lib/db/models/Experience";
import Skill from "@/lib/db/models/Skill";
import Education from "@/lib/db/models/Education";

export class PortfolioService {
  /**
   * Fetches all published projects, sorted by featured status and date.
   */
  static async getProjects() {
    try {
      await dbConnect();
      const projects = await Project.find({ published: true })
        .sort({ featured: -1, createdAt: -1 })
        .lean();
      // Serialize IDs to string to ensure they are passable to client components if needed
      return JSON.parse(JSON.stringify(projects));
    } catch (error) {
      console.error("PortfolioService.getProjects error:", error);
      return [];
    }
  }

  /**
   * Fetches all experience entries, sorted by start date descending.
   */
  static async getExperience() {
    try {
      await dbConnect();
      const experience = await Experience.find({})
        .sort({ startDate: -1 })
        .lean();
      return JSON.parse(JSON.stringify(experience));
    } catch (error) {
      console.error("PortfolioService.getExperience error:", error);
      return [];
    }
  }

  /**
   * Fetches all skills, sorted by proficiency. Returns grouped categories if needed or raw list.
   * This method returns the raw list. Grouping logic can remain in the UI or be moved here.
   * Moving grouping logic here for consistency with page.tsx logic.
   */
  static async getSkills() {
    try {
      await dbConnect();
      const skills = await Skill.find({})
        .sort({ category: 1, proficiency: -1 })
        .lean();

      const serializedSkills = JSON.parse(JSON.stringify(skills));

      // Group by category to match the UI expectation
      const grouped: Record<string, any[]> = {};
      serializedSkills.forEach((skill: any) => {
        if (!grouped[skill.category]) {
          grouped[skill.category] = [];
        }
        grouped[skill.category].push(skill);
      });

      // Convert to array of objects
      return Object.keys(grouped).map((cat) => ({
        id: cat.toLowerCase().replace(/\s+/g, "-"),
        label: cat,
        skills: grouped[cat],
      }));
    } catch (error) {
      console.error("PortfolioService.getSkills error:", error);
      return [];
    }
  }

  /**
   * Fetches raw skills list (useful for API endpoints that want raw data)
   */
  static async getAllSkillsRaw() {
    try {
      await dbConnect();
      const skills = await Skill.find({})
        .sort({ category: 1, proficiency: -1 })
        .lean();
      return JSON.parse(JSON.stringify(skills));
    } catch (error) {
      console.error("PortfolioService.getAllSkillsRaw error:", error);
      return [];
    }
  }

  /**
   * Fetches education history
   */
  static async getEducation() {
    try {
      await dbConnect();
      const education = await Education.find({}).sort({ startDate: -1 }).lean();
      return JSON.parse(JSON.stringify(education));
    } catch (error) {
      console.error("PortfolioService.getEducation error:", error);
      return [];
    }
  }

  /**
   * Fetches a single project by slug or ID
   */
  static async getProject(slugOrId: string) {
    try {
      await dbConnect();
      const isObjectId = mongoose.Types.ObjectId.isValid(slugOrId);
      let project;

      if (isObjectId) {
        project = await Project.findById(slugOrId).lean();
      }

      if (!project) {
        project = await Project.findOne({ slug: slugOrId }).lean();
      }

      return project ? JSON.parse(JSON.stringify(project)) : null;
    } catch (error) {
      console.error("PortfolioService.getProject error:", error);
      return null;
    }
  }
}
