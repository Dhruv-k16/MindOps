import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Send, Calendar, Star, TrendingUp, TrendingDown } from 'lucide-react'
import { Button, cn } from '../ui/core'
import { supabase } from '../../lib/supabase'

interface Entry {
  id: string
  content: string
  sentiment: string
  createdAt: string
}

export default function JournalView() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [newEntry, setNewEntry] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const response = await fetch('http://localhost:3000/journal', {
      headers: { 'Authorization': `Bearer ${session?.access_token}` }
    })
    const data = await response.json()
    setEntries(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEntry.trim() || isLoading) return

    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch('http://localhost:3000/journal', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ content: newEntry }),
      })
      setNewEntry('')
      fetchEntries()
    } catch (err) {
      console.error('Journal entry failed', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-6">
      <header className="mb-12">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Founder Journal</h2>
        <p className="text-zinc-500">Document your journey, reflect on decisions, and track your mindset.</p>
      </header>

      {/* New Entry Box */}
      <form onSubmit={handleSubmit} className="mb-16 bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-8 focus-within:border-indigo-500/30 transition-all shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
            <Star className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-white font-bold tracking-tight">Today's Reflection</span>
        </div>
        <textarea 
          placeholder="How is the project evolving? What are the biggest blockers today?"
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-700 resize-none h-32 focus:outline-none text-lg leading-relaxed mb-6"
        />
        <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50">
          <p className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.2em]">AI analyzes sentiment automatically</p>
          <Button type="submit" disabled={!newEntry.trim() || isLoading} className="gap-2">
            <Send className="w-4 h-4" />
            Save Entry
          </Button>
        </div>
      </form>

      {/* Timeline */}
      <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-zinc-800/50">
        {entries.map((entry, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={entry.id} 
            className="relative pl-12"
          >
            <div className="absolute left-0 top-1.5 w-10 h-10 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center z-10">
              <Calendar className="w-4 h-4 text-zinc-600" />
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 hover:bg-zinc-900/60 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">
                  {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider",
                  entry.sentiment === 'REFLECTIVE' ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-zinc-800 border-zinc-700 text-zinc-500"
                )}>
                  {entry.sentiment === 'REFLECTIVE' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {entry.sentiment}
                </div>
              </div>
              <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
