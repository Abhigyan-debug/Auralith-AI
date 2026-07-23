import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Code2, Brain } from 'lucide-react'
import { NeuralBackground, FloatingCodeSnippet } from './NeuralBackground'

const CODE_SNIPPETS = [
  `def binary_search(arr, target):
    left, right = 0, len(arr)-1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
  `// Dynamic Programming
function longestCommonSubsequence(
  text1: string,
  text2: string
): number {
  const dp = Array(text2.length + 1)
    .fill(0);
  // O(n*m) time, O(m) space
  return dp[text2.length];
}`,
  `# Graph BFS
from collections import deque
def bfs(graph, start):
    visited = set()
    queue = deque([start])
    while queue:
        node = queue.popleft()
        if node not in visited:
            visited.add(node)
            queue.extend(graph[node])`,
]

const AGENT_PILLS = [
  { label: 'Learning Agent', color: 'text-brand-400 bg-brand-500/10 border-brand-500/20' },
  { label: 'DSA Agent', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { label: 'Debug Agent', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  { label: 'Interview Agent', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { label: 'Code Review Agent', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  { label: 'Roadmap Agent', color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
]

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-surface-950 bg-grid">
      <NeuralBackground />

      {/* Radial glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Floating code snippets */}
      <FloatingCodeSnippet
        code={CODE_SNIPPETS[0]}
        delay={0.5}
        position={{ top: '15%', left: '2%' }}
      />
      <FloatingCodeSnippet
        code={CODE_SNIPPETS[1]}
        delay={1}
        position={{ top: '20%', right: '2%' }}
      />
      <FloatingCodeSnippet
        code={CODE_SNIPPETS[2]}
        delay={1.5}
        position={{ bottom: '15%', left: '3%' }}
      />

      <div className="relative z-10 container max-w-5xl mx-auto px-6 text-center py-24">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-8"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Powered by 9 AI Agents
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6"
        >
          Transform Your Code Into{' '}
          <span className="gradient-text">Pure Gold</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Transmute bugs into features. Master algorithms. Crack FAANG interviews.
          Your personal AI guide helps your journey from apprentice to master.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            to="/auth"
            className="group inline-flex items-center gap-2 px-7 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-glow hover:shadow-lg hover:scale-105"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            <Code2 className="w-4 h-4" />
            Explore Features
          </a>
        </motion.div>

        {/* Agent pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <span className="text-slate-500 text-sm mr-2">Active Agents:</span>
          {AGENT_PILLS.map((pill, i) => (
            <motion.span
              key={pill.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className={`agent-badge ${pill.color} border`}
            >
              <Brain className="w-2.5 h-2.5" />
              {pill.label}
            </motion.span>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { value: '9', label: 'AI Agents' },
            { value: '500+', label: 'DSA Problems' },
            { value: '10k+', label: 'Developers' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-white/40" />
        </div>
      </motion.div>
    </section>
  )
}
