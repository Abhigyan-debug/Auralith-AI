import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Star } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Arjun Sharma',
    role: 'Software Engineer @ Google',
    avatar: 'AS',
    color: 'from-brand-500 to-cyan-500',
    content:
      'Auralith AI helped me crack my Google interview in 3 months. The DSA agent explains optimal approaches better than any YouTube tutorial I\'ve seen.',
    rating: 5,
  },
  {
    name: 'Priya Mehta',
    role: 'CS Student @ IIT Delhi',
    avatar: 'PM',
    color: 'from-emerald-500 to-teal-500',
    content:
      'The roadmap generator created a perfect study plan for my placements. The progress tracker kept me accountable and I went from 40% to 90% in graphs!',
    rating: 5,
  },
  {
    name: 'Ryan Chen',
    role: 'Full Stack Developer',
    avatar: 'RC',
    color: 'from-violet-500 to-brand-500',
    content:
      'Code Review Agent found 6 critical issues in my portfolio project that I had completely missed. The suggestions were incredibly detailed and actionable.',
    rating: 5,
  },
  {
    name: 'Sarah Williams',
    role: 'Backend Engineer @ Meta',
    avatar: 'SW',
    color: 'from-orange-500 to-rose-500',
    content:
      'The mock interview agent is scarily realistic. It asked exactly the system design questions I got in my Meta loop and the feedback was spot-on.',
    rating: 5,
  },
  {
    name: 'Rahul Patel',
    role: 'Competitive Programmer',
    avatar: 'RP',
    color: 'from-cyan-500 to-emerald-500',
    content:
      'I love how the Debug Agent explains not just the fix but WHY the bug happened. My debugging skills have improved massively over the past month.',
    rating: 5,
  },
  {
    name: 'Emily Johnson',
    role: 'Junior Developer @ Amazon',
    avatar: 'EJ',
    color: 'from-teal-500 to-brand-500',
    content:
      'Uploaded my DSA notes and the RAG feature now answers questions with examples from MY own material. It\'s like the AI truly understands my learning style.',
    rating: 5,
  },
]

export function Testimonials() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <section className="py-24 bg-surface-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="container max-w-6xl mx-auto px-6 relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-slate-400 text-xs font-medium mb-5">
            Testimonials
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trusted by <span className="gradient-text">10,000+ Developers</span>
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            From students to senior engineers, Auralith AI has helped thousands level up their coding careers.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 hover:border-white/15 transition-all"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-5">"{t.content}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
