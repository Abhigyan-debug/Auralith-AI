import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") ?? "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-120b";

type AgentType =
  | "learning"
  | "dsa"
  | "review"
  | "debug"
  | "interview"
  | "roadmap"
  | "progress"
  | "general";

function detectIntent(message: string): AgentType {
  const m = message.toLowerCase();

  if (/\b(bug|error|fix|crash|exception|undefined|null|syntax|runtime|compile|traceback|stacktrace|not working|broken|issue|problem with my code)\b/.test(m))
    return "debug";

  if (/\b(review|refactor|optimize|clean|readability|best practice|code quality|smell|improve my (code|solution|function))\b/.test(m))
    return "review";

  if (/\b(interview|mock|hr question|behavioral|system design|oop interview|dbms interview|os interview|hire|placement)\b/.test(m))
    return "interview";

  if (/\b(roadmap|learning path|study plan|curriculum|how to learn|where to start|beginner to|internship prep|job ready|career path)\b/.test(m))
    return "roadmap";

  if (/\b(progress|weak|topic analysis|how am i doing|performance|score|report|dashboard|analytics)\b/.test(m))
    return "progress";

  if (/\b(leetcode|problem|solution|algorithm|solve|two sum|binary search|linked list|tree|graph|dp|dynamic programming|brute force|optimal|complexity|big o|time complexity|space complexity)\b/.test(m))
    return "dsa";

  if (/\b(explain|teach|what is|how does|concept|understand|learn|example|notes|definition|difference between|vs\b)\b/.test(m))
    return "learning";

  return "general";
}

const TOPIC_PATTERNS: Array<{ topic: string; pattern: RegExp }> = [
  { topic: "Dynamic Programming", pattern: /\b(dynamic programming|\bdp\b|memoiz|tabulation|knapsack|subsequence|subset sum)\b/ },
  { topic: "Binary Search", pattern: /\b(binary search|log n search|search.*sorted array)\b/ },
  { topic: "Linked Lists", pattern: /\b(linked list|listnode|singly linked|doubly linked|\.next\b)\b/ },
  { topic: "Graphs", pattern: /\b(graph|adjacency|dijkstra|topological sort|connected component|bipartite|union find)\b/ },
  { topic: "Trees", pattern: /\b(binary tree|\btree\b|treenode|\bbst\b|inorder|preorder|postorder|leaf node)\b/ },
  { topic: "Hashing", pattern: /\b(hash ?map|hash ?set|hashing|hash table|frequency map|dictionary lookup)\b/ },
  { topic: "Recursion", pattern: /\b(recursion|recursive|backtrack)\b/ },
  { topic: "Sorting", pattern: /\b(sort|quicksort|mergesort|bubble sort|insertion sort)\b/ },
  { topic: "Strings", pattern: /\b(substring|anagram|palindrome|string manipulation)\b/ },
  { topic: "Arrays", pattern: /\b(array|subarray|matrix|in-place|two pointer|sliding window)\b/ },
];

function matchTopic(text: string): string | null {
  for (const { topic, pattern } of TOPIC_PATTERNS) {
    if (pattern.test(text)) return topic;
  }
  return null;
}

function detectTopic(message: string, content: string): string | null {
  // Prefer the user's stated intent — DSA explanations often reference other
  // techniques in passing (e.g. an Arrays problem solved via a "dynamic
  // programming approach" like Kadane's algorithm), which makes scanning the
  // full response an unreliable signal on its own.
  return matchTopic(message.toLowerCase()) ?? matchTopic(content.toLowerCase());
}

function getSystemPrompt(agentType: AgentType): string {
  const base = `You are CodeMentor AI, a world-class AI coding mentor. Always format responses with clear structure using markdown: headings (**Title**), bullet points (- item), numbered lists, and fenced code blocks (\`\`\`language\n...\`\`\`). Keep explanations precise and practical. Never hallucinate — if unsure, say so.`;

  const prompts: Record<AgentType, string> = {
    learning: `${base}
You are the Learning Agent. Explain concepts step-by-step with clear theory, real-world analogies, and practical code examples. Structure your response as:
1. Concept overview
2. Key points (bullet list)
3. Code example with explanation
4. Common pitfalls to avoid
5. Practice problems to try`,

    dsa: `${base}
You are the DSA Agent. For every problem, follow this exact structure:
**Problem Understanding**
- Restate the problem clearly
**Brute Force Approach**
- Explain the naive solution with code
- Time/Space: O(?) / O(?)
**Optimized Approach**
- Explain the better solution with code
**Optimal Approach**
- Best possible solution with full code
- Dry run with example input
**Complexity Analysis**
- Time Complexity: O(?)
- Space Complexity: O(?)`,

    review: `${base}
You are the Code Review Agent. Analyze submitted code and respond with:
**Strengths**
- What the code does well
**Issues Found**
- Bugs, bad practices, missing edge cases (numbered list)
**Optimizations**
- Performance and readability improvements
**Improved Version**
\`\`\`language
// Full rewritten code
\`\`\`
**Overall Score: X/10**`,

    debug: `${base}
You are the Debug Agent. For every bug/error, follow this structure:
**Error Identified**
- Type and location of the error
**Root Cause**
- Why this error occurs (clear explanation)
**Fix**
- Step-by-step explanation of the solution
**Corrected Code**
\`\`\`language
// Fixed code here
\`\`\`
**Prevention Tips**
- How to avoid this in the future`,

    interview: `${base}
You are the Interview Agent conducting a mock technical interview. Ask one question at a time and wait for the answer before proceeding. Evaluate answers with:
**Score: X/10**
**Feedback:** What was good and what was missing
**Model Answer:** The ideal response
Then ask the next question. For DSA interviews, ask coding problems. For system design, ask architecture questions. For HR, ask behavioral questions using the STAR format.`,

    roadmap: `${base}
You are the Roadmap Agent. Create detailed, personalized learning roadmaps. Structure as:
**Current Level Assessment**
**Target Goal**
**Missing Skills** (prioritized list)
**Weekly Study Plan** (week-by-week breakdown)
**Recommended Resources** (free + paid, with type: video/article/practice)
**Monthly Milestones**
Be specific with topics, not vague. Include LeetCode problem counts per topic.`,

    progress: `${base}
You are the Progress Tracking Agent. Analyze user progress data and provide:
**Performance Summary**
**Strongest Topics** (with scores)
**Weak Areas** (need attention)
**Recommended Focus** (3 specific topics to work on next)
**Study Recommendations** (specific problems/resources)
**Weekly Goal Suggestion**`,

    general: `${base}
You are CodeMentor AI — an expert coding mentor for students and developers. You can help with:
- Learning programming concepts (ask me to explain anything)
- Solving DSA/LeetCode problems
- Reviewing and improving code
- Debugging errors
- Mock interviews
- Learning roadmaps
Detect what the user needs and respond as the appropriate specialist.`,
  };

  return prompts[agentType];
}

function extractJSON(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Could not parse structured JSON from model response");
  }
}

const INTERVIEW_GRADING_PROMPT = `You are an interview grading assistant. You will receive the full transcript of a mock technical interview between an AI interviewer and a candidate. Analyze the ENTIRE conversation and respond with ONLY a JSON object — no markdown, no code fences, no explanation outside the JSON — in exactly this shape:
{
  "interview_type": "<one of: DSA, System Design, Behavioral, OOP, DBMS, OS, Mixed>",
  "score": <integer 0-100>,
  "feedback": "<2-4 sentence summary of strengths and weaknesses>",
  "topics_covered": ["<topic1>", "<topic2>"]
}
Base the score on correctness, clarity of communication, problem-solving approach, and completeness of answers. If the candidate barely answered anything substantively, score low (0-20) and say so in the feedback.`;

interface InterviewGrade {
  interview_type: string;
  score: number;
  feedback: string;
  topics_covered: string[];
}

async function gradeInterview(history: Array<{ role: string; content: string }>): Promise<InterviewGrade> {
  const transcript = history.map((h) => `${h.role.toUpperCase()}: ${h.content}`).join("\n\n");
  const raw = await callGroq(INTERVIEW_GRADING_PROMPT, [], transcript);
  const parsed = extractJSON(raw) as Partial<InterviewGrade>;

  return {
    interview_type: typeof parsed.interview_type === "string" ? parsed.interview_type : "Mixed",
    score: Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0))),
    feedback: typeof parsed.feedback === "string" ? parsed.feedback : "No feedback generated.",
    topics_covered: Array.isArray(parsed.topics_covered) ? parsed.topics_covered.map(String) : [],
  };
}

const ROADMAP_GENERATION_PROMPT = `You are a roadmap-generation assistant. You will receive the transcript of a conversation between an AI roadmap agent and a user discussing their learning goals. Extract or infer the details and respond with ONLY a JSON object — no markdown, no code fences, no explanation outside the JSON — in exactly this shape:
{
  "title": "<short roadmap title, e.g. 'SDE Interview Prep Roadmap'>",
  "goal": "<the user's stated goal in one sentence>",
  "current_level": "<assessed current skill level>",
  "target_level": "<the target level to reach>",
  "duration_weeks": <integer, total weeks>,
  "missing_skills": ["<skill1>", "<skill2>"],
  "weekly_plan": [
    { "week": 1, "title": "<week title>", "topics": ["<topic1>"], "goals": ["<goal1>"], "problems": <integer, LeetCode-style problem count for the week> }
  ],
  "resources": [
    { "title": "<resource title>", "type": "<one of: video, article, practice, book>", "url": "<url or omit>", "description": "<one line>" }
  ]
}
Be specific with topics and weeks — cover the full duration_weeks with one weekly_plan entry per week. If the conversation didn't fully specify something, make a reasonable inference rather than leaving it vague.`;

async function generateRoadmap(history: Array<{ role: string; content: string }>): Promise<unknown> {
  const transcript = history.map((h) => `${h.role.toUpperCase()}: ${h.content}`).join("\n\n");
  const raw = await callGroq(ROADMAP_GENERATION_PROMPT, [], transcript);
  return extractJSON(raw);
}

async function callGroq(
  systemPrompt: string,
  history: Array<{ role: string; content: string }>,
  userMessage: string
): Promise<string> {
  if (!GROQ_API_KEY) {
    return "**API Key Missing**\n\nThe `GROQ_API_KEY` secret is not configured. Please add it in Supabase Dashboard → Project Settings → Edge Functions → Secrets.\n\nOnce added, I'll be fully operational!";
  }

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: userMessage },
  ];

  const body = {
    model: GROQ_MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 4096,
  };

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;

  if (!text) throw new Error("Empty response from Groq API");
  return text;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { message, agent_type, history = [], action } = await req.json();

    if (action === "end_interview" || action === "generate_roadmap") {
      if (!Array.isArray(history) || history.length === 0) {
        return new Response(
          JSON.stringify({ error: "Not enough conversation to analyze" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result =
        action === "end_interview" ? await gradeInterview(history) : await generateRoadmap(history);

      return new Response(JSON.stringify({ result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resolvedAgent: AgentType =
      agent_type === "general" || !agent_type
        ? detectIntent(message)
        : (agent_type as AgentType);

    const systemPrompt = getSystemPrompt(resolvedAgent);
    const content = await callGroq(systemPrompt, history, message);

    const topic = resolvedAgent === "dsa" ? detectTopic(message, content) : null;

    return new Response(
      JSON.stringify({
        content,
        agent_type: resolvedAgent,
        metadata: topic ? { topic } : {},
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
