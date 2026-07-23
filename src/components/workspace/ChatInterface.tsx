import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Brain, Code2, Copy, Check, Flag, Milestone } from 'lucide-react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { type Chat, type Message, type AgentType } from '@/types'
import { cn, AGENT_LABELS, AGENT_COLORS } from '@/lib/utils'

async function bumpTopicProgress(userId: string, topic: string) {
  try {
    const { data: existing } = await supabase
      .from('progress_reports')
      .select('id, score, problems_solved')
      .eq('user_id', userId)
      .eq('topic', topic)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('progress_reports')
        .update({
          score: Math.min(100, existing.score + 5),
          problems_solved: existing.problems_solved + 1,
        })
        .eq('id', existing.id)
    }
  } catch {
    // best-effort progress tracking; a failure here shouldn't break the chat
  }
}

interface ChatInterfaceProps {
  chat: Chat | null
  onChatCreated: (chat: Chat) => void
  initialAgentType?: AgentType
  onProgressUpdate?: () => void
  onSelectPage?: (page: string) => void
}

const SUGGESTIONS: Record<AgentType, string[]> = {
  general: [
    'Explain the difference between BFS and DFS',
    'What is the time complexity of quicksort?',
    'Help me understand dynamic programming',
  ],
  learning: [
    'Teach me about Binary Trees',
    'Explain graph algorithms with examples',
    'What is memoization and when to use it?',
  ],
  dsa: [
    'Solve Two Sum problem optimally',
    'Explain LRU Cache implementation',
    'Best approach for N-Queens problem',
  ],
  review: [
    'Review this code for best practices',
    'How can I improve my sorting algorithm?',
    'Find issues in my implementation',
  ],
  debug: [
    'My code gives IndexOutOfBounds error',
    'Function returns undefined unexpectedly',
    'Infinite loop in my recursion',
  ],
  interview: [
    'Start a DSA mock interview',
    'Practice system design questions',
    'HR interview simulation',
  ],
  roadmap: [
    'Create a roadmap to crack FAANG',
    'Learning path for competitive programming',
    'Study plan for backend development',
  ],
  progress: [
    'Show my weak areas',
    'What topics should I focus on?',
    'Generate my progress report',
  ],
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/5">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <span className="text-xs text-slate-500 font-mono">{language}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={atomOneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontSize: '0.8rem',
          lineHeight: '1.5',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

function MessageContent({ content }: { content: string }) {
  return (
    <div className="markdown-body space-y-3 text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-lg font-bold text-white mt-4 mb-2 first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold text-white mt-4 mb-2 first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold text-white mt-3 mb-1.5 first:mt-0">{children}</h3>,
          h4: ({ children }) => <h4 className="text-sm font-semibold text-white mt-3 mb-1.5 first:mt-0">{children}</h4>,
          p: ({ children }) => <p className="text-slate-200">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="space-y-1 pl-5 list-disc marker:text-brand-400">{children}</ul>,
          ol: ({ children }) => <ol className="space-y-1 pl-5 list-decimal marker:text-brand-400 marker:font-medium">{children}</ol>,
          li: ({ children }) => <li className="text-slate-200 pl-1">{children}</li>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">
              {children}
            </a>
          ),
          hr: () => <hr className="border-white/10 my-3" />,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-brand-500/50 pl-3 text-slate-400 italic">{children}</blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2 rounded-lg border border-white/10">
              <table className="w-full text-xs border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-white/5">{children}</thead>,
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold text-white border-b border-white/10">{children}</th>
          ),
          td: ({ children }) => <td className="px-3 py-2 border-b border-white/5 text-slate-300">{children}</td>,
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const isBlock = Boolean(match) || String(children).includes('\n')

            if (isBlock) {
              return (
                <CodeBlock
                  code={String(children).replace(/\n$/, '')}
                  language={match?.[1] || 'text'}
                />
              )
            }

            return (
              <code className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-xs text-cyan-300" {...props}>
                {children}
              </code>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 0.2, 0.4].map((delay, i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </div>
  )
}

export function ChatInterface({ chat, onChatCreated, initialAgentType = 'general', onProgressUpdate, onSelectPage }: ChatInterfaceProps) {
  const { user, session } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [agentType, setAgentType] = useState<AgentType>(initialAgentType)
  const [endingInterview, setEndingInterview] = useState(false)
  const [savingRoadmap, setSavingRoadmap] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setAgentType(initialAgentType)
  }, [initialAgentType])

  useEffect(() => {
    if (!chat) {
      setMessages([])
      return
    }
    loadMessages(chat.id)
  }, [chat])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const loadMessages = async (chatId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  const autoResize = () => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }

  const sendMessage = useCallback(async (messageText?: string) => {
    const text = (messageText ?? input).trim()
    if (!text || loading || !user) return

    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setLoading(true)

    let currentChat = chat
    let currentAgentType = agentType

    if (!currentChat) {
      const title = text.length > 50 ? text.slice(0, 50) + '...' : text
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert({ title, agent_type: currentAgentType })
        .select()
        .single()

      if (error || !newChat) {
        setLoading(false)
        return
      }

      currentChat = newChat
      onChatCreated(newChat)
    }

    // At this point currentChat is guaranteed non-null (created above or passed in)
    const activeChatId = currentChat!.id

    const { data: savedUserMsg } = await supabase
      .from('messages')
      .insert({
        chat_id: activeChatId,
        role: 'user',
        content: text,
        agent_type: currentAgentType,
        metadata: {},
      })
      .select()
      .single()

    if (savedUserMsg) {
      setMessages(prev => [...prev, savedUserMsg])
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-agent`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: text,
            agent_type: currentAgentType,
            chat_id: activeChatId,
            history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
          }),
        }
      )

      const result = await response.json().catch(() => ({}))

      if (!response.ok || result.error) {
        throw new Error(result.error || `Agent error: ${response.status}`)
      }

      const detectedAgent = (result.agent_type as AgentType) || currentAgentType

      const { data: aiMsg } = await supabase
        .from('messages')
        .insert({
          chat_id: activeChatId,
          role: 'assistant',
          content: result.content,
          agent_type: detectedAgent,
          metadata: result.metadata ?? {},
        })
        .select()
        .single()

      if (aiMsg) {
        setMessages(prev => [...prev, aiMsg])
        setAgentType(detectedAgent)
      }

      if (user && result.metadata?.topic) {
        await bumpTopicProgress(user.id, result.metadata.topic)
        onProgressUpdate?.()
      }

      if (messages.length === 0) {
        await supabase
          .from('chats')
          .update({ agent_type: detectedAgent, updated_at: new Date().toISOString() })
          .eq('id', activeChatId)
      } else {
        await supabase
          .from('chats')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', activeChatId)
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to get response'
      const isQuotaError = /RESOURCE_EXHAUSTED|quota|429/i.test(errMsg)
      const displayMsg = isQuotaError
        ? '**Rate limit reached**\n\nThe AI service has hit its usage quota for now. Please wait a bit and try again.'
        : `Sorry, I encountered an error: ${errMsg}`

      const { data: errAiMsg } = await supabase
        .from('messages')
        .insert({
          chat_id: activeChatId,
          role: 'assistant',
          content: displayMsg,
          agent_type: currentAgentType,
          metadata: {},
        })
        .select()
        .single()

      if (errAiMsg) setMessages(prev => [...prev, errAiMsg])
    } finally {
      setLoading(false)
    }
  }, [input, chat, agentType, loading, user, messages, onChatCreated, onProgressUpdate])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const endInterview = useCallback(async () => {
    if (!chat || !user || messages.length === 0 || endingInterview) return
    setEndingInterview(true)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-agent`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'end_interview',
            history: messages.map(m => ({ role: m.role, content: m.content })),
          }),
        }
      )

      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.error) {
        throw new Error(result.error || `Grading failed: ${response.status}`)
      }

      const grade = result.result as {
        interview_type: string
        score: number
        feedback: string
        topics_covered: string[]
      }

      const startedAt = new Date(messages[0].created_at).getTime()
      const durationMinutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000))

      await supabase.from('interview_results').insert({
        interview_type: grade.interview_type,
        score: grade.score,
        feedback: grade.feedback,
        topics_covered: grade.topics_covered,
        duration_minutes: durationMinutes,
      })

      const summary = [
        '**Interview Ended**',
        '',
        `**Type:** ${grade.interview_type}`,
        `**Score: ${grade.score}/100**`,
        '',
        '**Feedback**',
        grade.feedback,
        '',
        '**Topics Covered**',
        grade.topics_covered.map(t => `- ${t}`).join('\n'),
      ].join('\n')

      const { data: summaryMsg } = await supabase
        .from('messages')
        .insert({ chat_id: chat.id, role: 'assistant', content: summary, agent_type: 'interview', metadata: {} })
        .select()
        .single()

      if (summaryMsg) setMessages(prev => [...prev, summaryMsg])
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to grade interview'
      const { data: errMessage } = await supabase
        .from('messages')
        .insert({
          chat_id: chat.id,
          role: 'assistant',
          content: `Sorry, I couldn't grade the interview: ${errMsg}`,
          agent_type: 'interview',
          metadata: {},
        })
        .select()
        .single()

      if (errMessage) setMessages(prev => [...prev, errMessage])
    } finally {
      setEndingInterview(false)
    }
  }, [chat, user, messages, session, endingInterview])

  const saveRoadmap = useCallback(async () => {
    if (!user || messages.length === 0 || savingRoadmap) return
    setSavingRoadmap(true)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-agent`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'generate_roadmap',
            history: messages.map(m => ({ role: m.role, content: m.content })),
          }),
        }
      )

      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.error) {
        throw new Error(result.error || `Roadmap generation failed: ${response.status}`)
      }

      const r = result.result as {
        title: string
        goal: string
        current_level: string
        target_level: string
        duration_weeks: number
        missing_skills: string[]
        weekly_plan: Array<{ week: number; title: string; topics: string[]; goals: string[]; problems: number }>
        resources: Array<{ title: string; type: string; url?: string; description: string }>
      }

      await supabase.from('roadmaps').insert({
        title: r.title,
        goal: r.goal,
        content: {
          current_level: r.current_level,
          target_level: r.target_level,
          duration_weeks: r.duration_weeks,
          missing_skills: r.missing_skills,
          weekly_plan: r.weekly_plan.map(w => ({ ...w, completed: false })),
          resources: r.resources,
        },
      })

      onSelectPage?.('roadmaps')
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to generate roadmap'
      if (chat) {
        const { data: errMessage } = await supabase
          .from('messages')
          .insert({
            chat_id: chat.id,
            role: 'assistant',
            content: `Sorry, I couldn't generate the roadmap: ${errMsg}`,
            agent_type: 'roadmap',
            metadata: {},
          })
          .select()
          .single()

        if (errMessage) setMessages(prev => [...prev, errMessage])
      }
    } finally {
      setSavingRoadmap(false)
    }
  }, [user, messages, session, savingRoadmap, chat, onSelectPage])

  const currentAgentColor = AGENT_COLORS[agentType] ?? 'from-brand-500 to-cyan-500'
  const suggestions = SUGGESTIONS[agentType] ?? SUGGESTIONS.general

  return (
    <div className="flex flex-col h-full">
      {/* Agent header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${currentAgentColor} flex items-center justify-center`}>
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{AGENT_LABELS[agentType]}</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-500">Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {agentType === 'interview' && messages.length > 0 && (
            <button
              onClick={endInterview}
              disabled={endingInterview}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 text-brand-400 text-xs font-medium transition-all disabled:opacity-50"
            >
              {endingInterview ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Flag className="w-3.5 h-3.5" />}
              {endingInterview ? 'Grading...' : 'End Interview'}
            </button>
          )}
          {agentType === 'roadmap' && messages.length > 0 && (
            <button
              onClick={saveRoadmap}
              disabled={savingRoadmap}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 text-brand-400 text-xs font-medium transition-all disabled:opacity-50"
            >
              {savingRoadmap ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Milestone className="w-3.5 h-3.5" />}
              {savingRoadmap ? 'Saving...' : 'Save as Roadmap'}
            </button>
          )}

          {/* Agent selector */}
          <div className="flex items-center gap-1">
            {(['general', 'learning', 'dsa', 'review', 'debug', 'interview'] as AgentType[]).map(a => (
              <button
                key={a}
                onClick={() => setAgentType(a)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                  agentType === a
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                )}
              >
                {a === 'general' ? 'Auto' : a.charAt(0).toUpperCase() + a.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentAgentColor} flex items-center justify-center mb-4 shadow-glow`}>
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-1">
              {AGENT_LABELS[agentType]}
            </h3>
            <p className="text-slate-400 text-sm text-center max-w-sm mb-8">
              Transmute your questions into mastery. I guide your coding journey.
            </p>
            <div className="grid gap-2 w-full max-w-lg">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-white/15 hover:bg-white/[0.06] text-sm text-slate-300 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
            >
              {msg.role === 'assistant' && (
                <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${AGENT_COLORS[msg.agent_type] ?? 'from-brand-500 to-cyan-500'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Brain className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Code2 className="w-3.5 h-3.5 text-slate-300" />
                </div>
              )}
              <div className={cn('max-w-[80%]', msg.role === 'user' ? 'message-user' : 'message-ai')}>
                {msg.role === 'assistant' ? (
                  <MessageContent content={msg.content} />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${currentAgentColor} flex items-center justify-center flex-shrink-0`}>
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="message-ai">
              <TypingIndicator />
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/5 flex-shrink-0">
        <div className="flex items-end gap-2 bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-2.5 focus-within:border-brand-500/40 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize() }}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${AGENT_LABELS[agentType]}... (Shift+Enter for new line)`}
            rows={1}
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 resize-none focus:outline-none min-h-[20px] max-h-40 leading-relaxed disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-8 h-8 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            {loading
              ? <Loader2 className="w-4 h-4 text-white animate-spin" />
              : <Send className="w-3.5 h-3.5 text-white" />
            }
          </button>
        </div>
        <p className="text-center text-xs text-slate-600 mt-2">
          Powered by Groq AI · Press Enter to send
        </p>
      </div>
    </div>
  )
}
