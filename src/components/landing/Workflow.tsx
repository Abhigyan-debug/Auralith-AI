import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowDown, ChevronRight } from 'lucide-react'

const FLOW_STEPS = [
  {
    step: '01',
    title: 'Ask Anything',
    description: 'Type your question, paste code, or describe your problem in natural language.',
    color: 'brand',
  },
  {
    step: '02',
    title: 'Intent Detection',
    description: 'The Intent Detection Agent analyzes your query and routes it to the right specialist.',
    color: 'cyan',
  },
  {
    step: '03',
    title: 'Agent Processing',
    description: 'The specialized agent processes your request with deep domain knowledge and context.',
    color: 'emerald',
  },
  {
    step: '04',
    title: 'Memory & Context',
    description: 'Your history, preferences, and progress are retrieved for personalized responses.',
    color: 'violet',
  },
  {
    step: '05',
    title: 'Reflection & Verify',
    description: 'The Reflection Agent verifies accuracy, reduces hallucinations, and improves quality.',
    color: 'amber',
  },
  {
    step: '06',
    title: 'Perfect Response',
    description: 'You receive a precise, personalized answer tailored to your skill level and context.',
    color: 'emerald',
  },
]

const COLOR_MAP: Record<string, { text: string; border: string; bg: string; dot: string }> = {
  brand: {
    text: 'text-brand-400',
    border: 'border-brand-500/30',
    bg: 'bg-brand-500/10',
    dot: 'bg-brand-500',
  },
  cyan: {
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    dot: 'bg-cyan-500',
  },
  emerald: {
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    dot: 'bg-emerald-500',
  },
  violet: {
    text: 'text-violet-400',
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/10',
    dot: 'bg-violet-500',
  },
  amber: {
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    dot: 'bg-amber-500',
  },
}

export function Workflow() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <section id="workflow" className="py-24 bg-surface-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-brand-500/5 via-transparent to-transparent" />

      <div className="container max-w-5xl mx-auto px-6 relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-slate-400 text-xs font-medium mb-5">
            How It Works
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            From Question to{' '}
            <span className="gradient-text">Perfect Answer</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Every query flows through a multi-agent pipeline designed for accuracy, depth, and personalization.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FLOW_STEPS.map((step, i) => {
            const colors = COLOR_MAP[step.color]
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="relative glass-card p-6 group hover:border-white/15 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                    <span className={`text-sm font-bold ${colors.text}`}>{step.step}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">{step.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>
                {i < FLOW_STEPS.length - 1 && (
                  <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 hidden lg:flex items-center z-10">
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Example flow visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7 }}
          className="mt-16 glass-card p-6 border-brand-500/20"
        >
          <div className="text-xs text-slate-500 mb-4 font-medium uppercase tracking-wider">Example Query Flow</div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-sm text-slate-300 font-mono">
              "Explain Dynamic Programming with examples"
            </div>
            <ArrowDown className="w-3 h-3 text-slate-600 rotate-[-90deg]" />
            <div className="px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-xs text-brand-400">
              Intent: Learning Request
            </div>
            <ArrowDown className="w-3 h-3 text-slate-600 rotate-[-90deg]" />
            <div className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400">
              Routed: Learning Agent
            </div>
            <ArrowDown className="w-3 h-3 text-slate-600 rotate-[-90deg]" />
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
              Verified: Reflection Agent
            </div>
            <ArrowDown className="w-3 h-3 text-slate-600 rotate-[-90deg]" />
            <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300">
              Response: Structured Explanation + Examples
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
