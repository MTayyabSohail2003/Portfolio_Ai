import SkillsContainer from "@/components/features/skills-container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skills Arsenal | Muhammad Tayyab Sohail",
  description: "Comprehensive technical skills including React, Next.js, Python, and AI Engineering.",
};

export default function SkillsPage() {
  return <SkillsContainer />;
}
