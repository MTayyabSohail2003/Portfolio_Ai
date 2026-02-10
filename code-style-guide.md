---
trigger: always_on
glob:
description:
---
📌 LLM Instruction Set 
1. Project Context & Source of Truth

1.1. Build a personal portfolio website.
1.2. All personal data, content, and metadata about the owner are provided in @portfolio.md.
1.3. Treat @portfolio.md as the single source of truth for content unless explicitly overridden by admin actions.

2. Tech Stack & Installation Strategy

2.1. Use React + Next.js (App Router) with the latest stable versions of all libraries.
2.2. Use shadcn/ui as the primary UI component system.
2.3. Install dependencies using CLI commands, but do not wait for installations to complete before continuing implementation.
2.4. Use only actively maintained, production-ready libraries.

3. Project Structure & Engineering Standards

3.1. Follow industry-standard folder and file structures for scalable frontend applications.
3.2. Ensure:

Clear separation of app, components, lib, hooks, services, styles, and utils.

Route-based modularization aligned with Next.js best practices.

3.3. All components must be:

Functional components

Highly reusable

Fully modular

Clearly typed (TypeScript required)

4. Theming & Design System

4.1. Implement Light, Dark, and System-preferred themes.
4.2. Define global design tokens for consistent theming:

White

Gray

Orange

Black

Dark variants with orange accents

4.3. Centralize color, spacing, typography, and animation tokens.

5. UI / UX & Visual Design

5.1. The UI must be:

Modern

Minimal

Highly polished

Responsive across all screen sizes

5.2. Use Framer Motion for animations with restraint:

Enhance clarity and delight

Avoid excessive or distracting animations

5.3. Implement:

Page transition animations

Scroll-based effects

Floating “Scroll to Top” button

Subtle micro-interactions

6. Pages & Navigation

6.1. Build the site as a multi-page application.
6.2. Include all necessary and complementary creative pages such as:

Home

About

Projects

Skills

Experience

Blog

Contact

AI Assistant / Chat

6.3. Page transitions must be animated and smooth.

7. Skills Demonstration & Feature Depth

7.1. The portfolio must demonstrate technical skills interactively, not just textually.
7.2. Use creative, supported, and unique libraries to showcase:

Reactivity

Animations

Data flow

UI sophistication

7.3. Favor quality and cohesion, even when adding many features.

8. Authentication & Authorization

8.1. All public pages remain accessible without authentication.
8.2. Implement secure authentication and authorization for admins only.
8.3. Admin access enables:

Content updates

Blog publishing

Dataset updates

RAG configuration changes

9. Admin Panel

9.1. Build a full Admin Dashboard.
9.2. Admins must be able to:

Manage portfolio content

Publish/edit blogs

Modify database entries

Control RAG datasets

Trigger vector database updates

9.3. The admin panel must follow the same design and UX standards as the public site.

10. AI Agent & RAG System

10.1. Integrate OpenAI Agent SDK to power an agentic RAG system.
10.2. The agent must:

Use tools

Perform retrieval-augmented generation

Answer user questions contextually based on portfolio data

10.3. Use Pinecone (Free Tier) as the vector database.
10.4. On every admin update to RAG-related data:

Automatically re-embed

Update Pinecone vectors

11. AI Models & APIs

11.1. Use Gemini API for testing and learning purposes.
11.2. Abstract model providers so they can be swapped without refactoring core logic.

12. AI Chat Interface

12.1. Build an industry-grade chat UI for the AI agent.
12.2. The chat must be:

Fully integrated into the site’s UI/UX

Visually impressive

Intuitive and responsive

12.3. The chat experience should encourage exploration and admiration.

13. Database & Persistence

13.1. Use MongoDB as the primary database.
13.2. Store:

Admin data

Blogs

Portfolio content

RAG source metadata

Configuration states
14. Performance Optimization

14.1. Implement lazy loading for heavy and non-critical components.
14.2. Use dynamic imports for:

Large visual components

Admin dashboard modules

AI chat interface

Animation-heavy sections

14.3. Ensure lazy loading does not negatively impact UX by:

Using skeleton loaders

Providing smooth loading transitions

15. SEO & Metadata Strategy

15.1. Implement a comprehensive SEO strategy across all public pages.
15.2. Define global and per-page metadata, including:

Title templates

Meta descriptions

Keywords

Canonical URLs

15.3. Add support for:

Open Graph metadata

Twitter/X cards

Dynamic metadata for blogs and projects

15.4. Use structured data (JSON-LD) where appropriate to improve discoverability.

16. Role-Based Access Control (RBAC)

16.1. Implement Role-Based Access Control (RBAC) for all protected features.
16.2. Define clear roles, at minimum:

Super Admin

Admin

Editor (optional)

16.3. Enforce RBAC at:

API routes

Server actions

Admin UI level

16.4. Ensure unauthorized users cannot access or infer restricted functionality.

17. Rate Limiting & Abuse Protection

17.1. Implement polite rate limiting for AI chat endpoints.
17.2. Rate limiting must:

Prevent abuse and excessive requests

Gracefully inform users when limits are reached

Avoid abrupt or hostile error messaging

17.3. Use:

IP-based limits for anonymous users

User-based limits for authenticated users

17.4. Provide user-friendly feedback such as:

Cooldown timers

Soft warnings before limits are enforced
