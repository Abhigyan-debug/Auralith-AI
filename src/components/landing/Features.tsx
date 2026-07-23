import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Brain, Code2, Bug, MessageSquare, Map, BarChart3,
  FileCode, Zap, Shield, BookOpen,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Brain,
    title: 'Learning Agent',
    description: 'Get personalized explanations for any concept — from basics to advanced topics with interactive examples.',
    color: 'text-brand-400',
    bg: 'bg-brand-500/10',
    border: 'border-brand-500/20',
    gradient: 'from-brand-500/20 to-brand-600/5',
  },
  {
    icon: Code2,
    title: 'DSA Problem Solver',
    description: 'Step-by-step solutions from brute force to optimal, with dry runs and complexity analysis.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    gradient: 'from-cyan-500/20 to-cyan-600/5',
  },
  {
    icon: FileCode,
    title: 'Code Review Agent',
    description: 'Detailed code reviews detecting bad practices, suggesting optimizations, and improving readability.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    gradient: 'from-emerald-500/20 to-emerald-600/5',
  },
  {
    icon: Bug,
    title: 'Debug Agent',
    description: 'Instantly detect and fix runtime errors, logic bugs, TLE/MLE issues, and infinite loops.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    gradient: 'from-orange-500/20 to-orange-600/5',
  },
  {
    icon: MessageSquare,
    title: 'Mock Interview Agent',
    description: 'Practice DSA, OOP, DBMS, OS, and HR interviews with AI evaluation and detailed feedback.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    gradient: 'from-violet-500/20 to-violet-600/5',
  },
  {
    icon: Map,
    title: 'Roadmap Generator',
    description: 'Personalized learning roadmaps with skill gap analysis, weekly targets, and resource recommendations.',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
    gradient: 'from-teal-500/20 to-teal-600/5',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracker',
    description: 'Track solved problems by topic, detect weak areas, and generate detailed progress reports.',
    color: 'text-brand-400',
    bg: 'bg-brand-500/10',
    border: 'border-brand-500/20',
    gradient: 'from-brand-500/20 to-brand-600/5',
  },
  {
    icon: BookOpen,
    title: 'RAG Knowledge Base',
    description: 'Upload DSA notes, interview prep PDFs, and study materials. AI learns from your documents.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    gradient: 'from-cyan-500/20 to-cyan-600/5',
  },
  {
    icon: Zap,
    title: 'AI Study Planner',
    description: 'Daily goals, weekly plans, and monthly progress — intelligently adapted to your schedule.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    gradient: 'from-amber-500/20 to-amber-600/5',
  },
  {
    icon: Shield,
    title: 'Resume Analyzer',
    description: 'Get ATS score, identify missing skills, and receive tailored improvement suggestions.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    gradient: 'from-rose-500/20 to-rose-600/5',
  },
]

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const Icon = feature.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 5) * 0.1 }}
      className={`group relative glass-card p-6 hover:border-white/15 transition-all duration-300 hover:-translate-y-1`}
    >
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className="relative">
        <div className={`inline-flex p-2.5 rounded-xl ${feature.bg} border ${feature.border} mb-4`}>
          <Icon className={`w-5 h-5 ${feature.color}`} />
        </div>
        <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
      </div>
    </motion.div>
  )
}

export function Features() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <section id="features" className="py-24 bg-surface-950 relative">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="container max-w-6xl mx-auto px-6 relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-slate-400 text-xs font-medium mb-5">
            Everything You Need
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            One Platform, <span className="gradient-text">All You Need to Succeed</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
            From learning new concepts to cracking top-tier interviews, every tool you need is powered by specialized AI agents working together.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
