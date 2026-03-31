"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, Code2, Database, Terminal, Cpu } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { KnowledgeGraph } from "@/components/features/knowledge-graph";

export default function HomeClient() {
  const [featuredSkills, setFeaturedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSkills() {
      try {
        const res = await fetch("/api/skills");
        if (res.ok) {
          const allSkills = await res.json();
          const featured = allSkills
            .filter((s: any) => s.featured)
            .slice(0, 6)
            .map((s: any) => s.name);

          if (featured.length > 0) {
            setFeaturedSkills(featured);
          } else {
            setFeaturedSkills(["Agentic AI", "Next.js", "TypeScript"]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch skills", error);
        setFeaturedSkills(["Agentic AI", "Next.js", "TypeScript"]);
      } finally {
        setLoading(false);
      }
    }
    fetchSkills();
  }, []);

  return (
    <div className="flex flex-col gap-12 md:gap-20">
      {/* Hero Section with Enhanced Design */}
      <section className="relative flex flex-col gap-8 pt-20 md:pt-12 lg:flex-row lg:items-center lg:justify-between pr-4 md:pr-12">
        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-orange-500/5 rounded-3xl blur-3xl" />

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className="flex flex-col gap-6 lg:max-w-2xl"
        >
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 text-primary w-fit px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
          >
            <Terminal size={18} />
            <span className="font-mono text-xs font-semibold tracking-wider">
              SYSTEM.INIT(STATUS.ACTIVE)
            </span>
          </motion.div>

          {/* Main Heading */}
          <div className="space-y-3">
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Muhammad Tayyab Sohail
              </span>
            </h1>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="bg-gradient-to-r from-primary via-orange-500 to-primary bg-clip-text text-transparent animate-gradient">
                Agentic AI Engineer
              </span>
            </h2>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Building scalable full-stack applications with <span className="font-bold text-foreground bg-primary/10 px-2 py-0.5 rounded">React, Node.js, and MongoDB</span>.
            Exploring the cutting edge of <span className="font-bold text-foreground bg-primary/10 px-2 py-0.5 rounded">Agentic AI</span> and <span className="font-bold text-foreground bg-primary/10 px-2 py-0.5 rounded">RAG systems</span> to create intelligent, production-ready solutions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mt-4">
            <Button asChild size="lg" className="rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
              <Link href="/projects" className="gap-2">
                <span>View Projects</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full border-2 hover:bg-primary/5">
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </motion.div>

        {/* Enhanced Profile Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, delay: 0.2, type: "spring", stiffness: 80 }}
          className="relative mt-12 lg:mt-0 lg:ml-12 flex justify-center lg:justify-end"
        >
          <div className="relative w-72 h-72 md:w-80 md:h-80 lg:w-[24rem] lg:h-[24rem]">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary via-orange-500 to-primary rounded-full blur-3xl opacity-25 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-20 animate-spin-slow" />

            {/* Profile Image Container */}
            <div className="relative w-full h-full">
              <div className="absolute inset-6 bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-full" />
              <div className="absolute inset-8 bg-background rounded-full border-4 border-primary/30 overflow-hidden shadow-2xl ring-4 ring-primary/10">
                <img
                  src="/images/profile-pic.png"
                  alt="Muhammad Tayyab"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://github.com/shadcn.png"
                  }}
                />
              </div>
            </div>

            {/* Floating Tech Icons - Adjusted positions */}
            <motion.div
              animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-2 top-12 bg-gradient-to-br from-blue-500/90 to-blue-600/90 backdrop-blur-xl p-3 rounded-2xl border border-blue-400/50 shadow-xl"
            >
              <Code2 className="w-6 h-6 text-white" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute left-2 bottom-16 bg-gradient-to-br from-orange-500/90 to-red-500/90 backdrop-blur-xl p-3 rounded-2xl border border-orange-400/50 shadow-xl"
            >
              <Cpu className="w-6 h-6 text-white" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -12, 0], x: [0, 5, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute right-2 bottom-12 bg-gradient-to-br from-purple-500/90 to-pink-500/90 backdrop-blur-xl p-3 rounded-2xl border border-purple-400/50 shadow-xl"
            >
              <Database className="w-6 h-6 text-white" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Enhanced Capabilities Grid */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary/5 to-transparent rounded-3xl" />

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "Frontend Engineering", icon: Code2, desc: "Building responsive UIs with React.js, Next.js, and Tailwind CSS. Expert in Redux, Context API, and modern state management.", color: "from-blue-500 to-cyan-500" },
            { title: "Backend Systems", icon: Database, desc: "Scalable Node.js & Express.js architectures. REST and GraphQL APIs with MongoDB, JWT authentication, and real-time features.", color: "from-green-500 to-emerald-500" },
            { title: "AI Integration", icon: Cpu, desc: "Integrating Agentic AI with OpenAI Agent SDK. RAG systems using Pinecone and Gemini API for intelligent applications.", color: "from-orange-500 to-red-500" }
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + (i * 0.15), type: "spring", stiffness: 100 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Card className="relative h-full overflow-hidden border-2 hover:border-primary/50 transition-all group hover:shadow-xl">
                {/* Gradient Accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color}`} />

                <CardHeader className="space-y-3">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} p-0.5 group-hover:scale-110 transition-transform`}>
                    <div className="w-full h-full bg-background rounded-2xl flex items-center justify-center">
                      <item.icon className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Neural Graph Section */}
      <section className="w-full">
        <KnowledgeGraph />
      </section>
    </div>
  );
}
