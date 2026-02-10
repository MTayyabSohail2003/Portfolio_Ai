import {
  Code2,
  Cpu,
  Home,
  Layers,
  LayoutDashboard,
  Mail,
  User,
  Zap,
  Network,
} from "lucide-react";

export const navItems = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "About Me",
    href: "/about",
    icon: User,
  },
  {
    title: "Experience",
    href: "/experience",
    icon: Layers,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: Code2,
  },
  {
    title: "Skills Arsenal",
    href: "/skills",
    icon: Zap,
  },
  {
    title: "Blog",
    href: "/blog",
    icon: LayoutDashboard,
  },
  {
    title: "Contact",
    href: "/contact",
    icon: Mail,
  },
  {
    title: "Neural Brain",
    href: "/brain",
    icon: Network,
  },
  {
    title: "AI Chat",
    href: "/chat",
    icon: Cpu,
  },
];
