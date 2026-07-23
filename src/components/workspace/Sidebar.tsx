import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Code2, Plus, BookOpen, BarChart2, Bug, MessageSquare, Map,
  BarChart3, Settings, LogOut, ChevronDown, Trash2, X,
  PenLine, GraduationCap, Brain, Award, Milestone,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { type Chat, type AgentType } from '@/types'
import { cn, truncate } from '@/lib/utils'

interface SidebarProps {
  activeChat: Chat | null
  activePage: string
  activeAgentType: AgentType
  onSelectChat: (chat: Chat) => void
  onNewChat: (agentType?: AgentType) => void
  onSelectPage: (page: string) => void
  collapsed: boolean
  onToggle: () => void
}

const NAV_SECTIONS = [
  {
    label: 'Workspace',
    items: [
      { id: 'chat', icon: MessageSquare, label: 'New Chat', agent: 'general' as AgentType },
    ],
  },
  {
    label: 'Agents',
    items: [
      { id: 'learning', icon: BookOpen, label: 'Learning', agent: 'learning' as AgentType },
      { id: 'dsa', icon: Code2, label: 'DSA Practice', agent: 'dsa' as AgentType },
      { id: 'review', icon: PenLine, label: 'Code Review', agent: 'review' as AgentType },
      { id: 'debug', icon: Bug, label: 'Debugging', agent: 'debug' as AgentType },
      { id: 'interview', icon: GraduationCap, label: 'Mock Interviews', agent: 'interview' as AgentType },
      { id: 'roadmap', icon: Map, label: 'Roadmaps', agent: 'roadmap' as AgentType },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { id: 'progress', icon: BarChart3, label: 'Progress Dashboard', agent: 'progress' as AgentType },
      { id: 'interviews', icon: Award, label: 'Interview History', agent: 'interview' as AgentType },
      { id: 'roadmaps', icon: Milestone, label: 'My Roadmaps', agent: 'roadmap' as AgentType },
    ],
  },
]

const PAGE_ITEMS = new Set(['progress', 'interviews', 'roadmaps'])

const AGENT_ICON_COLORS: Record<string, string> = {
  general: 'text-brand-400',
  learning: 'text-cyan-400',
  dsa: 'text-emerald-400',
  review: 'text-teal-400',
  debug: 'text-orange-400',
  interview: 'text-violet-400',
  roadmap: 'text-brand-400',
  progress: 'text-amber-400',
}

export function Sidebar({
  activeChat,
  activePage,
  activeAgentType,
  onSelectChat,
  onNewChat,
  onSelectPage,
  collapsed,
  onToggle,
}: SidebarProps) {
  const { user, signOut } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [showChats, setShowChats] = useState(true)
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null)

  useEffect(() => {
    if (!user) return
    loadChats()
    loadProfile()
  }, [user])

  const loadChats = async () => {
    const { data } = await supabase
      .from('chats')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(20)
    if (data) setChats(data)
  }

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user!.id)
      .maybeSingle()
    setProfile(data)
  }

  const deleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation()
    await supabase.from('chats').delete().eq('id', chatId)
    setChats(prev => prev.filter(c => c.id !== chatId))
  }

  const initials = (profile?.full_name ?? user?.email ?? 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-full bg-surface-925 border-r border-white/5 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className={cn('flex items-center h-14 px-3 border-b border-white/5 flex-shrink-0', collapsed ? 'justify-center' : 'justify-between')}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Auralith" width={24} height={24} className="rounded-lg object-cover" style={{ width: 24, height: 24 }} />
            <span className="text-white font-semibold text-sm">Auralith</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
        >
          {collapsed ? <Brain className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* New chat button */}
      <div className="p-2 flex-shrink-0">
        <button
          onClick={() => onNewChat('general')}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 text-brand-400 text-sm font-medium transition-all',
            collapsed ? 'justify-center' : ''
          )}
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          {!collapsed && 'New Chat'}
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            {!collapsed && (
              <div className="px-2 mb-1 text-xs font-medium text-slate-600 uppercase tracking-wider">
                {section.label}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon
                const isActive = PAGE_ITEMS.has(item.id)
                  ? activePage === item.id
                  : activePage === 'chat' && activeAgentType === item.agent
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (PAGE_ITEMS.has(item.id)) {
                        onSelectPage(item.id)
                      } else {
                        onNewChat(item.agent)
                      }
                    }}
                    className={cn(
                      'sidebar-item w-full',
                      isActive ? 'sidebar-item-active' : 'sidebar-item-inactive',
                      collapsed ? 'justify-center' : ''
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={cn('w-4 h-4 flex-shrink-0', AGENT_ICON_COLORS[item.agent])} />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* Recent chats */}
        {!collapsed && chats.length > 0 && (
          <div>
            <button
              onClick={() => setShowChats(!showChats)}
              className="flex items-center gap-1 px-2 mb-1 text-xs font-medium text-slate-600 uppercase tracking-wider w-full hover:text-slate-400 transition-colors"
            >
              <ChevronDown className={cn('w-3 h-3 transition-transform', !showChats && '-rotate-90')} />
              Recent Chats
            </button>
            <AnimatePresence>
              {showChats && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-0.5"
                >
                  {chats.map(chat => (
                    <div
                      key={chat.id}
                      onClick={() => onSelectChat(chat)}
                      className={cn(
                        'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-xs',
                        activeChat?.id === chat.id
                          ? 'bg-white/10 text-white'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      )}
                    >
                      <MessageSquare className="w-3 h-3 flex-shrink-0" />
                      <span className="flex-1 truncate">{truncate(chat.title, 22)}</span>
                      <button
                        onClick={(e) => deleteChat(e, chat.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-white/5 flex-shrink-0 space-y-1">
        <button
          onClick={() => onSelectPage('settings')}
          className={cn(
            'sidebar-item w-full',
            activePage === 'settings' ? 'sidebar-item-active' : 'sidebar-item-inactive',
            collapsed ? 'justify-center' : ''
          )}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!collapsed && 'Settings'}
        </button>
        <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg', collapsed ? 'justify-center' : '')}>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 via-brand-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white truncate">
                  {profile?.full_name ?? user?.email?.split('@')[0]}
                </div>
                <div className="text-xs text-slate-500 truncate">{user?.email}</div>
              </div>
              <button
                onClick={signOut}
                className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
