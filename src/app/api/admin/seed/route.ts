import { NextResponse } from "next/server";
import User from "@/lib/db/models/User";
import Experience from "@/lib/db/models/Experience";
import Project from "@/lib/db/models/Project";
import Education from "@/lib/db/models/Education";
import Skill from "@/lib/db/models/Skill";
import Blog from "@/lib/db/models/Blog";
import dbConnect from "@/lib/db/connect";

export async function POST(req: Request) {
  try {
    // 1. Security Check: Only allow if ENABLE_SEED_ENDPOINT is true
    if (process.env.ENABLE_SEED_ENDPOINT !== "true") {
      return NextResponse.json({ error: "Endpoint disabled" }, { status: 403 });
    }

    await dbConnect();

    // 2. Seed User (Admin) - Upsert
    const adminEmail = process.env.ADMIN_EMAIL || "mtayyabsohail8@gmail.com";
    await User.updateOne(
      { email: adminEmail },
      {
        $set: {
          name: "Muhammad Tayyab Sohail",
          email: adminEmail,
          role: "admin",
          image: "https://github.com/mubeenamjad.png",
          emailVerified: true,
        },
      },
      { upsert: true },
    );

    // 3. Seed Experience - Upsert by Position + Company
    const experiences = [
      {
        position: "Full Stack Engineer & AI Architect",
        company: "Wodwes Solution LLC",
        location: "Faisalabad, Pakistan",
        startDate: new Date("2025-06-01"),
        current: true,
        description: `
**Role Overview**:
Developed and maintained robust, scalable web applications using MongoDB, Express.js, React.js, and Node.js.
Acting as the technical bridge between client requirements and modern AI capabilities.

**Key Achievements**:
- **Multi-Tenant SaaS Architecture**: Led development of a flagship SaaS Job Portal with tenant isolation using middleware-scoped queries.
- **Agentic AI R&D**: Spearheaded "Agentic AI" initiatives; built internal tools where autonomous agents monitor Jira/Trello.
- **Payment Infrastructure**: Integrated Stripe Connect with complex webhooks for subscription lifecycles.
- **Frontend Optimization**: Reduced dashboard load time by 40% using Next.js Route Groups and Lazy Loading.
        `.trim(),
        technologies: [
          "Next.js",
          "Stripe",
          "AI Agents",
          "SaaS",
          "MongoDB",
          "Express.js",
          "Node.js",
        ],
      },
      {
        position: "MERN Stack Developer",
        company: "Sofrix Solution",
        location: "Faisalabad, Pakistan",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-06-01"),
        current: false,
        description: `
**Role Overview**:
Focused on mastering the React ecosystem and component modularity in a high-paced agency environment.

**Key Achievements**:
- **Component Library**: Created a proprietary set of reusable React components (Buttons, Modals, Data Tables).
- **Robust API Integration**: Implemented Axios Interceptors for seamless JWT refreshing.
- **State Management**: Refactored legacy Redux codebases to React Context + TanStack Query.
        `.trim(),
        technologies: [
          "React",
          "Redux",
          "TanStack Query",
          "Axios",
          "Material UI",
        ],
      },
      {
        position: "Developer (Intern)",
        company: "Gamica Cloud (GIAIC)",
        location: "Faisalabad, Pakistan",
        startDate: new Date("2023-08-01"),
        endDate: new Date("2025-01-01"),
        current: false,
        description: `
**Role Overview**:
Formative period transitioning from student to professional. Moved from learning syntax to shipping deployable applications.
Gained deep understanding of DNS, HTTP handshakes, and database responses.
        `.trim(),
        technologies: ["JavaScript", "HTML/CSS", "React Native", "Git"],
      },
      {
        position: "Production Controller",
        company: "Textile / Dyeing & Finishing Industry",
        location: "Faisalabad, Pakistan",
        startDate: new Date("2021-01-01"),
        endDate: new Date("2023-01-01"),
        current: false,
        description: `
**The Translation of Skills**:
Managed the high-pressure environment of textile production, forming the bedrock of my engineering discipline.
Applying root-cause analysis from manufacturing defects to software debugging.
        `.trim(),
        technologies: [
          "Operations Management",
          "Logistics",
          "Process Optimization",
        ],
      },
    ].map((exp) => ({
      updateOne: {
        filter: { position: exp.position, company: exp.company },
        update: { $set: exp },
        upsert: true,
      },
    }));
    await Experience.bulkWrite(experiences);

    // 4. Seed Projects - Muhammad Tayyab's ACTUAL Projects
    const projects = [
      {
        title: "TalkBridge",
        slug: "talkbridge",
        excerpt: "Modern social platform for language enthusiasts to practice conversations with real-time communication.",
        content: `
### Overview
A comprehensive MERN Stack social platform connecting language learners worldwide.

### Key Features
- Real-time video/audio calls using WebRTC
- Instant messaging system
- Intelligent user matching algorithm
- Cross-border connection building

### Tech Stack
- MongoDB, Express.js, React.js, Node.js
- WebRTC for real-time communication
- Socket.io for real-time features
        `.trim(),
        tags: ["React.js", "Node.js", "MongoDB", "Express.js", "WebRTC", "Socket.io", "Real-time"],
        featured: true,
        published: true,
      },
      {
        title: "CodeFlex",
        slug: "codeflex",
        excerpt: "Multimodal AI fitness coach using voice processing and LLM for personalized fitness regimes.",
        content: `
### Overview
Revolutionary fitness application combining voice AI with personalized workout planning.

### Key Features
- Two-way voice conversation with AI agent
- Real-time voice processing
- Fitness metrics capture (age, weight, goals)
- Complete fitness regime generation via Gemini API
- Secure authentication with Clerk
- Real-time data sync with Convex

### Tech Stack
- MERN Stack
- Gemini API for AI processing
- Clerk for authentication
- Convex for real-time sync
- Tailwind CSS for responsive UI
        `.trim(),
        tags: ["React.js", "Node.js", "Gemini API", "AI", "Clerk", "Convex", "Tailwind CSS", "Voice AI"],
        featured: true,
        published: true,
      },
      {
        title: "DevFlow",
        slug: "devflow",
        excerpt: "Developer-focused Q&A platform similar to Stack Overflow for coding questions and answers.",
        content: `
### Overview
A robust Q&A platform built specifically for developers.

### Key Features
- User authentication and authorization
- Question and answer posting system
- Upvoting and best answer selection
- Search and filter functionality
- User reputation system

### Tech Stack
- MongoDB, Express.js, React.js, Node.js
- JWT authentication
- Rich text editor for code snippets
        `.trim(),
        tags: ["React.js", "Node.js", "MongoDB", "Express.js", "JWT", "MERN Stack"],
        featured: true,
        published: true,
      },
      {
        title: "Doctor Appointment Booking App",
        slug: "doctor-appointment-app",
        excerpt: "Full-stack appointment booking system with role-based access for Admin, Doctor, and Patient.",
        content: `
### Overview
Comprehensive healthcare booking platform with multi-role support.

### Key Features
- User roles: Admin, Doctor, Patient
- JWT authentication system
- Real-time notifications
- Schedule management for doctors
- Appointment booking and tracking
- Responsive UI design

### Tech Stack
- MERN Stack (MongoDB, Express, React, Node.js)
- JWT for secure authentication
- Real-time notifications
- MongoDB for data persistence
        `.trim(),
        tags: ["React.js", "Node.js", "MongoDB", "Express.js", "JWT", "Real-time"],
        featured: true,
        published: true,
      },
      {
        title: "Chef Book",
        slug: "chef-book",
        excerpt: "Modern recipe application UI built with Vue.js for browsing and viewing detailed recipes.",
        content: `
### Overview
Beautiful and responsive recipe browsing platform.

### Key Features
- Recipe browsing with search
- Detailed recipe views
- Clean, user-friendly layout
- Responsive design
- Component-based architecture

### Tech Stack
- Vue.js 3
- Composition API
- Responsive CSS
        `.trim(),
        tags: ["Vue.js", "Nuxt.js", "Recipe App", "Responsive Design"],
        featured: false,
        published: true,
      },
      {
        title: "AI Skeleton Frontend",
        slug: "ai-skeleton-frontend",
        excerpt: "Fully designed frontend with pricing plans, beginner guide, and product roadmap.",
        content: `
### Features
- Pricing plans section
- Beginner-friendly guide
- Product roadmap display
- Clean, responsive design
- User-friendly navigation
        `.trim(),
        tags: ["Frontend", "UI Design", "Next.js", "Tailwind CSS"],
        featured: false,
        published: true,
      },
      {
        title: "FOOD HUNT",
        slug: "food-hunt",
        excerpt: "Responsive frontend for food delivery service with menu browsing and order customization.",
        content: `
### Features
- Menu browsing system
- Order customization
- Real-time order tracking
- Seamless navigation
- Fast load times
        `.trim(),
        tags: ["React.js", "Frontend", "Food Delivery", "Responsive Design"],
        featured: false,
        published: true,
      },
      {
        title: "Audit Frontend",
        slug: "audit-frontend",
        excerpt: "Next.js audit platform for brokers with dashboard, discussion forums, and role-based profiles.",
        content: `
### Features
- Dashboard for audits
- Chapters management
- Discussion forums
- Role-based profiles (Brokers, Experts, Admins)
- Secure authentication
- Employee data management
        `.trim(),
        tags: ["Next.js", "Dashboard", "Role-Based Access", "Authentication"],
        featured: false,
        published: true,
      },
      {
        title: "TECH CART",
        slug: "tech-cart",
        excerpt: "Frontend e-commerce platform for digital electronics with intuitive shopping experience.",
        content: `
### Features
- Product browsing and exploration
- Product comparison
- Shopping cart functionality
- Modern, intuitive UI
- Electronics catalog (watches, headphones, gadgets)
        `.trim(),
        tags: ["React.js", "E-commerce", "Frontend", "Shopping"],
        featured: false,
        published: true,
      },
      {
        title: "DesignCraft",
        slug: "designcraft",
        excerpt: "Tailwind CSS showcase project demonstrating modern web components and responsive design.",
        content: `
### Overview
A practice project focusing on Tailwind CSS mastery and responsive design principles.

### Features
- Modern web components
- Responsive layouts
- Tailwind CSS best practices
- Clean design system
        `.trim(),
        tags: ["Tailwind CSS", "Responsive Design", "UI Components"],
        featured: false,
        published: true,
      },
      {
        title: "Halal Spotify",
        slug: "halal-spotify",
        excerpt: "JavaScript music streaming platform with ethical content curation and dynamic features.",
        content: `
### Features
- Music streaming interface
- Ethical content curation
- Dynamic content loading
- User authentication
- Responsive design
- Playlist management
        `.trim(),
        tags: ["JavaScript", "Music App", "Frontend"],
        featured: false,
        published: true,
      },
      {
        title: "Postivius",
        slug: "postivius",
        excerpt: "Next.js frontend template with clean layouts for About, Services, Use Cases, Pricing, and Blog.",
        content: `
### Features
- About Us page
- Services showcase
- Use Cases section
- Pricing page
- Blog layout
- Clean, responsive design
        `.trim(),
        tags: ["Next.js", "Frontend Template", "Responsive Design"],
        featured: false,
        published: true,
      },
      {
        title: "RAG Agent Portfolio",
        slug: "rag-agent-portfolio",
        excerpt: "AI-powered portfolio with RAG system using Pinecone and Gemini API for intelligent responses.",
        content: `
### Overview
This very portfolio you're viewing! An advanced RAG-enabled AI agent system.

### Key Features
- RAG (Retrieval-Augmented Generation) system
- Pinecone vector database integration
- Gemini API for LLM responses
- Real-time AI chat interface
- Neural Graph 3D visualization
- Automatic portfolio data embedding

### Tech Stack
- Next.js, React, TypeScript
- Gemini API for embeddings and chat
- Pinecone for vector storage
- MongoDB for data persistence
- OpenAI Agent SDK for tool orchestration
        `.trim(),
        tags: ["RAG Systems", "Agentic AI", "Pinecone", "Gemini API", "Next.js", "AI Agent"],
        featured: true,
        published: true,
      },
      {
        title: "AI Chat Assistant",
        slug: "ai-chat-assistant",
        excerpt: "Conversational AI chatbot with context awareness and multi-turn dialogue capabilities.",
        content: `
### Overview
Intelligent chatbot leveraging LLMs for natural conversations.

### Features
- Context-aware responses
- Multi-turn dialogue support
- Tool calling capabilities
- Streaming responses
- Memory management

### Tech Stack
- OpenAI/Gemini API
- Next.js
- Real-time streaming
        `.trim(),
        tags: ["AI", "Chatbot", "Gemini API", "Conversational AI"],
        featured: false,
        published: true,
      },
      {
        title: "Linux Control Agent",
        slug: "linux-control-agent",
        excerpt: "AI agent for controlling Linux systems through natural language commands.",
        content: `
### Overview
Autonomous agent for Linux system administration via natural language.

### Features
- Natural language command interpretation
- System control and automation
- File management
- Process monitoring
- Script execution
- Safety controls and confirmations

### Tech Stack
- Python/Node.js
- LLM integration
- System APIs
- Command execution framework
        `.trim(),
        tags: ["AI", "Agentic AI", "Linux", "Automation", "System Control"],
        featured: true,
        published: true,
      },
    ].map((proj) => ({
      updateOne: {
        filter: { slug: proj.slug },
        update: { $set: proj },
        upsert: true,
      },
    }));
    await Project.bulkWrite(projects);

    // 5. Seed Education
    const education = [
      {
        degree: "Bachelor's in Information Technology",
        institution: "Riphah International University",
        location: "Faisalabad Campus",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2029-07-01"),
        status: "In Progress",
        description:
          "Focus on Computer Science fundamentals, Data Structures, and scalable systems.",
      },
      {
        degree: "Cloud Applied Generative AI Engineer (GenEng)",
        institution: "Presidential Initiative (PIAIC)",
        location: "Hybrid",
        status: "Completed",
        description:
          "Deep dive into Python, Docker, Kubernetes, LangChain, and Microservices architecture.",
      },
      {
        degree: "Web and Mobile Development",
        institution: "Gamica Cloud",
        location: "Faisalabad",
        status: "Completed",
        description:
          "Practical application of HTML, CSS, JavaScript, and React Native.",
      },
    ].map((edu) => ({
      updateOne: {
        filter: { degree: edu.degree, institution: edu.institution },
        update: { $set: edu },
        upsert: true,
      },
    }));
    await Education.bulkWrite(education);

    // 6. Seed Skills - Muhammad Tayyab's ACTUAL Skills ONLY
    const skillList = [
      // Languages (from YOUR portfolio)
      { name: "JavaScript (ES6+)", category: "Languages", proficiency: 95, featured: true },
      { name: "TypeScript", category: "Languages", proficiency: 80, featured: false },
      { name: "HTML5", category: "Languages", proficiency: 95 },
      { name: "CSS3", category: "Languages", proficiency: 90 },

      // MERN Stack
      { name: "MongoDB", category: "Backend", proficiency: 90, featured: true },
      { name: "Express.js", category: "Backend", proficiency: 90, featured: true },
      { name: "React.js", category: "Frontend", proficiency: 95, featured: true },
      { name: "Node.js", category: "Backend", proficiency: 90, featured: true },

      // Frontend
      { name: "Next.js", category: "Frontend", proficiency: 90, featured: true },
      { name: "Vue.js", category: "Frontend", proficiency: 80 },
      { name: "Nuxt.js", category: "Frontend", proficiency: 75 },
      { name: "Tailwind CSS", category: "Frontend", proficiency: 95, featured: true },
      { name: "ShadCN UI", category: "Frontend", proficiency: 90 },
      { name: "Bootstrap", category: "Frontend", proficiency: 85 },
      { name: "React Router", category: "Frontend", proficiency: 90 },
      { name: "React Hook Form", category: "Frontend", proficiency: 85 },

      // State Management
      { name: "Redux", category: "Frontend", proficiency: 90, featured: true },
      { name: "Redux Toolkit", category: "Frontend", proficiency: 90 },
      { name: "Context API", category: "Frontend", proficiency: 90 },
      { name: "Zustand", category: "Frontend", proficiency: 80 },

      // Backend & API
      { name: "REST API", category: "Backend", proficiency: 95, featured: true },
      { name: "GraphQL", category: "Backend", proficiency: 85, featured: true },
      { name: "Apollo Server", category: "Backend", proficiency: 80 },
      { name: "Mongoose", category: "Backend", proficiency: 90 },

      // Authentication
      { name: "JWT", category: "Backend", proficiency: 90 },
      { name: "OAuth", category: "Backend", proficiency: 85 },
      { name: "Clerk", category: "Backend", proficiency: 80 },

      // Agentic AI & RAG (from YOUR portfolio)
      { name: "RAG Systems", category: "AI", proficiency: 90, featured: true },
      { name: "Agentic AI", category: "AI", proficiency: 90, featured: true },
      { name: "OpenAI Agent SDK", category: "AI", proficiency: 85, featured: true },
      { name: "Pinecone", category: "AI", proficiency: 85, featured: true },
      { name: "Vector Databases", category: "AI", proficiency: 85 },
      { name: "Embeddings", category: "AI", proficiency: 85 },
      { name: "Prompt Engineering", category: "AI", proficiency: 90 },

      // LLM Integration
      { name: "Gemini API", category: "AI", proficiency: 95, featured: true },
      { name: "OpenAI GPT", category: "AI", proficiency: 90, featured: true },

      // Real-time & Communication
      { name: "WebSockets", category: "Backend", proficiency: 85 },
      { name: "Socket.io", category: "Backend", proficiency: 85 },

      // Third-Party Services
      { name: "Convex", category: "Backend", proficiency: 80 },
      { name: "Cloudinary", category: "Backend", proficiency: 85 },

      // Development Tools
      { name: "Git", category: "DevOps", proficiency: 90 },
      { name: "GitHub", category: "DevOps", proficiency: 90 },
      { name: "npm", category: "DevOps", proficiency: 90 },
      { name: "yarn", category: "DevOps", proficiency: 85 },
      { name: "Vite", category: "DevOps", proficiency: 85 },
      { name: "Postman", category: "DevOps", proficiency: 90 },
      { name: "ESLint", category: "DevOps", proficiency: 85 },
      { name: "Prettier", category: "DevOps", proficiency: 85 },

      // Testing
      { name: "Jest", category: "Testing", proficiency: 80 },
      { name: "React Testing Library", category: "Testing", proficiency: 75 },
      { name: "Supertest", category: "Testing", proficiency: 75 },

      // Cloud & Deployment
      { name: "Vercel", category: "DevOps", proficiency: 90 },
      { name: "Netlify", category: "DevOps", proficiency: 80 },
      { name: "AWS", category: "DevOps", proficiency: 70 },
      { name: "Docker", category: "DevOps", proficiency: 75 },
    ];

    const skillOps = skillList.map((skill) => ({
      updateOne: {
        filter: { name: skill.name },
        update: { $set: skill },
        upsert: true,
      },
    }));
    await Skill.bulkWrite(skillOps);

    // 7. Seed Engineering Manifesto
    await Blog.updateOne(
      { slug: "engineering-manifesto" },
      {
        $set: {
          title: "The Engineering Manifesto",
          slug: "engineering-manifesto",
          excerpt:
            "My core philosophy: Production-Grade standards, Cost-Efficiency, Direct Communication, and Documentation as Code.",
          content: `
## Engineering Manifesto & Core Philosophy

1.  **"Production-Grade" is the Standard**: I do not write code that just "works on my machine." I write code that survives the internet. This means handling edge cases, managing network failures gracefully, and ensuring that if the API fails, the user sees a helpful error message, not a white screen. I assume everything will fail, and I build systems that recover.

2.  **Cost-Efficiency is an Architecture Choice**: I believe that a good architect saves the company money. I aggressively utilize free tiers (Gemini Free API, Supabase Free Tier, Vercel Hobby) to build MVPs. I choose algorithms that minimize computational cost.

3.  **The "No Fluff" Communication Style**: I value speed and precision. When I communicate technical issues, I provide the error log, the reproduction steps, and the proposed solution.

4.  **Documentation is Code**: I believe that a project without a README is a dead project. I invest time in creating beautiful, animated, and descriptive READMEs.
            `.trim(),
          tags: ["Philosophy", "Engineering", "Manifesto"],
          published: true,
          featured: true,
          author: "Muhammad Tayyab Sohail",
          readTime: "3 min read",
        },
      },
      { upsert: true },
    );

    return NextResponse.json({
      message: "Database seeded successfully. Data safely upserted.",
    });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
