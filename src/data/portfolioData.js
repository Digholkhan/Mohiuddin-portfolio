/* =====================================================================
   MD MOHIUDDIN — CINEMATIC 3D DIGITAL UNIVERSE DATA STORE
   Authentic structured data decoupled from WebGL engine
   ===================================================================== */

export const PROFILE = {
  name: "Md Mohiuddin",
  firstName: "Mohiuddin",
  tagline: "Full-Stack Developer • AI Automation • Generative AI • DevOps • Technology Mentor",
  primaryRole: "Full-Stack Developer",
  identities: [
    "AI Automation Engineer",
    "Generative AI Practitioner",
    "DevOps Enthusiast",
    "Technology Mentor",
    "Computer Science Enthusiast"
  ],
  philosophyWords: ["BUILD.", "AUTOMATE.", "LEARN.", "TEACH."],
  philosophyStatement: "Technology is a continuous journey of building, experimenting, learning and sharing knowledge.",
  intro: "Building modern digital experiences, intelligent systems and automation-powered solutions.",
  github: "https://github.com/Digholkhan",
  linkedin: "https://linkedin.com/in/md-mohiuddin",
  email: "mohiuddin.developer@gmail.com",
  portraitImg: "/assets/portrait.png",
  workshopImg: "/assets/workshop.png",
  stats: [
    { label: "Architecture", value: "Full-Stack" },
    { label: "Core Focus", value: "GenAI & Automation" },
    { label: "Engineered", value: "Interactive 3D" },
    { label: "Mentees Guided", value: "500+ Minds" }
  ]
};

export const CHAPTERS = [
  { id: "hero", title: "01 // GENESIS", label: "Genesis", hash: "#hero" },
  { id: "builder", title: "02 // BUILDER", label: "Development", hash: "#builder" },
  { id: "ai", title: "03 // NEURAL CORE", label: "Generative AI", hash: "#ai" },
  { id: "automation", title: "04 // WORKFLOW", label: "Automation", hash: "#automation" },
  { id: "devops", title: "05 // INFRASTRUCTURE", label: "DevOps", hash: "#devops" },
  { id: "mentor", title: "06 // MENTOR LAB", label: "Mentoring", hash: "#mentor" },
  { id: "cs", title: "07 // FOUNDATION", label: "Computer Science", hash: "#cs" },
  { id: "projects", title: "08 // UNIVERSE", label: "Projects", hash: "#projects" },
  { id: "constellation", title: "09 // CONSTELLATION", label: "Skills", hash: "#constellation" },
  { id: "philosophy", title: "10 // PHILOSOPHY", label: "Philosophy", hash: "#philosophy" },
  { id: "horizon", title: "11 // HORIZON", label: "Contact", hash: "#horizon" }
];

export const SKILL_GROUPS = {
  frontend: {
    title: "Frontend Architecture",
    description: "Responsive, high-throughput interfaces crafted with component discipline and fluid user experience.",
    skills: ["HTML5", "CSS3", "JavaScript (ESNext)", "React.js", "Next.js", "Tailwind CSS", "Bootstrap", "Framer Motion", "WebGL / Three.js"]
  },
  backend: {
    title: "Backend & Systems",
    description: "Scalable server architectures, high-performance APIs, and secure transaction handling.",
    skills: ["Node.js", "Express.js", "RESTful APIs", "Authentication / JWT", "Real-Time WebSockets", "Middleware Architecture"]
  },
  database: {
    title: "Databases & Storage",
    description: "Distributed data persistence, real-time synchronization, and optimized query pipelines.",
    skills: ["MongoDB", "Firebase Realtime / Firestore", "Supabase PostgreSQL", "Data Modeling", "Schema Optimization"]
  },
  ai: {
    title: "Generative AI & LLMs",
    description: "Bridging modern software engineering with intelligent cognitive models and autonomous agent workflows.",
    skills: ["Generative AI", "Large Language Models (LLMs)", "AI-Assisted Development", "AI Agents", "Prompt Engineering", "AI Integrations", "Intelligent Workflows", "Context Injection"]
  },
  automation: {
    title: "AI Automation & Workflows",
    description: "Converting manual, repetitive business processes into self-healing, intelligent digital engines.",
    skills: ["n8n Workflows", "Custom Webhooks", "API Integrations", "Multi-Step Logic", "Email Automation", "Automated Pipelines", "Event-Driven Triggers"]
  },
  devops: {
    title: "DevOps & Cloud Infrastructure",
    description: "Reproducible deployment systems, reliable version control, and scalable cloud environments.",
    skills: ["Git & GitHub", "CI/CD Pipelines", "Vercel / Netlify Deployments", "Cloud Services", "Environment Configuration", "Containers / Docker", "Performance Monitoring", "System Observability"]
  },
  cs: {
    title: "Computer Science Fundamentals",
    description: "Frameworks change. Engineering fundamentals remain the timeless foundation of software craft.",
    skills: ["Algorithms", "Data Structures", "Object-Oriented & Functional Paradigms", "System Architecture", "Networking Protocols", "Problem Solving", "Memory & Performance Optimization"]
  }
};

export const AUTOMATION_WORKFLOW_STEPS = [
  { step: "01", name: "INPUT", desc: "Webhooks, forms, API events & raw payloads ingested in real time", icon: "terminal" },
  { step: "02", name: "AI COGNITION", desc: "LLM contextual analysis, classification, summarization & semantic intent extraction", icon: "cpu" },
  { step: "03", name: "DECISION", desc: "Deterministic logic branches, business rules & autonomous routing criteria", icon: "git-branch" },
  { step: "04", name: "AUTOMATION", desc: "n8n orchestrator executes multi-service parallel actions & API transactions", icon: "activity" },
  { step: "05", name: "DATABASE", desc: "Structured state persistence across Supabase, MongoDB or cloud repositories", icon: "database" },
  { step: "06", name: "OUTPUT", desc: "Instantaneous notifications, generated client artifacts & dispatched webhooks", icon: "send" }
];

export const MENTORSHIP_TOPICS = [
  "HTML & Semantic Design",
  "CSS Grid, Flexbox & Responsive UI",
  "Modern JavaScript (ES6+)",
  "React Component Lifecycle",
  "Next.js App Router & SSR",
  "Git & Collaborative GitHub",
  "Full-Stack Node.js & Express",
  "MongoDB & Firebase Data",
  "Generative AI & LLM Prompting",
  "Workflow Automation with n8n",
  "Modern DevOps & CI/CD",
  "Engineering Problem Solving"
];

export const REAL_PROJECTS = [
  {
    id: "jobsphere-ai",
    title: "JobSphere AI",
    category: "AI Candidate Intelligence Platform",
    tag: "AI & Full-Stack",
    description: "Intelligent career discovery and candidate telemetry portal with automated resume parsing, semantic matching, dynamic score breakdown, and real-time application pipelines.",
    tech: ["React", "Vite", "TypeScript", "Framer Motion", "LLM APIs", "Tailwind CSS"],
    highlights: ["Semantic resume scoring", "Dynamic skill matching", "Fluid Framer Motion UI", "Contextual candidate insights"],
    color: "#00f5ff",
    github: "https://github.com/Digholkhan/job-seeker",
    live: "https://jobsphere-ai.vercel.app"
  },
  {
    id: "zen-pulse",
    title: "Zen-Pulse Telemetry",
    category: "Mindful Health & Productivity Dashboard",
    tag: "Full-Stack & Data Viz",
    description: "Next-generation mindful productivity telemetry dashboard featuring real-time biometric metrics, dynamic Recharts data visualization, state management with Zustand, and habit scoring.",
    tech: ["Next.js", "React", "Recharts", "Zustand", "Tailwind CSS", "Canvas Confetti"],
    highlights: ["Interactive biometric telemetry charts", "Zustand store architecture", "Productivity flow algorithms", "Dark-mode cyber aesthetic"],
    color: "#7b2ff7",
    github: "https://github.com/Digholkhan/Zen-pulse",
    live: "https://zen-pulse.vercel.app"
  },
  {
    id: "cyberpunk-ui",
    title: "Cyberpunk 3D Interface",
    category: "Reactive WebGL Digital Experience",
    tag: "WebGL & Creative Tech",
    description: "Futuristic interactive web experience designed with Lenis smooth inertial scrolling, canvas particle dynamics, reactive mouse illumination, and cybernetic UI components.",
    tech: ["React", "Lenis", "Framer Motion", "WebGL Shaders", "Tailwind CSS", "Lucide React"],
    highlights: ["Inertial smooth scrolling", "Mouse spotlight shaders", "Interactive audio feedback", "Cybernetic modal triggers"],
    color: "#ff4d9d",
    github: "https://github.com/Digholkhan/cyperpunk-portfolio",
    live: "https://cyberpunk-portfolio.vercel.app"
  },
  {
    id: "our-story",
    title: "Our-Story Realtime",
    category: "Collaborative Social Platform",
    tag: "Realtime & Supabase",
    description: "Real-time relational memory timeline and multimedia milestone platform with instantaneous Supabase synchronization, interactive reaction pulses, and secure authentication.",
    tech: ["React", "Supabase", "PostgreSQL", "Realtime WebSockets", "Tailwind CSS"],
    highlights: ["Live database channel subscriptions", "Supabase Row-Level Security", "Dynamic story milestone feed", "Responsive media layouts"],
    color: "#00f5ff",
    github: "https://github.com/Digholkhan/Our-Story",
    live: "https://our-story-app.vercel.app"
  },
  {
    id: "exclusive-ecommerce",
    title: "Exclusive Commerce",
    category: "Full-Stack Digital Storefront",
    tag: "Full-Stack E-Commerce",
    description: "Complete modern digital commerce storefront featuring reactive cart management, multi-tier categorized product discovery, payment workflows, and order life-cycle tracking.",
    tech: ["React", "Node.js", "Express.js", "MongoDB", "REST APIs", "Tailwind CSS"],
    highlights: ["Optimistic UI cart state", "Categorized inventory search", "Secure checkout pipeline", "Modular microservice architecture"],
    color: "#7b2ff7",
    github: "https://github.com/Digholkhan/E-commerce",
    live: "https://exclusive-ecommerce.vercel.app"
  },
  {
    id: "upland-properties",
    title: "UPLAND Architectures",
    category: "Architectural Property Portal",
    tag: "Full-Stack Real Estate",
    description: "High-aesthetic property discovery platform with interactive multi-parameter filtering, spatial floor plan previews, and lead capture pipelines for luxury architectures.",
    tech: ["React", "Vite", "Tailwind CSS", "JavaScript ES6+", "REST Integration"],
    highlights: ["Fast client-side spatial filters", "High-res asset lazy loading", "Custom interactive inquiry pipeline", "Clean responsive layout"],
    color: "#00f5ff",
    github: "https://github.com/Digholkhan/UPLAND",
    live: "https://upland-properties.vercel.app"
  }
];
