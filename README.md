# Auralith AI

Code. Create. Elevate.

Auralith AI is a multi-agent AI coding mentor. One chat interface transparently routes each message to one of eight specialist agents — learning, DSA practice, code review, debugging, mock interviews, roadmaps, progress tracking, and general Q&A — backed by Supabase for auth/storage and Groq (`openai/gpt-oss-120b`) for generation.

## Features

- **Auto-routed chat** — messages are classified by intent (or you can pin an agent manually) and answered with a structure tailored to that agent: brute-force → optimal for DSA, strengths/issues/rewrite for code review, root-cause/fix for debugging, and so on.
- **Progress tracking** — every DSA exchange is matched to a topic (Arrays, Trees, DP, etc.) and nudges that topic's score in `progress_reports`; the AI Insights panel and Progress Dashboard reflect it live.
- **Mock interviews with scoring** — end an interview session and the transcript is graded into a score, feedback, and covered topics, saved to your interview history.
- **Persistent, trackable roadmaps** — turn a roadmap conversation into a structured plan with checkable weekly milestones instead of just chat text.
- **Profile & settings** — skill level, goals, preferred languages, GitHub/LeetCode handles.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | Supabase (Postgres, Auth, Edge Functions) |
| AI | Groq API (`openai/gpt-oss-120b`) |
| Markdown rendering | react-markdown + remark-gfm |

## Project structure

```
src/
  components/
    landing/     marketing page sections
    workspace/    chat, sidebar, progress, interview history, roadmaps, settings
    shared/       logo, navbar, protected route
  contexts/       Supabase auth context
  pages/          Landing, Auth, Workspace
  lib/            supabase client, utils
  types/          shared TypeScript types
supabase/
  functions/ai-agent/   edge function: intent routing, system prompts, Groq calls,
                        interview grading, roadmap generation
  migrations/           schema: profiles, chats, messages, roadmaps,
                        interview_results, progress_reports, documents
```

## Getting started

```bash
npm install
npm run dev
```

Requires a Supabase project (schema pushed from `supabase/migrations/`, with the
`ai-agent` edge function deployed) and a Groq API key configured as a project secret.

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
