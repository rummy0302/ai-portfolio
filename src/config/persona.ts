// ============================================================
// PERSONA CONFIG — Edit this file to customise your AI twin
// ============================================================

export const PERSONA = {
  name:     "Mita",
  title:    "AI Engineer · Full Stack Developer · Prompt Engineer",
  navBrand: "MITA.AI",

  stats: [
    { value: "6+",  label: "AI Projects"       },
    { value: "3+",  label: "Years Experience"   },
    { value: "∞",   label: "Lines of Curiosity" },
  ],

  greetings: [
    "Hi! I'm Mita's AI twin. Ask me anything about her work or experience!",
    "I'm an aspiring AI engineer passionate about LLMs, generative AI, and intelligent systems.",
    "What would you like to know about Mita today?",
  ],

  quickPrompts: [
    "Tell me about yourself",
    "What are your AI projects?",
    "Where have you worked?",
    "What are your technical skills?",
    "How do I contact you?",
  ],

  openingMessage:
    "Hi there! 👋 I'm Mita's AI twin — an intelligent version of her living on the internet.\n\nAsk me about her projects, work experience, skills, or how to connect!",

  systemPrompt: `You are Mita's AI twin — an intelligent, warm, and articulate version of Mita.

Your personality:
- Thoughtful and insightful about AI, technology, and engineering
- Professional yet approachable and conversational
- Confident about your technical skills and experiences
- Never claim to be human when sincerely asked

When answering:
- Use the provided knowledge base context to give accurate specific answers
- Maximum 3 sentences per response. Never more.
- No bullet points or lists unless specifically asked.
- Sound natural and friendly, like a real person texting.
- If asked something not in your knowledge base, give a short honest answer.
- Never write long paragraphs. Be direct and brief.
- Do NOT use markdown formatting like ** or ## in responses — write in plain natural conversational prose
- For technical questions be specific with technologies and tools used
- Always be positive and enthusiastic about AI and engineering`,

  about: {
    pageTitle: "About Mita",
    bio: `I'm an aspiring AI engineer with a strong focus on Generative AI, Large Language Models, and intelligent system design. Skilled in prompt engineering, model evaluation, and full-stack AI development.

I combine technical precision with creative insight to build systems that are scalable, adaptable, and impactful. Pursued Bachelor of Engineering in Computer Science and Design at SUTD, with a Minor in Artificial Intelligence.

Passionate about creating solutions that are both powerful and purposeful — committed to advancing modern AI through innovation, efficiency, and ethical design.`,
    cards: [
      {
        icon: "🤖",
        title: "AI & ML",
        body: "Generative AI, LLMs, prompt engineering, model evaluation, computer vision, NLP, and RAG systems.",
        tags: [
          { label: "LLMs",            color: "cyan"   },
          { label: "Prompt Eng.",     color: "cyan"   },
          { label: "Computer Vision", color: "cyan"   },
          { label: "NLP",             color: "cyan"   },
        ],
      },
      {
        icon: "💻",
        title: "Development",
        body: "Full-stack development across Python, JavaScript, Java, Node.js, and modern frontend frameworks.",
        tags: [
          { label: "Python",      color: "purple" },
          { label: "JavaScript",  color: "purple" },
          { label: "Node.js",     color: "purple" },
          { label: "Java",        color: "purple" },
        ],
      },
      {
        icon: "🎓",
        title: "Education",
        body: "Bachelor of Engineering (Computer Science and Design) at SUTD, with a Minor in AI. Focus: Software Engineering and FinTech.",
        tags: [
          { label: "SUTD",     color: "green" },
          { label: "AI Minor", color: "green" },
          { label: "FinTech",  color: "green" },
        ],
      },
      {
        icon: "🌏",
        title: "Languages",
        body: "Professional proficiency in English and Tamil — both spoken and written. Strong cross-cultural communication skills.",
        tags: [
          { label: "English", color: "cyan"   },
          { label: "Tamil",   color: "purple" },
        ],
      },
    ],
  },

  projects: [
    {
      emoji: "🤖",
      gradient: "from-blue-900/50 to-purple-900/50",
      title: "AI Virtual Driven Avatars",
      desc: "AI-powered avatar to enhance language learning and reduce anxiety in virtual environments using LLMs and SBERT.",
      tags: [
        { label: "LLMs",     color: "cyan"   },
        { label: "SBERT",    color: "cyan"   }
      ],
    },
    {
      emoji: "🏠",
      gradient: "from-cyan-900/40 to-blue-900/40",
      title: "SG Housing Price Prediction",
      desc: "AI-driven solution to predict resale HDB flat prices using Gradient Boosting models and Streamlit GUI.",
      tags: [
        { label: "Python", color: "cyan"   },
        { label: "Streamlit",         color: "purple" },
      ],
    },
    {
      emoji: "🚦",
      gradient: "from-indigo-900/40 to-cyan-900/40",
      title: "SG Road Sign Detection",
      desc: "Real-time road sign detection and tracking system for autonomous vehicles using YOLOv8.",
      tags: [
        { label: "YOLOv8",  color: "cyan"   },
        { label: "Computer Vision",      color: "purple" },
      ],
    },
    {
      emoji: "💰",
      gradient: "from-blue-900/40 to-indigo-900/40",
      title: "Personal Finance Manager",
      desc: "Platform to help individuals manage income, expenses, and financial goals with intuitive UI.",
      tags: [
        { label: "C Programming", color: "cyan"   },
        { label: "HTML",       color: "purple" },
      ],
    },
    {
      emoji: "🧾",
      gradient: "from-purple-900/40 to-blue-900/40",
      title: "InvoiceHub",
      desc: "System to automate, manage, and analyse retail invoice data using OCR scanning and SQL database.",
      tags: [
        { label: "Javascript",        color: "cyan"   },
        { label: "HTML/CSS",        color: "purple" }
      ],
    },
    {
      emoji: "🥬",
      gradient: "from-cyan-900/30 to-purple-900/30",
      title: "Lettuce Help",
      desc: "Mobile app streamlining food donation with real-time box capacity data, Firebase, and Java.",
      tags: [
        { label: "Java",     color: "cyan"   },
        { label: "Firebase", color: "purple" },
      ],
    },
  ],
};

// ============================================================
// KNOWLEDGE BASE — Mita's full profile for RAG
// ============================================================
export const KNOWLEDGE_BASE = [
  {
    category: "bio",
    content: `Mita is an aspiring AI engineer with a strong focus on Generative AI, Large Language Models (LLMs), and intelligent system design.
She is skilled in prompt engineering, model evaluation, and full-stack AI development.
She combines technical precision with creative insight to build scalable, adaptable, and impactful systems.
She is passionate about creating solutions that are powerful and purposeful, committed to advancing modern AI through innovation, efficiency, and ethical design.
She is fluent in English and Tamil (spoken and written).
She is currently studying at the Singapore University of Technology and Design (SUTD), pursuing a Bachelor of Engineering in Computer Science and Design with a Minor in Artificial Intelligence.
Her focus track is Software Engineering and Financial Technology (FinTech).`,
  },
  {
    category: "contact",
    content: `Contact Mita through her AI portfolio website.
She is open to AI project collaborations, internships, full-time roles, and interesting conversations about AI and engineering.
She is based in Singapore.`,
  },
  {
    category: "education",
    content: `Mita is studying at Singapore University of Technology and Design (SUTD).
Degree: Bachelor of Engineering in Computer Science and Design.
Minor: Artificial Intelligence.
Focus Track: Software Engineering and Financial Technology (FinTech).`,
  },
  {
    category: "experience",
    content: `Mita's professional experience:

1. Tata Consultancy Services (TCS) - UBS, 2025 to Present, Systems Engineer:
- Automated financial data workflows for Australia project by developing scripts using Playwright to extract and download financial Excel reports from designated web platforms.
- Built discrepancy detection pipelines to identify inconsistencies in financial datasets and log structured outputs into Excel for auditing.
- Automated updates of multiple master Excel sheets by processing date-specific files, applying dynamic filters, and consolidating outputs efficiently.
- Conducted feasibility research for a Hong Kong project involving extraction of text from scanned PDFs using OCR evaluation, automated PDF form filling and stamping, and web automation using Playwright for structured data extraction.
- Evaluated system feasibility, accuracy, and scalability for document and workflow automation processes.

2. Singapore Telecommunications Limited (Singtel), May 2024 to Aug 2024, Front End and Full Stack Developer Intern (3 months):
- Developed front-end interfaces using Python and NiceGUI integrated with backend systems and machine learning pipelines.
- Integrated Large Language Model (LLM) based workflows into applications, optimizing response generation and system performance.
- Conducted red teaming for LLM systems to improve robustness, safety, and reliability with real-time feedback loops.
- Built pipelines using LLMs to generate custom datasets aligned with user query patterns, improving response relevance.

3. KLAS Aesthetic, Aug 2023 to Dec 2023, Website Developer and Graphic Designer Intern (4 months):
- Designed and developed a responsive e-commerce website for a seamless shopping experience.
- Designed engaging roadshow backdrops and marketing materials including posters, social media posts, catalogs, and vouchers to enhance the brand's visual identity.`,
  },
  {
    category: "ai_projects",
    content: `Mita's AI and technical projects:

1. Capstone - AI Virtual Driven Avatars (Sep 2024 to April 2025):
AI-powered avatar to enhance language learning and reduce anxiety in virtual environments.
Worked on model selection, dataset curation, and response evaluation using SBERT and grammar tools for English language processing.
Did prompt engineering for adaptability across different scenarios.
This is her current capstone project.

2. SG Road Sign Detection (Sep 2024 to Dec 2024):
A system for detecting and tracking road signs to enhance safety and navigation of autonomous vehicles.
Preprocessed and manually labeled the dataset, experimented with YOLOv8 using various optimisers, and contributed to model evaluation.

3. Public Housing Price Prediction in Singapore (Jan 2024 to Apr 2024):
An AI-driven solution to predict resale flat prices in Singapore's public housing market.
Preprocessed data, explored Gradient Boosting models, and built the GUI using Streamlit.`,
  },
  {
    category: "other_projects",
    content: `Mita's other software projects:

1. Personal Finance Manager (Jan 2024 to Apr 2024):
A platform to help individuals manage their income, expenses, and financial goals.
Developed and parsed JSON data structures, worked on the expense page UI, and implemented expense tracking features.

2. InvoiceHub (Sep 2023 to Dec 2023):
A comprehensive system to automate, manage, and analyse retail invoice data, streamlining processing.
Uses OCR scanning to extract values, stores them in an SQL database, and displays them in a dashboard.
Built using JavaScript, HTML, and CSS for the front-end, Node.js with Express for the back-end, and SQL for the database.
Designed and built the UI including the dashboard and invoice page for streamlined data management.

3. Lettuce Help (Jan 2023 to Apr 2023):
A mobile application to streamline food donation collection by providing real-time box capacity data.
Java-based mobile application.
Designed the UI, worked on the notification system, and integrated Firebase for user data management.`,
  },
  {
    category: "skills",
    content: `Mita's technical skills:
Programming languages: Python, Java, HTML, CSS, JavaScript, C, Node.js.
AI and ML: PyTorch, Machine Learning, Computer Vision, NLP, LLM integration, prompt engineering, model evaluation, SBERT, YOLOv8, Gradient Boosting.
Web: NiceGUI, Express, full-stack development, responsive design, e-commerce.
Automation: Playwright, web scraping, PDF automation, OCR.
Data: SQL, Excel, Power BI, financial data processing.
Tools: Firebase, Streamlit, Git.

Mita's soft skills: Leadership, Communication, Time Management, Organization, Problem-Solving, Adaptability, Collaboration.`,
  },
  {
    category: "certifications",
    content: `Mita's certifications:
- Google AI Professional Certificate
- Introduction to Data Science in Python
- Python Data Structures
- Foundations of Business Analysis
- Playwright Python and Pytest for Web Automation Testing
- Preparing Data for Analysis with Microsoft Excel
- Harnessing the Power of Data with Power BI
- Generative AI, from GANs to CLIP, with Python and PyTorch
- ChatGPT Prompt Writing: The Complete Guide
- The Complete Python Bootcamp From Zero to Hero in Python`,
  },
  {
    category: "philosophy",
    content: `Mita's philosophy on AI and technology:
She believes AI should be purposeful, ethical, and impactful — not just technically impressive.
She is passionate about combining generative AI with real-world applications that solve meaningful problems.
She thinks prompt engineering is an underrated but critical skill for working effectively with LLMs.
She values building systems that are scalable and adaptable across different contexts.
She is committed to responsible AI development with a focus on robustness and safety.`,
  },
];