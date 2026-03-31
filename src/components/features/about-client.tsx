"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Factory, Brain, Code, Server, HeartHandshake, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AboutClient() {
    const [techStack, setTechStack] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSkills() {
            try {
                const res = await fetch("/api/skills");
                if (res.ok) {
                    const skills = await res.json();
                    setTechStack(skills.map((s: any) => s.name));
                } else {
                    setTechStack([
                        "React.js", "Next.js", "Node.js", "Express.js", "MongoDB", "TypeScript",
                        "Tailwind CSS", "ShadCN UI", "Redux", "Redux Toolkit", "Context API",
                        "GraphQL", "REST API", "JWT", "WebSockets", "Socket.io",
                        "Gemini API", "RAG Systems", "Agentic AI", "Pinecone", "Clerk", "Convex",
                        "Vue.js", "Nuxt.js", "Git", "Vercel", "Docker", "Postman"
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch skills", error);
                setTechStack([
                    "React.js", "Next.js", "Node.js", "Express.js", "MongoDB", "TypeScript",
                    "Tailwind CSS", "ShadCN UI", "Redux", "Redux Toolkit", "Context API",
                    "GraphQL", "REST API", "JWT", "WebSockets", "Socket.io",
                    "Gemini API", "RAG Systems", "Agentic AI", "Pinecone", "Clerk", "Convex",
                    "Vue.js", "Nuxt.js", "Git", "Vercel", "Docker", "Postman"
                ]);
            } finally {
                setLoading(false);
            }
        }
        fetchSkills();
    }, [])

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">About Me</h1>
                <p className="text-xl text-muted-foreground">MERN Stack Developer | AI Engineering Enthusiast | Building Scalable Solutions</p>
            </div>

            {/* Narrative Section */}
            <section className="grid gap-8 lg:grid-cols-2">
                <div className="flex flex-col gap-6 text-lg text-muted-foreground leading-relaxed">
                    <p>
                        I am <strong className="text-primary">Muhammad Tayyab</strong>, a passionate Full Stack Developer specializing in the{" "}
                        <span className="text-foreground font-medium">MERN ecosystem</span> (MongoDB, Express.js, React.js, Node.js). With over{" "}
                        <span className="text-foreground font-medium">3+ years of hands-on experience</span>, I build full-stack applications that are fast, user-friendly, and scalable.
                    </p>
                    <p>
                        Currently at <strong>WODWES LLC</strong>, I craft responsive UIs with React.js and Tailwind CSS,
                        build secure RESTful and GraphQL APIs with Node.js and Express, optimize application performance, and explore the cutting edge of{" "}
                        <span className="text-foreground font-medium">Agentic AI</span> and{" "}
                        <span className="text-foreground font-medium">RAG systems</span>.
                    </p>
                    <div className="flex flex-col gap-2 p-4 border rounded-xl bg-card">
                        <h3 className="font-semibold text-foreground flex items-center gap-2"><HeartHandshake className="w-5 h-5 text-primary" /> Core Value Proposition</h3>
                        <p className="text-sm">
                            I build user-centric applications with a strong focus on <strong>performance optimization</strong>, <strong>modern development practices</strong>,
                            and <strong>continuous learning</strong>. From deploying production-ready MERN apps to integrating AI agents with Pinecone and Gemini API,
                            I deliver solutions that directly impact business growth and user satisfaction.
                        </p>
                    </div>
                </div>

                {/* Philosophy Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                        <CardContent className="pt-6 flex flex-col gap-3">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                            <h3 className="font-bold">Production-Grade Standard</h3>
                            <p className="text-sm text-muted-foreground">
                                I don't just write code that works on my machine. I write code that survives the internet. Handling edge cases and ensuring graceful recovery is my baseline.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 flex flex-col gap-3">
                            <Server className="w-8 h-8 text-primary" />
                            <h3 className="font-bold">Cloud Economics</h3>
                            <p className="text-sm text-muted-foreground">
                                A good architect saves money. I aggressively utilize free tiers and serverless architectures to maximize value before incurring costs.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 flex flex-col gap-3">
                            <Code className="w-8 h-8 text-primary" />
                            <h3 className="font-bold">Type Safety</h3>
                            <p className="text-sm text-muted-foreground">
                                Code is a contract. I use TypeScript in strict mode and Zod for runtime validation to ensure data integrity from database to client.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 flex flex-col gap-3">
                            <Brain className="w-8 h-8 text-primary" />
                            <h3 className="font-bold">Agentic AI</h3>
                            <p className="text-sm text-muted-foreground">
                                Moving beyond simple chatbots. I build autonomous agents that can use tools, reason, and execute complex workflows.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>


        </div>
    );
}
