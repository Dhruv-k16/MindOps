import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts'
import { DollarSign, Plus, Trash2, PieChart, TrendingUp, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react'
import { Button, cn } from '../ui/core'
import { supabase } from '../../lib/supabase'

interface FinanceEntry {
  id: string
  type: 'REVENUE' | 'EXPENSE' | 'FUNDING'
  category: string
  amount: number
  frequency: string
  date: string
}

export default function FinancialModule({ projectId }: { projectId: string }) {
  const [entries, setEntries] = useState<FinanceEntry[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEntry, setNewEntry] = useState<{
    type: 'REVENUE' | 'EXPENSE' | 'FUNDING'
    category: string
    amount: number
    frequency: string
  }>({
    type: 'REVENUE',
    category: '',
    amount: 0,
    frequency: 'MONTHLY'
  })

  useEffect(() => {
    fetchEntries()
  }, [projectId])

  const fetchEntries = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const response = await fetch(`${API_URL}/finance/${projectId}`, {
      headers: { 'Authorization': `Bearer ${session?.access_token}` }
    })
    const data = await response.json()
    setEntries(data)
  }

  const handleCreate = async () => {
    if (!newEntry.category || newEntry.amount <= 0) return
    const { data: { session } } = await supabase.auth.getSession()
    await fetch(`${API_URL}/finance/${projectId}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify(newEntry),
    })
    setNewEntry({ type: 'REVENUE', category: '', amount: 0, frequency: 'MONTHLY' })
    setShowAddForm(false)
    fetchEntries()
  }

  const deleteEntry = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    await fetch(`${API_URL}/finance/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${session?.access_token}` }
    })
    fetchEntries()
  }

  const stats = useMemo(() => {
    const rev = entries.filter(e => e.type === 'REVENUE').reduce((acc, curr) => acc + (curr.frequency === 'MONTHLY' ? curr.amount : curr.amount / 12), 0)
    const exp = entries.filter(e => e.type === 'EXPENSE').reduce((acc, curr) => acc + (curr.frequency === 'MONTHLY' ? curr.amount : curr.amount / 12), 0)
    return { 
      mrR: Math.round(rev), 
      burn: Math.round(exp), 
      profit: Math.round(rev - exp) 
    }
  }, [entries])

  const chartData = useMemo(() => {
    return [1, 2, 3, 4, 5, 6].map(month => ({
      name: `Month ${month}`,
      revenue: stats.mrR * (1 + 0.1 * month),
      expense: stats.burn * (1 + 0.05 * month)
    }))
  }, [stats])

  return (
    <div className="space-y-12 pb-12">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Projected MRR" value={`$${stats.mrR}`} icon={ArrowUpRight} color="text-emerald-400" />
        <StatCard title="Monthly Burn" value={`$${stats.burn}`} icon={ArrowDownRight} color="text-red-400" />
        <StatCard title="Net Runway" value={`$${stats.profit}`} icon={Wallet} color="text-indigo-400" />
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Projections Chart */}
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-8 shadow-2xl">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-white font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Growth Projection
              </h3>
              <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">6-Month Forecast</span>
           </div>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    cursor={{ stroke: '#27272a', strokeWidth: 1 }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Entries List */}
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-8 flex flex-col shadow-2xl">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-white font-bold flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-500" />
                Financial Entries
              </h3>
              <Button size="sm" onClick={() => setShowAddForm(true)} className="h-8 rounded-lg gap-1.5 px-3">
                <Plus className="w-3.5 h-3.5" />
                Add Entry
              </Button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {entries.map(entry => (
                <div key={entry.id} className="group flex items-center justify-between p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl hover:border-zinc-700 transition-all shadow-lg hover:shadow-indigo-500/5">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2.5 rounded-xl border",
                      entry.type === 'REVENUE' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                    )}>
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white tracking-tight">{entry.category}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black">{entry.frequency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "font-bold text-sm",
                      entry.type === 'REVENUE' ? "text-emerald-400" : "text-zinc-400"
                    )}>{entry.type === 'REVENUE' ? '+' : '-'}${entry.amount}</span>
                    <button onClick={() => deleteEntry(entry.id)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 rounded-lg transition-all">
                       <Trash2 className="w-3.5 h-3.5 text-zinc-600 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Add Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl p-8 relative z-10 shadow-3xl"
            >
              <h2 className="text-2xl font-bold text-white mb-8 tracking-tight">Add Financial Entry</h2>
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 shadow-inner">
                  <button 
                    onClick={() => setNewEntry({...newEntry, type: 'REVENUE'})}
                    className={cn("py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", newEntry.type === 'REVENUE' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-zinc-600 hover:text-zinc-300")}
                  >REVENUE</button>
                  <button 
                    onClick={() => setNewEntry({...newEntry, type: 'EXPENSE'})}
                    className={cn("py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", newEntry.type === 'EXPENSE' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-zinc-600 hover:text-zinc-300")}
                  >EXPENSE</button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">Category Name</label>
                    <input 
                      placeholder="e.g. AWS Credits, SaaS Subscriptions"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                      value={newEntry.category}
                      onChange={(e) => setNewEntry({...newEntry, category: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">Amount ($)</label>
                      <input 
                        type="number"
                        placeholder="0"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                        value={newEntry.amount}
                        onChange={(e) => setNewEntry({...newEntry, amount: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">Frequency</label>
                      <select 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                        value={newEntry.frequency}
                        onChange={(e) => setNewEntry({...newEntry, frequency: e.target.value})}
                      >
                        <option value="MONTHLY">Monthly</option>
                        <option value="ONE_TIME">One Time</option>
                        <option value="YEARLY">Yearly</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end pt-4">
                  <Button variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
                  <Button onClick={handleCreate} className="gap-2 shadow-indigo-500/10">
                    <Plus className="w-4 h-4" />
                    Secure Entry
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-6 flex items-center gap-6 group hover:border-zinc-700 transition-all shadow-xl hover:shadow-indigo-500/5">
      <div className={cn("p-4 rounded-2xl bg-zinc-950 border border-zinc-800 transition-colors group-hover:bg-zinc-900 shadow-inner", color)}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em] mb-1.5">{title}</p>
        <p className="text-3xl font-bold text-white tracking-tighter">{value}</p>
      </div>
    </div>
  )
}
