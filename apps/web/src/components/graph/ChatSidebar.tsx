import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, User, Bot, BrainCircuit } from 'lucide-react'
import { cn } from '../../components/ui/core'
import { supabase } from '../../lib/supabase'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatSidebar({ projectId, isOpen, onClose }: { projectId: string, isOpen: boolean, onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "I'm your AI Co-Founder. How can I help you evolve this project today?" }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`http://localhost:3000/ai/${projectId}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ message: userMsg }),
      })
      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (err) {
      console.error('Chat failed', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-800 z-[110] flex flex-col shadow-3xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
                  <BrainCircuit className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-white font-bold leading-none mb-1">AI Co-Founder</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Context Aware</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-xl transition-colors">
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 text-zinc-100">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex gap-4 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                    msg.role === 'assistant' ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-zinc-800 border-zinc-700 text-zinc-400"
                  )}>
                    {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'assistant' ? "bg-zinc-900 text-zinc-100 border border-zinc-800" : "bg-indigo-600 text-white shadow-xl shadow-indigo-500/10"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex gap-4 max-w-[85%]">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center animate-pulse">
                      <Bot className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-2xl flex gap-1">
                       <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full animate-bounce" />
                       <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full animate-bounce [animation-delay:0.2s]" />
                       <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                 </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-zinc-900 bg-zinc-950/50 backdrop-blur-md">
              <div className="relative group">
                <textarea 
                  rows={1}
                  placeholder="Ask your co-founder anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 flex items-center pl-5 pr-14 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all resize-none max-h-32"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-indigo-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-zinc-600 text-center mt-4 uppercase tracking-widest font-bold">Press Enter to send message</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
