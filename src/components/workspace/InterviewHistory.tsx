import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Trophy, TrendingUp, Clock, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { type InterviewResult } from '@/types'

function getScoreColor(score: number) {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-brand-400'
  if (score >= 40) return 'text-amber-400'
  return 'text-orange-400'
}

export function InterviewHistory() {
  const { user } = useAuth()
  const [results, setResults] = useState<InterviewResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadResults()
  }, [user])

  const loadResults = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('interview_results')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    if (data) setResults(data)
    setLoading(false)
  }

  const avgScore = results.length
    ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
    : 0
  const bestScore = results.length ? Math.max(...results.map(r => r.score)) : 0
  const totalMinutes = results.reduce((s, r) => s + r.duration_minutes, 0)

  const STATS = [
    { icon: GraduationCap, label: 'Interviews Taken', value: results.length, color: 'text-brand-400', bg: 'bg-brand-500/10', border: 'border-brand-500/20' },
    { icon: TrendingUp, label: 'Average Score', value: `${avgScore}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { icon: Trophy, label: 'Best Score', value: `${bestScore}%`, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { icon: Clock, label: 'Total Practice', value: `${totalMinutes}m`, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  ]

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Interview History</h1>
            <p className="text-slate-400 text-sm mt-0.5">Track your mock interview performance over time</p>
          </div>
          <button
            onClick={loadResults}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {STATS.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card p-4 border ${stat.border}`}
              >
                <div className={`w-8 h-8 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
              </motion.div>
            )
          })}
        </div>

        {results.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <GraduationCap className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No mock interviews yet.</p>
            <p className="text-slate-500 text-xs mt-1">Start a chat with the Interview Agent, then click "End Interview" to save your score here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">{r.interview_type}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {r.duration_minutes} min
                    </div>
                  </div>
                  <div className={`text-xl font-bold ${getScoreColor(r.score)}`}>{r.score}/100</div>
                </div>

                <p className="text-sm text-slate-300 mb-3">{r.feedback}</p>

                {r.topics_covered.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {r.topics_covered.map(topic => (
                      <span key={topic} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
