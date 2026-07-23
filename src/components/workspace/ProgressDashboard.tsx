import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Target, Trophy, Flame, BookOpen, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface TopicRow {
  id: string
  topic: string
  score: number
  problems_solved: number
  total_time_minutes: number
}

const TOPIC_COLORS: Record<string, string> = {
  Arrays: 'from-brand-500 to-brand-600',
  Strings: 'from-cyan-500 to-cyan-600',
  'Linked Lists': 'from-emerald-500 to-emerald-600',
  Trees: 'from-teal-500 to-teal-600',
  Graphs: 'from-violet-500 to-violet-600',
  'Dynamic Programming': 'from-amber-500 to-amber-600',
  Sorting: 'from-orange-500 to-orange-600',
  'Binary Search': 'from-rose-500 to-rose-600',
  Recursion: 'from-sky-500 to-sky-600',
  Hashing: 'from-fuchsia-500 to-fuchsia-600',
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-brand-400'
  if (score >= 40) return 'text-amber-400'
  return 'text-orange-400'
}

function getScoreLabel(score: number) {
  if (score >= 80) return 'Strong'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  if (score > 0) return 'Weak'
  return 'Not Started'
}

export function ProgressDashboard() {
  const { user } = useAuth()
  const [topics, setTopics] = useState<TopicRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingTopic, setEditingTopic] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ score: number; problems_solved: number }>({ score: 0, problems_solved: 0 })

  useEffect(() => {
    if (user) loadProgress()
  }, [user])

  const loadProgress = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('progress_reports')
      .select('*')
      .eq('user_id', user!.id)
      .order('topic')
    if (data) setTopics(data)
    setLoading(false)
  }

  const startEdit = (topic: TopicRow) => {
    setEditingTopic(topic.id)
    setEditValues({ score: topic.score, problems_solved: topic.problems_solved })
  }

  const saveEdit = async (topicId: string) => {
    setSaving(true)
    await supabase
      .from('progress_reports')
      .update({ score: editValues.score, problems_solved: editValues.problems_solved })
      .eq('id', topicId)
    setEditingTopic(null)
    await loadProgress()
    setSaving(false)
  }

  const totalProblems = topics.reduce((s, t) => s + t.problems_solved, 0)
  const avgScore = topics.length ? Math.round(topics.reduce((s, t) => s + t.score, 0) / topics.length) : 0
  const strongCount = topics.filter(t => t.score >= 70).length
  const weakTopics = topics.filter(t => t.score < 50 && t.score >= 0).slice(0, 3)

  const STATS = [
    { icon: Trophy, label: 'Problems Solved', value: totalProblems, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { icon: BarChart3, label: 'Average Score', value: `${avgScore}%`, color: 'text-brand-400', bg: 'bg-brand-500/10', border: 'border-brand-500/20' },
    { icon: TrendingUp, label: 'Strong Topics', value: strongCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { icon: Flame, label: 'Topics Tracked', value: topics.length, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Progress Dashboard</h1>
            <p className="text-slate-400 text-sm mt-0.5">Track your coding journey by topic</p>
          </div>
          <button
            onClick={loadProgress}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {/* Stats */}
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

        {/* Weak areas callout */}
        {weakTopics.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 glass-card p-4 border-orange-500/20 bg-orange-500/5"
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-white">Focus Areas</span>
            </div>
            <p className="text-sm text-slate-400">
              Prioritize these topics:{' '}
              {weakTopics.map(t => (
                <span key={t.topic} className="text-orange-400 font-medium">{t.topic}</span>
              )).reduce<React.ReactNode[]>((acc, el, i) => i === 0 ? [el] : [...acc, ', ', el], [])}
            </p>
          </motion.div>
        )}

        {/* Topic grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {topics.map((topic, i) => {
            const isEditing = editingTopic === topic.id
            const gradient = TOPIC_COLORS[topic.topic] ?? 'from-brand-500 to-brand-600'

            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card p-4 hover:border-white/15 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient}`} />
                    <span className="text-sm font-semibold text-white">{topic.topic}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/5 ${getScoreColor(topic.score)}`}>
                    {getScoreLabel(topic.score)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-3">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${topic.score}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.04 }}
                  />
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-slate-500 mb-1 block">Score (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={editValues.score}
                          onChange={e => setEditValues(v => ({ ...v, score: Math.min(100, Math.max(0, +e.target.value)) }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-500/50"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-slate-500 mb-1 block">Problems</label>
                        <input
                          type="number"
                          min={0}
                          value={editValues.problems_solved}
                          onChange={e => setEditValues(v => ({ ...v, problems_solved: Math.max(0, +e.target.value) }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-500/50"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(topic.id)}
                        disabled={saving}
                        className="flex-1 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingTopic(null)}
                        className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 text-xs rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className={`text-base font-bold ${getScoreColor(topic.score)}`}>{topic.score}%</div>
                        <div className="text-xs text-slate-600">score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-base font-bold text-white">{topic.problems_solved}</div>
                        <div className="text-xs text-slate-600">problems</div>
                      </div>
                    </div>
                    <button
                      onClick={() => startEdit(topic)}
                      className="text-xs text-slate-500 hover:text-brand-400 transition-colors px-2 py-1 rounded hover:bg-white/5"
                    >
                      Update
                    </button>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 glass-card p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-white">Study Recommendations</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              'Solve 2-3 LeetCode problems per topic daily',
              'Review weak topics before moving to new ones',
              'Use the DSA Agent for step-by-step solutions',
              'Take mock interviews weekly to track improvement',
            ].map((tip) => (
              <div key={tip} className="flex items-start gap-2 text-xs text-slate-400">
                <span className="text-brand-400 mt-0.5">•</span>
                {tip}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
