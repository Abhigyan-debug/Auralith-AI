import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTime(date: string | Date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function truncate(str: string, length: number) {
  return str.length > length ? str.substring(0, length) + '...' : str
}

export function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

export const AGENT_COLORS: Record<string, string> = {
  learning: 'from-brand-500 to-cyan-500',
  dsa: 'from-cyan-500 to-emerald-500',
  review: 'from-emerald-500 to-teal-500',
  debug: 'from-orange-500 to-red-500',
  interview: 'from-violet-500 to-brand-500',
  roadmap: 'from-brand-500 to-emerald-500',
  progress: 'from-teal-500 to-cyan-500',
  general: 'from-slate-500 to-brand-500',
}

export const AGENT_LABELS: Record<string, string> = {
  learning: 'Learning Agent',
  dsa: 'DSA Agent',
  review: 'Code Review Agent',
  debug: 'Debug Agent',
  interview: 'Interview Agent',
  roadmap: 'Roadmap Agent',
  progress: 'Progress Agent',
  general: 'Auralith AI',
}

export const AGENT_DESCRIPTIONS: Record<string, string> = {
  learning: 'Explains concepts, creates notes, generates examples',
  dsa: 'Solves problems with brute → optimal approach + complexity',
  review: 'Reviews code quality, detects bad practices, suggests fixes',
  debug: 'Finds and fixes runtime, logic, and compilation errors',
  interview: 'Conducts mock interviews and evaluates performance',
  roadmap: 'Generates personalized learning roadmaps and plans',
  progress: 'Tracks progress and identifies weak areas',
  general: 'Your personal AI coding mentor',
}
