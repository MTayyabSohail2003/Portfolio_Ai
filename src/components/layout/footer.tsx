"use client";

import Link from "next/link";
import { Github, Linkedin, Mail, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        toast.success("Subscribed successfully!");
        setEmail("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to subscribe");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="border-t bg-muted/20">
      <div className="container px-4 md:px-8 py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Brand & Socials */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Muhammad Tayyab</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Hybrid AI Engineer & Full Stack Developer. Building intelligent agents and scalable systems.
            </p>
            <div className="flex gap-4">
              <Link href="https://github.com/MTayyabSohail2003" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="https://linkedin.com/in/tayyab-sohail-dev" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="mailto:mtayyabsohail8@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:col-span-1">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Portfolio</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/projects" className="hover:text-foreground transition-colors">Projects</Link></li>
                <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/experience" className="hover:text-foreground transition-colors">Experience</Link></li>
                <li><Link href="/skills" className="hover:text-foreground transition-colors">Skills</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link href="/chat" className="hover:text-foreground transition-colors">AI Agent</Link></li>
                <li><Link href="/admin" className="hover:text-foreground transition-colors">Admin</Link></li>
              </ul>
            </div>
          </div>

          {/* Newsletter / CTA */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to get the latest updates on my projects and AI research.
            </p>
            <form className="flex gap-2" onSubmit={handleSubscribe}>
              <Input
                placeholder="Enter your email"
                type="email"
                className="max-w-[220px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button size="icon" type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                <span className="sr-only">Subscribe</span>
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Muhammad Tayyab. All rights reserved.</p>
          <div className="flex gap-4">
            {/* Add Terms/Privacy links here later if needed */}
          </div>
        </div>
      </div>
    </footer>
  );
}
