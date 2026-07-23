import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Milestone, ArrowLeft, Trash2, CheckCircle2, Circle, ExternalLink,
  BookOpen, Video, Wrench, PlayCircle,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { type Roadmap, type WeeklyPlan, type Resource } from '@/types'
import { cn } from '@/lib/utils'

const RESOURCE_ICONS: Record<Resource['type'], typeof Video> = {
  video: Video,
  article: BookOpen,
  practice: Wrench,
  book: BookOpen,
}

function progressOf(weeklyPlan: WeeklyPlan[]) {
  if (weeklyPlan.length === 0) return 0
  return Math.round((weeklyPlan.filter(w => w.completed).length / weeklyPlan.length) * 100)
}

export function RoadmapsPage() {
  const { user } = useAuth()
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (user) loadRoadmaps()
  }, [user])

  const loadRoadmaps = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    if (data) setRoadmaps(data)
    setLoading(false)
  }

  const toggleWeek = async (roadmap: Roadmap, weekIndex: number) => {
    const updatedWeeklyPlan = roadmap.content.weekly_plan.map((w, i) =>
      i === weekIndex ? { ...w, completed: !w.completed } : w
    )
    const updatedContent = { ...roadmap.content, weekly_plan: updatedWeeklyPlan }

    setRoadmaps(prev => prev.map(r => (r.id === roadmap.id ? { ...r, content: updatedContent } : r)))

    await supabase.from('roadmaps').update({ content: updatedContent }).eq('id', roadmap.id)
  }

  const deleteRoadmap = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await supabase.from('roadmaps').delete().eq('id', id)
    setRoadmaps(prev => prev.filter(r => r.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  const selected = roadmaps.find(r => r.id === selectedId) ?? null

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-white">My Roadmaps</h1>
                <p className="text-slate-400 text-sm mt-0.5">Saved learning roadmaps with trackable weekly milestones</p>
              </div>

              {roadmaps.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <Milestone className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No roadmaps saved yet.</p>
                  <p className="text-slate-500 text-xs mt-1">Chat with the Roadmap Agent about your goals, then click "Save as Roadmap" to track it here.</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {roadmaps.map((r, i) => {
                    const pct = progressOf(r.content.weekly_plan)
                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setSelectedId(r.id)}
                        className="glass-card p-4 cursor-pointer hover:border-white/15 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-semibold text-white">{r.title}</span>
                          <button
                            onClick={(e) => deleteRoadmap(e, r.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all flex-shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-400 mb-3 line-clamp-2">{r.goal}</p>
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                          <span>{r.content.duration_weeks} weeks</span>
                          <span>{pct}% complete</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6 }}
                          />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button
                onClick={() => setSelectedId(null)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to roadmaps
              </button>

              <div className="mb-6">
                <h1 className="text-xl font-bold text-white">{selected.title}</h1>
                <p className="text-slate-400 text-sm mt-0.5">{selected.goal}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                <div className="glass-card p-4">
                  <div className="text-xs text-slate-500 mb-1">Current Level</div>
                  <div className="text-sm font-semibold text-white">{selected.content.current_level}</div>
                </div>
                <div className="glass-card p-4">
                  <div className="text-xs text-slate-500 mb-1">Target Level</div>
                  <div className="text-sm font-semibold text-white">{selected.content.target_level}</div>
                </div>
              </div>

              {selected.content.missing_skills?.length > 0 && (
                <div className="glass-card p-4 mb-6">
                  <div className="text-xs font-semibold text-white mb-2">Missing Skills</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.content.missing_skills.map(skill => (
                      <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Weekly Plan</span>
                <span className="text-xs text-slate-500">{progressOf(selected.content.weekly_plan)}% complete</span>
              </div>
              <div className="space-y-2 mb-6">
                {selected.content.weekly_plan.map((week, i) => (
                  <div
                    key={week.week}
                    className={cn(
                      'glass-card p-4 transition-all',
                      week.completed && 'border-emerald-500/20 bg-emerald-500/5'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <button onClick={() => toggleWeek(selected, i)} className="mt-0.5 flex-shrink-0">
                        {week.completed
                          ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          : <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400 transition-colors" />
                        }
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-brand-400">Week {week.week}</span>
                          <span className={cn('text-sm font-semibold', week.completed ? 'text-slate-400 line-through' : 'text-white')}>
                            {week.title}
                          </span>
                        </div>
                        {week.topics?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1.5">
                            {week.topics.map(topic => (
                              <span key={topic} className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}
                        {week.goals?.length > 0 && (
                          <ul className="text-xs text-slate-400 space-y-0.5">
                            {week.goals.map((goal, gi) => (
                              <li key={gi} className="flex items-start gap-1.5">
                                <span className="text-slate-600 mt-0.5">•</span>
                                {goal}
                              </li>
                            ))}
                          </ul>
                        )}
                        {week.problems > 0 && (
                          <div className="text-xs text-slate-500 mt-1.5">{week.problems} problems</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selected.content.resources?.length > 0 && (
                <div>
                  <span className="text-sm font-semibold text-white mb-2 block">Resources</span>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {selected.content.resources.map((res, i) => {
                      const Icon = RESOURCE_ICONS[res.type] ?? PlayCircle
                      return (
                        <a
                          key={i}
                          href={res.url || undefined}
                          target={res.url ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          className={cn(
                            'glass-card p-3 flex items-start gap-2.5',
                            res.url && 'hover:border-white/15 transition-all cursor-pointer'
                          )}
                        >
                          <Icon className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-white truncate flex items-center gap-1">
                              {res.title}
                              {res.url && <ExternalLink className="w-3 h-3 text-slate-500 flex-shrink-0" />}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">{res.description}</div>
                          </div>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
