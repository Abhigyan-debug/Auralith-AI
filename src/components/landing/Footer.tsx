import { Link } from 'react-router-dom'
import { Github, Twitter, Linkedin } from 'lucide-react'

const LINKS = {
  Product: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
  Agents: ['Learning Agent', 'DSA Agent', 'Debug Agent', 'Interview Agent'],
  Resources: ['Documentation', 'API Reference', 'Blog', 'Community'],
  Company: ['About', 'Careers', 'Privacy Policy', 'Terms of Service'],
}

export function Footer() {
  return (
    <footer className="bg-surface-950 border-t border-white/5 pt-16 pb-8">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="Auralith AI" width={28} height={28} className="rounded-lg object-cover" style={{ width: 28, height: 28 }} />
              <span className="text-white font-semibold text-sm">Auralith AI</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed mb-4">
            Transform your code into gold. Master DSA, crack interviews, and become a coding master.
            </p>
            <div className="flex items-center gap-3">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <button
                  key={i}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([category, items]) => (
            <div key={category}>
              <div className="text-white text-xs font-semibold uppercase tracking-wider mb-4">
                {category}
              </div>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-slate-500 hover:text-slate-300 text-xs transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs">
            © 2026 Auralith AI. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500 text-xs">All systems operational</span>
          </div>
          <Link
            to="/auth"
            className="text-brand-400 hover:text-brand-300 text-xs font-medium transition-colors"
          >
            Start for free →
          </Link>
        </div>
      </div>
    </footer>
  )
}
