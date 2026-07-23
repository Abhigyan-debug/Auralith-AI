import { useEffect, useState } from 'react'
import { User, LogOut, Loader2, Check, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { type Profile } from '@/types'
import { cn } from '@/lib/utils'

const SKILL_LEVELS: Profile['skill_level'][] = ['beginner', 'intermediate', 'advanced']

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [skillLevel, setSkillLevel] = useState<Profile['skill_level']>('beginner')
  const [goals, setGoals] = useState('')
  const [languages, setLanguages] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [leetcodeUsername, setLeetcodeUsername] = useState('')

  useEffect(() => {
    if (user) loadProfile()
  }, [user])

  const loadProfile = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle()

    if (data) {
      setFullName(data.full_name ?? '')
      setUsername(data.username ?? '')
      setBio(data.bio ?? '')
      setSkillLevel(data.skill_level)
      setGoals((data.goals ?? []).join(', '))
      setLanguages((data.preferred_languages ?? []).join(', '))
      setGithubUrl(data.github_url ?? '')
      setLeetcodeUsername(data.leetcode_username ?? '')
    }
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim() || null,
        username: username.trim() || null,
        bio: bio.trim() || null,
        skill_level: skillLevel,
        goals: goals.split(',').map(g => g.trim()).filter(Boolean),
        preferred_languages: languages.split(',').map(l => l.trim()).filter(Boolean),
        github_url: githubUrl.trim() || null,
        leetcode_username: leetcodeUsername.trim() || null,
      })
      .eq('user_id', user!.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all'
  const labelClass = 'block text-xs font-medium text-slate-300 mb-1.5'

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage your profile and account</p>
        </div>

        <div className="glass-card p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-brand-400" />
            <span className="text-sm font-semibold text-white">Account</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">Email</div>
              <div className="text-sm text-slate-300">{user?.email}</div>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="glass-card p-4 space-y-4">
          <span className="text-sm font-semibold text-white">Profile</span>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className={inputClass}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className={labelClass}>Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className={inputClass}
                placeholder="username"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              className={cn(inputClass, 'resize-none')}
              placeholder="Tell us about yourself"
            />
          </div>

          <div>
            <label className={labelClass}>Skill Level</label>
            <div className="flex gap-2">
              {SKILL_LEVELS.map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSkillLevel(level)}
                  className={cn(
                    'flex-1 py-2 text-xs font-medium rounded-lg capitalize transition-all',
                    skillLevel === level
                      ? 'bg-brand-500 text-white'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Goals</label>
            <input
              type="text"
              value={goals}
              onChange={e => setGoals(e.target.value)}
              className={inputClass}
              placeholder="e.g. Crack FAANG, Learn DSA (comma-separated)"
            />
          </div>

          <div>
            <label className={labelClass}>Preferred Languages</label>
            <input
              type="text"
              value={languages}
              onChange={e => setLanguages(e.target.value)}
              className={inputClass}
              placeholder="e.g. Python, JavaScript (comma-separated)"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>GitHub URL</label>
              <input
                type="url"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                className={inputClass}
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <label className={labelClass}>LeetCode Username</label>
              <input
                type="text"
                value={leetcodeUsername}
                onChange={e => setLeetcodeUsername(e.target.value)}
                className={inputClass}
                placeholder="leetcode_handle"
              />
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
