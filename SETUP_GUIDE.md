# 🚀 Complete Setup Guide — AI Portfolio Twin

This guide takes you from zero to a live website with a real 3D talking avatar,
Gemini AI, and Supabase database. Follow every step in order.

---

## WHAT YOU'LL HAVE AT THE END

- ✅ Live website at yourdomain.vercel.app (free)
- ✅ 3D human avatar that talks and lip-syncs
- ✅ Real Gemini AI answering questions about you
- ✅ Supabase database storing your personal info + every question visitors ask
- ✅ Total monthly cost: ~$0

---

## PART 1 — THINGS YOU NEED TO INSTALL FIRST

### Step 1: Install Node.js
Go to https://nodejs.org and download the LTS version.
Run the installer. When done, open Terminal (Mac) or Command Prompt (Windows) and type:
```
node --version
```
You should see something like v20.x.x — if so, you're good.

### Step 2: Install Git
Go to https://git-scm.com/downloads and install it.
After installing, run:
```
git --version
```

### Step 3: Get a code editor
Download VS Code from https://code.visualstudio.com — it's free.

---

## PART 2 — CREATE YOUR FREE ACCOUNTS

You need three free accounts. Create all three before continuing.

### Account 1: GitHub (stores your code)
1. Go to https://github.com
2. Click "Sign up" — use your email, create a username and password
3. Verify your email
4. Done ✅

### Account 2: Supabase (your database)
1. Go to https://supabase.com
2. Click "Start your project" → sign up with your GitHub account
3. You'll land on a dashboard — don't do anything yet, we'll set it up in Part 4
4. Done ✅

### Account 3: Vercel (hosts your website — makes it live)
1. Go to https://vercel.com
2. Click "Sign up" → sign up with your GitHub account
3. Done ✅

---

## PART 3 — GET YOUR GEMINI API KEY (FREE)

This is what powers the AI brain of your avatar.

1. Go to https://aistudio.google.com
2. Sign in with your Google account
3. Click "Get API Key" in the top left
4. Click "Create API Key"
5. Select "Create API key in new project"
6. Copy the key — it looks like: AIzaSyXXXXXXXXXXXXXXXXXXX
7. Paste it somewhere safe (Notepad, Notes app) — you'll need it later
8. Done ✅

FREE TIER: 1,000,000 tokens/month — more than enough for a portfolio site.

---

## PART 4 — SET UP YOUR SUPABASE DATABASE

This is where all your data lives — your personal knowledge base AND
every question visitors ask your avatar.

### Step 1: Create a new project
1. Go to https://supabase.com and log in
2. Click "New project"
3. Give it a name: ai-portfolio
4. Set a strong database password (save it somewhere)
5. Choose a region close to you
6. Click "Create new project"
7. Wait ~2 minutes for it to set up

### Step 2: Get your Supabase keys
1. In your project, click the gear icon ⚙️ (Project Settings) in the left sidebar
2. Click "API"
3. Copy these three values and save them:
   - Project URL → looks like: https://abcdefgh.supabase.co
   - anon/public key → long string starting with eyJ...
   - service_role key → another long string starting with eyJ... (keep this secret!)

### Step 3: Enable pgvector extension (for AI search)
1. In the left sidebar, click "Database"
2. Click "Extensions"
3. Search for "vector"
4. Toggle it ON
5. Click "Enable"

### Step 4: Create your database tables
1. In the left sidebar, click "SQL Editor"
2. Click "New query"
3. Copy and paste ALL of this SQL, then click "Run":

```sql
-- Enable vector extension (if not already done above)
create extension if not exists vector;

-- ────────────────────────────────────────────────
-- TABLE 1: knowledge_base
-- Stores everything about you (bio, projects, etc.)
-- The embedding column is for AI semantic search
-- ────────────────────────────────────────────────
create table if not exists knowledge_base (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,
  content     text not null,
  embedding   vector(768),
  created_at  timestamptz default now()
);

-- Index for fast similarity search
create index if not exists knowledge_base_embedding_idx
  on knowledge_base
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 10);

-- ────────────────────────────────────────────────
-- TABLE 2: chat_history
-- Stores EVERY question visitors ask your avatar
-- You can read these in the Supabase dashboard
-- ────────────────────────────────────────────────
create table if not exists chat_history (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz default now()
);

-- Index for fast session lookups
create index if not exists chat_history_session_idx
  on chat_history (session_id);

-- Index for date-based queries (to read recent conversations)
create index if not exists chat_history_date_idx
  on chat_history (created_at desc);

-- ────────────────────────────────────────────────
-- FUNCTION: match_knowledge
-- This is the RAG retrieval function — finds the
-- most relevant knowledge chunks for any question
-- ────────────────────────────────────────────────
create or replace function match_knowledge(
  query_embedding vector(768),
  match_count     int     default 4,
  match_threshold float   default 0.5
)
returns table (
  id         uuid,
  category   text,
  content    text,
  similarity float
)
language sql stable
as $$
  select
    id,
    category,
    content,
    1 - (embedding <=> query_embedding) as similarity
  from knowledge_base
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
```

4. You should see "Success. No rows returned" — that means it worked ✅

---

## PART 5 — SET UP THE CODE ON YOUR COMPUTER

### Step 1: Download the project files
The project files were provided to you (ai-portfolio folder).
Put them in a folder on your Desktop called: ai-portfolio

### Step 2: Open the project in VS Code
1. Open VS Code
2. Click File → Open Folder
3. Select your ai-portfolio folder
4. Click Open

### Step 3: Open the Terminal inside VS Code
Press: Ctrl + ` (backtick key, top-left of keyboard)
Or click: Terminal → New Terminal

### Step 4: Install dependencies
In the terminal, type this and press Enter:
```
npm install
```
Wait for it to finish (1-2 minutes). You'll see a node_modules folder appear.

### Step 5: Create your environment file
In the terminal, type:
```
cp .env.example .env.local
```
Or manually create a file called .env.local in the root of your project.

### Step 6: Fill in your environment variables
Open .env.local in VS Code and fill it in:

```
# Supabase (from Part 4, Step 2)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key...
SUPABASE_SERVICE_KEY=eyJhbGc...your-service-key...

# Gemini (from Part 3)
GEMINI_API_KEY=AIzaSy...your-gemini-key...

# Seed secret (make up any password — used to protect the seed endpoint)
SEED_SECRET=mySecretSeedPassword123
```

Replace everything after the = signs with your actual values.
Never share this file or commit it to GitHub.

---

## PART 6 — FILL IN YOUR PERSONAL INFORMATION

This is what your AI twin will actually know about you.

### Open this file: src/config/persona.ts

This is the ONLY file you need to edit to make the site yours.

### Section 1: Basic info
```typescript
name: "Your Real Name",
title: "Your Role · Your Specialty · Your Vibe",
navBrand: "YN.AI",  // your initials + AI
```

### Section 2: Greetings (what the avatar says on load)
```typescript
greetings: [
  "Hi, I'm [Your Name] — [one line about you]. Ask me anything.",
  "Welcome to my AI-native portfolio. [something unique about you].",
  "[Another interesting intro line]",
],
```

### Section 3: Knowledge base (THE MOST IMPORTANT PART)
Scroll down to KNOWLEDGE_BASE in persona.ts and replace all the placeholder
text with YOUR actual information. Be specific — the more detail you give,
the better your AI twin will answer questions.

Replace these sections with your real info:

BIO: Your background, where you're from, what you do, your story
```typescript
{
  category: "bio",
  content: `[Your Name] is a [your profession] based in [your city].
[2-3 sentences about your background and what makes you unique].
[Your mission or what drives you].`,
},
```

CONTACT: Your actual email, social links, etc.
```typescript
{
  category: "contact",  
  content: `Contact [Your Name]:
Email: your@email.com
GitHub: github.com/yourusername
LinkedIn: linkedin.com/in/yourusername
Twitter: @yourhandle`,
},
```

PROJECTS: Your actual projects (not the examples)
```typescript
{
  category: "projects",
  content: `[Your Name]'s projects:

1. [Project Name]: [What it does, tech used, outcome/impact]
2. [Project Name]: [What it does, tech used, outcome/impact]
3. [Project Name]: [What it does, tech used, outcome/impact]`,
},
```

Add as many knowledge entries as you want. The more you add,
the smarter and more accurate your AI twin becomes.

---

## PART 7 — SEED YOUR DATABASE (UPLOAD YOUR INFO TO SUPABASE)

This step takes your personal info from persona.ts, generates AI embeddings,
and uploads everything to your Supabase database.

### Step 1: Start the development server
In the VS Code terminal:
```
npm run dev
```
Wait until you see "Ready - started server on http://localhost:3000"

### Step 2: Open a NEW terminal tab
Click the + button in the terminal panel to open a second terminal.

### Step 3: Run the seed command
```
curl -X POST "http://localhost:3000/api/seed?secret=mySecretSeedPassword123"
```
Replace mySecretSeedPassword123 with whatever you put in SEED_SECRET.

You should see a response like:
```json
{"seeded": 8, "results": [{"category": "bio", "status": "ok"}, ...]}
```

### Step 4: Verify it worked
1. Go to your Supabase dashboard
2. Click "Table Editor" in the left sidebar
3. Click on "knowledge_base"
4. You should see rows with your content ✅

### Step 5: Test your site locally
Open http://localhost:3000 in your browser.
Click "Talk to AI" and ask a question about yourself.
The avatar should respond with information from your knowledge base.

---

## PART 8 — PUSH CODE TO GITHUB

### Step 1: Create a new GitHub repository
1. Go to https://github.com
2. Click the + icon → "New repository"
3. Name it: ai-portfolio
4. Set it to Private (so your .env.local isn't exposed — actually .gitignore handles this)
5. Do NOT check "Add a README"
6. Click "Create repository"

### Step 2: Connect and push your code
In the VS Code terminal (stop npm run dev first with Ctrl+C, then):
```
git init
git add .
git commit -m "Initial commit — AI portfolio"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/ai-portfolio.git
git push -u origin main
```
Replace YOURUSERNAME with your actual GitHub username.

When prompted, enter your GitHub username and password.
(If password doesn't work, you need a Personal Access Token — 
go to GitHub → Settings → Developer settings → Personal access tokens → Generate new token)

---

## PART 9 — DEPLOY TO VERCEL (MAKE IT LIVE)

### Step 1: Import your project
1. Go to https://vercel.com and log in
2. Click "Add New..." → "Project"
3. You'll see your GitHub repositories listed
4. Find "ai-portfolio" and click "Import"

### Step 2: Add environment variables
IMPORTANT: Before clicking Deploy, scroll down to "Environment Variables"
and add ALL your variables from .env.local:

Click "Add" for each one:
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project-id.supabase.co

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY  
Value: eyJhbGc...your-anon-key...

Name: SUPABASE_SERVICE_KEY
Value: eyJhbGc...your-service-key...

Name: GEMINI_API_KEY
Value: AIzaSy...your-gemini-key...

Name: SEED_SECRET
Value: mySecretSeedPassword123
```

### Step 3: Deploy
Click "Deploy".
Wait 2-3 minutes.
You'll get a URL like: https://ai-portfolio-username.vercel.app

Your site is now LIVE! 🎉

### Step 4: Seed the live database
Your Supabase database already has data from Part 7 (you seeded it locally).
The same Supabase database is used by both local and live — you're done!

---

## PART 10 — GET A CUSTOM DOMAIN (OPTIONAL, FREE)

If you want yourname.com instead of yourname.vercel.app:

Option A — Free subdomain:
Vercel gives you username.vercel.app for free — no extra steps needed.

Option B — Buy a domain (~$10-15/year):
1. Buy a domain at Namecheap or Google Domains
2. In Vercel → your project → Settings → Domains
3. Add your domain and follow Vercel's DNS instructions
4. Takes ~24 hours to propagate

---

## PART 11 — VIEWING VISITOR QUESTIONS

Every question anyone asks your avatar is stored in Supabase.
To read them:

1. Go to https://supabase.com → your project
2. Click "Table Editor" → "chat_history"
3. You'll see every conversation with timestamps
4. You can filter by date, export as CSV, etc.

To see the most recent questions:
1. In Supabase, click "SQL Editor"
2. Run this query:
```sql
select session_id, role, content, created_at
from chat_history
order by created_at desc
limit 50;
```

---

## PART 12 — CUSTOMISING YOUR 3D AVATAR

The default avatar is a female 3D character. To use a different avatar:

### Option A — PlayerZero (free RPM successor)
1. Go to https://dev.playerzero.app
2. Create a free account
3. Build your avatar (male/female, customize appearance)
4. Click "Export" → Download GLB file
5. Put the file in /public/avatar.glb in your project
6. In src/components/TalkingAvatar.tsx, change:
   AVATAR_URL = "/avatar.glb"

### Option B — Use a different free GLB avatar
Any GLB file with ARKit viseme blend shapes will work.
Sites with free avatars: Sketchfab (filter by "ARKit"), Avaturn.me

### Option C — Keep the default
The brunette.glb default avatar works great and looks very realistic.
You can focus on the content (persona.ts) rather than the avatar.

---

## PART 13 — UPDATING YOUR INFO LATER

When you want to add new projects, update your bio, etc.:

1. Edit src/config/persona.ts with new information
2. Clear old knowledge and re-seed:

In Supabase SQL Editor, run:
```sql
delete from knowledge_base;
```

Then re-seed:
```
curl -X POST "https://your-vercel-url.vercel.app/api/seed?secret=mySecretSeedPassword123"
```

3. Push changes to GitHub:
```
git add .
git commit -m "Updated knowledge base"
git push
```
Vercel automatically redeploys in ~2 minutes.

---

## TROUBLESHOOTING

### "npm install" fails
Make sure Node.js is installed. Try: node --version
If no version shows, reinstall Node from nodejs.org

### Avatar doesn't load
The TalkingHead library loads from CDN on first visit.
Check your internet connection. Try a hard refresh (Ctrl+Shift+R).

### AI gives wrong answers
The knowledge base may not be seeded. Run the seed step again.
Check Supabase → Table Editor → knowledge_base has rows.

### Vercel deployment fails
Check the build log in Vercel dashboard.
Most common cause: missing environment variables.
Make sure ALL variables from .env.local are in Vercel settings.

### "Unauthorized" when seeding
Make sure SEED_SECRET in Vercel matches what you're using in the curl command.

### Chat not working on live site
Check browser console (F12) for errors.
Make sure GEMINI_API_KEY is correctly set in Vercel environment variables.

---

## SUMMARY — WHAT EACH SERVICE DOES

| Service     | What it does                          | Cost      |
|-------------|---------------------------------------|-----------|
| Vercel      | Hosts your website, makes it live    | FREE      |
| Supabase    | Database — stores your info + chats  | FREE      |
| Gemini API  | AI brain — answers questions         | FREE      |
| TalkingHead | 3D avatar rendering + lip sync       | FREE      |
| GitHub      | Stores your code                     | FREE      |
| Browser TTS | Avatar's voice                       | FREE      |
| TOTAL       |                                       | ~$0/month |

---

## NEED HELP?

If you get stuck on any step, the most useful things to share are:
1. What step you're on
2. The exact error message you see
3. Which operating system you're using (Mac/Windows/Linux)

Good luck! 🚀
