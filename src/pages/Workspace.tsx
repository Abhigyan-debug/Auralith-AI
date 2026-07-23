import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import { Sidebar } from '@/components/workspace/Sidebar'
import { ChatInterface } from '@/components/workspace/ChatInterface'
import { RightPanel } from '@/components/workspace/RightPanel'
import { ProgressDashboard } from '@/components/workspace/ProgressDashboard'
import { SettingsPage } from '@/components/workspace/SettingsPage'
import { InterviewHistory } from '@/components/workspace/InterviewHistory'
import { RoadmapsPage } from '@/components/workspace/RoadmapsPage'
import { type Chat, type AgentType } from '@/types'

export function Workspace() {
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [activePage, setActivePage] = useState('chat')
  const [activeAgentType, setActiveAgentType] = useState<AgentType>('general')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [chatKey, setChatKey] = useState(0)
  const [progressVersion, setProgressVersion] = useState(0)

  const handleNewChat = useCallback((agentType: AgentType = 'general') => {
    setActiveChat(null)
    setActiveAgentType(agentType)
    setActivePage('chat')
    setChatKey(k => k + 1)
  }, [])

  const handleSelectChat = useCallback((chat: Chat) => {
    setActiveChat(chat)
    setActiveAgentType(chat.agent_type as AgentType)
    setActivePage('chat')
    setChatKey(k => k + 1)
  }, [])

  const handleChatCreated = useCallback((chat: Chat) => {
    setActiveChat(chat)
  }, [])

  const handleSelectPage = useCallback((page: string) => {
    setActivePage(page)
    if (page !== 'chat') setActiveChat(null)
  }, [])

  const showProgress = activePage === 'progress'
  const showSettings = activePage === 'settings'
  const showInterviews = activePage === 'interviews'
  const showRoadmaps = activePage === 'roadmaps'
  const showSidebarPage = showProgress || showSettings || showInterviews || showRoadmaps

  return (
    <div className="h-screen bg-surface-950 flex overflow-hidden">
      <Sidebar
        activeChat={activeChat}
        activePage={activePage}
        activeAgentType={activeAgentType}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onSelectPage={handleSelectPage}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-surface-925 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-500">
              {showProgress
                ? 'Progress Dashboard'
                : showSettings
                ? 'Settings'
                : showInterviews
                ? 'Interview History'
                : showRoadmaps
                ? 'My Roadmaps'
                : `${activeAgentType === 'general' ? 'Auto-Detect' : activeAgentType.charAt(0).toUpperCase() + activeAgentType.slice(1)} Agent`}
            </span>
          </div>
          <button
            onClick={() => setRightPanelOpen(o => !o)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
            title={rightPanelOpen ? 'Hide insights panel' : 'Show insights panel'}
          >
            {rightPanelOpen
              ? <PanelRightClose className="w-4 h-4" />
              : <PanelRightOpen className="w-4 h-4" />
            }
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Center content */}
          <div className="flex-1 flex flex-col min-w-0">
            {showProgress ? (
              <ProgressDashboard />
            ) : showSettings ? (
              <SettingsPage />
            ) : showInterviews ? (
              <InterviewHistory />
            ) : showRoadmaps ? (
              <RoadmapsPage />
            ) : (
              <ChatInterface
                key={chatKey}
                chat={activeChat}
                onChatCreated={handleChatCreated}
                initialAgentType={activeAgentType}
                onProgressUpdate={() => setProgressVersion(v => v + 1)}
                onSelectPage={handleSelectPage}
              />
            )}
          </div>

          {/* Right panel */}
          <AnimatePresence>
            {rightPanelOpen && !showSidebarPage && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 288, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 overflow-hidden"
              >
                <RightPanel activeAgentType={activeAgentType} refreshKey={progressVersion} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
