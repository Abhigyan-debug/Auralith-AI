import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, TrendingUp, Target, BookOpen, AlertCircle,
  ChevronRight, Brain, Trophy, Flame,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { type AgentType } from '@/types'
import { cn } from '@/lib/utils'

interface RightPanelProps {
  activeAgentType: AgentType
  refreshKey?: number
}

interface TopicScore {
  topic: string
  score: number
  problems_solved: number
}

const TOPIC_COLORS: Record<string, string> = {
  Arrays: 'bg-brand-500',
  Strings: 'bg-cyan-500',
  'Linked Lists': 'bg-emerald-500',
  Trees: 'bg-teal-500',
  Graphs: 'bg-violet-500',
  'Dynamic Programming': 'bg-amber-500',
  Sorting: 'bg-orange-500',
  'Binary Search': 'bg-rose-500',
  Recursion: 'bg-brand-400',
  Hashing: 'bg-cyan-400',
}

const COMPLEXITY_INFO: Record<AgentType, { title: string; items: string[] }> = {
  dsa: {
    title: 'Complexity Guide',
    items: ['O(1) Constant', 'O(log n) Logarithmic', 'O(n) Linear', 'O(n log n) Linearithmic', 'O(n²) Quadratic'],
  },
  learning: {
    title: 'Learning Tips',
    items: ['Practice daily', 'Write code by hand', 'Teach others', 'Build projects', 'Review past topics'],
  },
  review: {
    title: 'Review Checklist',
    items: ['Edge cases covered?', 'Time complexity optimal?', 'Clean variable names?', 'No code duplication?', 'Error handling present?'],
  },
  debug: {
    title: 'Debug Strategies',
    items: ['Read the error message', 'Add print statements', 'Rubber duck debug', 'Check boundary values', 'Verify data types'],
  },
  interview: {
    title: 'Interview Tips',
    items: ['Clarify before coding', 'Think out loud', 'Start with brute force', 'Optimize step by step', 'Test your solution'],
  },
  roadmap: {
    title: 'Roadmap Phases',
    items: ['Foundation (Arrays, Strings)', 'Intermediate (Trees, Graphs)', 'Advanced (DP, Greedy)', 'Practice (LeetCode 150)', 'Mock Interviews'],
  },
  progress: {
    title: 'Study Metrics',
    items: ['Daily streak', 'Weekly problems', 'Topic coverage', 'Interview readiness', 'Weak area focus'],
  },
  general: {
    title: 'Quick Reference',
    items: ['Ask any coding question', 'Paste code for review', 'Describe bugs', 'Request study plans', 'Start mock interview'],
  },
}

export function RightPanel({ activeAgentType, refreshKey }: RightPanelProps) {
  const { user } = useAuth()
  const [topics, setTopics] = useState<TopicScore[]>([])
  const [totalProblems, setTotalProblems] = useState(0)
  const [avgScore, setAvgScore] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadProgress()
  }, [user, refreshKey])

  const loadProgress = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('progress_reports')
      .select('topic, score, problems_solved')
      .eq('user_id', user!.id)
      .order('score', { ascending: false })

    if (data && data.length > 0) {
      setTopics(data)
      setTotalProblems(data.reduce((s, r) => s + r.problems_solved, 0))
      setAvgScore(Math.round(data.reduce((s, r) => s + r.score, 0) / data.length))
    }
    setLoading(false)
  }

  const contextInfo = COMPLEXITY_INFO[activeAgentType]
  const weakTopics = topics.filter(t => t.score < 50).slice(0, 3)
  const strongTopics = topics.filter(t => t.score >= 70).slice(0, 3)

  return (
    <aside className="w-72 h-full bg-surface-925 border-l border-white/5 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-white/5 flex-shrink-0">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Brain className="w-4 h-4 text-brand-400" />
          AI Insights
        </h2>
      </div>

      <div className="p-3 space-y-4 flex-1">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="glass-card p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold gradient-text">{totalProblems}</div>
            <div className="text-xs text-slate-500">Solved</div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <div className="text-xl font-bold gradient-text">{avgScore}%</div>
            <div className="text-xs text-slate-500">Avg Score</div>
          </div>
        </div>

        {/* Progress by topic */}
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs font-semibold text-white">Topic Progress</span>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton h-4 rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {topics.slice(0, 8).map((t) => (
                <div key={t.topic}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-400 truncate">{t.topic}</span>
                    <span className="text-xs text-slate-500 ml-2 flex-shrink-0">{t.score}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${TOPIC_COLORS[t.topic] ?? 'bg-brand-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${t.score}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weak areas */}
        {weakTopics.length > 0 && (
          <div className="glass-card p-3 border-orange-500/10">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-semibold text-white">Needs Attention</span>
            </div>
            <div className="space-y-1.5">
              {weakTopics.map((t) => (
                <div key={t.topic} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{t.topic}</span>
                  <span className="text-xs text-orange-400 font-medium">{t.score}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strong topics */}
        {strongTopics.length > 0 && (
          <div className="glass-card p-3 border-emerald-500/10">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-white">Strong Areas</span>
            </div>
            <div className="space-y-1.5">
              {strongTopics.map((t) => (
                <div key={t.topic} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{t.topic}</span>
                  <span className="text-xs text-emerald-400 font-medium">{t.score}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Context info */}
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-white">{contextInfo.title}</span>
          </div>
          <div className="space-y-1.5">
            {contextInfo.items.map((item) => (
              <div key={item} className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 text-slate-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-slate-400">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation */}
        <div className="glass-card p-3 border-brand-500/20 bg-brand-500/5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs font-semibold text-brand-300">Today's Goal</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {weakTopics.length > 0
              ? `Focus on ${weakTopics[0].topic} — solve 3 problems to improve your score.`
              : 'Great job! Tackle a hard LeetCode problem to push your limits.'}
          </p>
        </div>
      </div>
    </aside>
  )
}
