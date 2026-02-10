import AboutClient from "@/components/features/about-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Me | Muhammad Tayyab Sohail",
  description: "The Hybrid Engineer: Bridging Industrial Precision & Artificial Intelligence.",
};

export const revalidate = 60;

export default function AboutPage() {
  return <AboutClient />;
}
