import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Button, Input } from '../components/ui/core'
import { BrainCircuit } from 'lucide-react'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('Check your email for the confirmation link!')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'github' | 'google') => {
    await supabase.auth.signInWithOAuth({ provider })
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-zinc-900 border border-zinc-800 mb-4 shadow-xl">
            <BrainCircuit className="w-8 h-8 text-indigo-500" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">MindOps</h1>
          <p className="text-zinc-500 text-sm">The founder's second brain.</p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
          
          <form onSubmit={handleAuth} className="space-y-4">
            <Input 
              label="Email Address"
              type="email"
              placeholder="name@startup.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input 
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <p className="text-[11px] text-red-400 text-center bg-red-500/5 py-2 rounded-lg border border-red-500/20">
                {error}
              </p>
            )}

            <Button 
              className="w-full h-11"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="h-px bg-zinc-800 flex-1" />
            <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Or continue with</span>
            <div className="h-px bg-zinc-800 flex-1" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-10" onClick={() => handleSocialLogin('github')}>
              GitHub
            </Button>
            <Button variant="outline" className="h-10" onClick={() => handleSocialLogin('google')}>
              Google
            </Button>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-zinc-500 hover:text-indigo-400 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
