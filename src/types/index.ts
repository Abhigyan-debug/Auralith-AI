export interface User {
  id: string
  email: string
  created_at: string
}

export interface Profile {
  id: string
  user_id: string
  full_name: string | null
  username: string | null
  bio: string | null
  skill_level: 'beginner' | 'intermediate' | 'advanced'
  goals: string[]
  preferred_languages: string[]
  avatar_url: string | null
  github_url: string | null
  leetcode_username: string | null
  created_at: string
  updated_at: string
}

export interface Chat {
  id: string
  user_id: string
  title: string
  agent_type: AgentType
  created_at: string
  updated_at: string
  message_count?: number
}

export interface Message {
  id: string
  chat_id: string
  role: 'user' | 'assistant'
  content: string
  agent_type: AgentType
  metadata: Record<string, unknown>
  created_at: string
}

export interface ProgressReport {
  id: string
  user_id: string
  topic: string
  score: number
  problems_solved: number
  total_time_minutes: number
  created_at: string
}

export interface InterviewResult {
  id: string
  user_id: string
  interview_type: string
  score: number
  feedback: string
  topics_covered: string[]
  duration_minutes: number
  created_at: string
}

export interface Roadmap {
  id: string
  user_id: string
  title: string
  goal: string
  content: RoadmapContent
  created_at: string
}

export interface RoadmapContent {
  current_level: string
  target_level: string
  duration_weeks: number
  missing_skills: string[]
  weekly_plan: WeeklyPlan[]
  resources: Resource[]
}

export interface WeeklyPlan {
  week: number
  title: string
  topics: string[]
  goals: string[]
  problems: number
  completed?: boolean
}

export interface Resource {
  title: string
  type: 'video' | 'article' | 'practice' | 'book'
  url?: string
  description: string
}

export type AgentType =
  | 'learning'
  | 'dsa'
  | 'review'
  | 'debug'
  | 'interview'
  | 'roadmap'
  | 'progress'
  | 'general'

export interface AgentResponse {
  content: string
  agent_type: AgentType
  metadata?: {
    complexity?: string
    code?: string
    score?: number
    topics?: string[]
    suggestions?: string[]
  }
}

export interface TopicProgress {
  topic: string
  score: number
  problems_solved: number
  color: string
}

export interface CodeReviewResult {
  strengths: string[]
  weaknesses: string[]
  optimizations: string[]
  improved_code: string
  overall_score: number
  time_complexity: string
  space_complexity: string
}

export interface DebugResult {
  error_type: string
  error_cause: string
  fix_explanation: string
  corrected_code: string
  prevention_tips: string[]
}
