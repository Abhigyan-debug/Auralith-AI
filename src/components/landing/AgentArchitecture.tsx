import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Brain, ArrowRight, Cpu } from 'lucide-react'

const AGENTS = [
  { name: 'Intent Detection', role: 'Router', color: 'brand', center: true },
  { name: 'Learning Agent', role: 'Concepts & Notes', color: 'cyan', center: false },
  { name: 'DSA Agent', role: 'Problem Solving', color: 'cyan', center: false },
  { name: 'Code Review', role: 'Quality Analysis', color: 'emerald', center: false },
  { name: 'Debug Agent', role: 'Error Detection', color: 'orange', center: false },
  { name: 'Interview Agent', role: 'Mock Interviews', color: 'violet', center: false },
  { name: 'Roadmap Agent', role: 'Learning Paths', color: 'teal', center: false },
  { name: 'Progress Agent', role: 'Analytics', color: 'amber', center: false },
  { name: 'Reflection Agent', role: 'Quality Control', color: 'rose', center: false },
]

const COLOR_MAP: Record<string, string> = {
  brand: 'border-brand-500/40 bg-brand-500/10 text-brand-300',
  cyan: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-300',
  emerald: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300',
  orange: 'border-orange-500/30 bg-orange-500/5 text-orange-300',
  violet: 'border-violet-500/30 bg-violet-500/5 text-violet-300',
  teal: 'border-teal-500/30 bg-teal-500/5 text-teal-300',
  amber: 'border-amber-500/30 bg-amber-500/5 text-amber-300',
  rose: 'border-rose-500/30 bg-rose-500/5 text-rose-300',
}

export function AgentArchitecture() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  const specialists = AGENTS.filter(a => !a.center)
  const router = AGENTS.find(a => a.center)

  return (
    <section id="agents" className="py-24 bg-surface-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/3 rounded-full blur-3xl" />

      <div className="container max-w-5xl mx-auto px-6 relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-slate-400 text-xs font-medium mb-5">
            Agent Architecture
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            9 Specialized Agents,{' '}
            <span className="gradient-text">One Intelligent System</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Each agent is a domain expert. Together they form a powerful multi-agent system that handles any coding challenge.
          </p>
        </motion.div>

        {/* Architecture diagram */}
        <div className="relative">
          {/* User input */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-6"
          >
            <div className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 font-medium">
              User Query
            </div>
          </motion.div>

          <div className="flex justify-center mb-4">
            <div className="w-px h-6 bg-gradient-to-b from-white/20 to-brand-500/50" />
          </div>

          {/* Router */}
          {router && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 ${COLOR_MAP[router.color]}`}>
                <Brain className="w-5 h-5" />
                <div>
                  <div className="text-sm font-semibold">{router.name}</div>
                  <div className="text-xs opacity-70">{router.role}</div>
                </div>
                <Cpu className="w-4 h-4 animate-pulse" />
              </div>
            </motion.div>
          )}

          {/* Connection lines */}
          <div className="flex justify-center mb-4">
            <div className="w-px h-6 bg-gradient-to-b from-brand-500/50 to-transparent" />
          </div>

          {/* Agent grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {specialists.map((agent, i) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.06 }}
                className={`flex flex-col items-center p-4 rounded-xl border ${COLOR_MAP[agent.color]} transition-all hover:scale-105 cursor-default`}
              >
                <Brain className="w-4 h-4 mb-2" />
                <div className="text-xs font-semibold text-center">{agent.name}</div>
                <div className="text-xs opacity-60 text-center mt-0.5">{agent.role}</div>
              </motion.div>
            ))}
          </div>

          {/* Memory + Response */}
          <div className="flex justify-center mb-4">
            <div className="w-px h-6 bg-gradient-to-b from-transparent to-emerald-500/50" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4"
          >
            <div className="px-5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-medium">
              Memory System (Redis)
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
            <div className="px-5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium">
              Reflection Agent
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
            <div className="px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-medium">
              Final Response
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
