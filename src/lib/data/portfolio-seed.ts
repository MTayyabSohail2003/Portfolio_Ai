export const PORTFOLIO_DATA = {
  experience: [
    {
      position: "Full Stack Engineer & AI Architect",
      company: "Wodwes Solution LLC",
      location: "Faisalabad, Pakistan",
      startDate: new Date("2025-06-01"),
      current: true,
      description: `
- **Multi-Tenant SaaS Architecture**: Leading the development of a flagship SaaS Job Portal implementing organization-scoped data access.
- **Agentic AI R&D**: Spearheading the initiative into "Agentic AI", building internal tools for autonomous project monitoring.
- **Payment Infrastructure**: Integrated Stripe Connect and complex subscription webhooks for real-time billing lifecycles.
- **Frontend Performance**: Reduced initial load time by 40% using Next.js Route Groups and Lazy Loading.
      `,
      technologies: ["Next.js", "Agentic AI", "Stripe", "SaaS"],
    },

    {
      position: "Web & Mobile Developer",
      company: "Gamica Cloud (GIAIC)",
      location: "Faisalabad, Pakistan",
      startDate: new Date("2023-08-01"),
      endDate: new Date("2025-01-01"),
      current: false,
      description: `
- **Full Stack Fundamentals**: Mastered the web request lifecycle from DNS to Database.
- **Mobile Responsiveness**: Expert handling of CSS Grid/Flexbox for cross-device compatibility.
- **Collaborative Git**: Proficient in handling merge conflicts and code reviews in team environments.
      `,
      technologies: ["HTML/CSS", "React Native", "Git"],
    },
    {
      position: "Production Controller",
      company: "Textile Sector (Confidential)",
      location: "Faisalabad, Pakistan",
      startDate: new Date("2021-06-01"),
      endDate: new Date("2023-01-01"),
      current: false,
      description: `
- **Logistics as Data**: Managed material flow (Input -> Process -> Output) with zero-error tolerance.
- **Root Cause Analysis**: Applied rigorous debugging mindsets to physical production shortfalls.
- **Preventive Maintenance**: Developed a proactive mindset for system health, translating directly to code quality assurance.
      `,
      technologies: ["Logistics", "Operations", "Data Analysis"],
    },
  ],
  education: [
    {
      degree: "Cloud Applied Generative AI Engineer (GenEng)",
      institution:
        "Presidential Initiative for Artificial Intelligence & Computing (PIAIC)",
      status: "Completed",
      description:
        "Deep dive into Python, Docker, Kubernetes, LangChain, and Microservices. Focus on Cloud-Native AI applications.",
    },
    {
      degree: "Bachelor's in Computer Science",
      institution: "Riphah International University, Faisalabad Campus",
      status: "In Progress",
      description: "Focus: Data Structures, Algorithms, OOP, and DBMS.",
    },
    {
      degree: "Diploma in Web & Mobile Application Development",
      institution: "Gamica Cloud",
      status: "Completed",
      description: "Practical application of MERN stack and React Native.",
    },
  ],
  projects: [
    {
      title: "Project Alpha: Equip.co Clone",
      excerpt: "SaaS Job Portal with resume parsing and secure multi-tenancy.",
      content: `
### The Challenge
To build a hiring platform that rivals industry leaders like Equip.co, requiring complex features like automated candidate ranking, resume parsing, and secure multi-company hosting.

### The Architecture
- **Frontend**: Next.js 14 (App Router) utilizing **Server Actions**.
- **Backend**: Serverless functions handling scalable business logic.
- **Database**: Supabase (PostgreSQL) with RLS for strict multi-tenancy.

### Key Engineering Feats
- **Resume Parsing Pipeline**: integrated OCR to convert PDFs into JSON candidate profiles.
- **RBAC**: Granular permission system (Admin, Recruiter, Viewer).
- **Stripe Integration**: Automated subscription provisioning via webhooks.
      `,
      tags: ["Next.js", "Supabase", "Stripe", "SaaS", "OCR"],
      featured: true,
      published: true,
    },
    {
      title: "Project Beta: Dark Psychology Automation",
      excerpt: "AI-Driven Media Factory for viral YouTube Shorts creation.",
      content: `
### The Challenge
To automate the creation of viral "YouTube Shorts" content targeting USA/UK/Canada markets without manual editing.

### The Solution: An AI-Driven Media Factory
- **Scripting Engine**: Python script scraping Reddit/Twitter and using Gemini API for script generation.
- **Visual Generation**: 3D Animated Avatar with algorithmic lip-syncing.
- **Video Processing (FFmpeg)**: Automated heavy lifting—splicing gameplay footage, burning in dynamic "Submagic-style" captions.
      `,
      tags: ["Python", "Gemini API", "FFmpeg", "Automation", "AI"],
      featured: true,
      published: true,
    },
    {
      title: "Project Gamma: Industrial ETL Scripts",
      excerpt:
        "Automated extraction of stubborn data from unstructured PDF logs.",
      content: `
### The Challenge
A Telecom client had thousands of "Stuck Alarm" logs locked in unstructured PDFs.

### The Solution
- **PDF Extraction**: Used \`pdfplumber\` for precise coordinate extraction.
- **Data Cleaning**: Programmatic cleanup of noise columns.
- **Logic**: Intelligent row-merging algorithms to fix broken PDF lines.
- **Output**: Clean, filter-enabled Excel reports using \`pandas\`.
      `,
      tags: ["Python", "Pandas", "ETL", "Automation"],
      featured: false,
      published: true,
    },
  ],
  skills: [
    { name: "Next.js", category: "Frontend", proficiency: 95, featured: true },
    { name: "React.js", category: "Frontend", proficiency: 95, featured: true },
    {
      name: "Tailwind CSS",
      category: "Frontend",
      proficiency: 90,
      featured: false,
    },
    {
      name: "TypeScript",
      category: "Frontend",
      proficiency: 85,
      featured: true,
    },
    { name: "Node.js", category: "Backend", proficiency: 90, featured: true },
    { name: "Python", category: "Backend", proficiency: 85, featured: true },
    { name: "FastAPI", category: "Backend", proficiency: 80, featured: false },
    { name: "Supabase", category: "Backend", proficiency: 85, featured: false },
    { name: "MongoDB", category: "Backend", proficiency: 88, featured: true },
    {
      name: "Agentic AI",
      category: "AI Engineering",
      proficiency: 90,
      featured: true,
    },
    {
      name: "RAG Systems",
      category: "AI Engineering",
      proficiency: 92,
      featured: true,
    },
    {
      name: "Gemini API",
      category: "AI Engineering",
      proficiency: 95,
      featured: true,
    },
    {
      name: "LangChain",
      category: "AI Engineering",
      proficiency: 80,
      featured: false,
    },
    {
      name: "FFmpeg",
      category: "Media Engineering",
      proficiency: 85,
      featured: true,
    },
    { name: "Docker", category: "DevOps", proficiency: 80, featured: false },
    {
      name: "Linux (Fedora)",
      category: "DevOps",
      proficiency: 85,
      featured: false,
    },
    { name: "AWS", category: "DevOps", proficiency: 75, featured: false },
  ],
};
