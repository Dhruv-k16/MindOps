import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, Zap, Sparkles, Check } from 'lucide-react'
import { Button, cn } from '../ui/core'

export default function SettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-zinc-950 border border-zinc-900 w-full max-w-2xl rounded-[32px] overflow-hidden relative z-10 shadow-3xl"
          >
            {/* Header */}
            <div className="p-8 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">System Settings</h2>
                <p className="text-zinc-500 text-sm">Configure your MindOps OS environment.</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-xl transition-colors">
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>

            <div className="p-8 space-y-12 max-h-[70vh] overflow-y-auto">
              {/* Plan Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-500">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-white font-bold tracking-tight">Active Subscription</h3>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl relative overflow-hidden shadow-xl shadow-indigo-500/20">
                   <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                         <Sparkles className="w-4 h-4 text-white" />
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Pro Founder Plan</span>
                      </div>
                      <h4 className="text-4xl font-black text-white tracking-tighter mb-6">$49<span className="text-sm font-bold text-white/60">/mo</span></h4>
                      
                      <div className="space-y-3 mb-8">
                         <FeatureItem text="Unlimited Vision Graphs" />
                         <FeatureItem text="Advanced RAG Co-Founder" />
                         <FeatureItem text="Total Vault Privacy" />
                      </div>

                      <Button className="bg-white text-indigo-600 hover:bg-zinc-100 font-bold px-8 shadow-2xl">Manage Billing</Button>
                   </div>
                   
                   {/* Decorative elements */}
                   <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                   <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl" />
                </div>
              </section>

              {/* Security Section */}
              <section>
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500">
                      <Shield className="w-5 h-5" />
                    </div>
                    <h3 className="text-white font-bold tracking-tight">Security & Privacy</h3>
                 </div>
                 <div className="space-y-4">
                    <SecurityToggle title="Hardware Encryption" enabled />
                    <SecurityToggle title="Biometric Vault Access" enabled={false} />
                 </div>
              </section>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-white/90">
      <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
        <Check className="w-2.5 h-2.5 text-white" />
      </div>
      <span className="text-xs font-medium tracking-tight">{text}</span>
    </div>
  )
}

function SecurityToggle({ title, enabled }: { title: string, enabled: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl">
      <span className="text-sm text-zinc-300 font-medium">{title}</span>
      <div className={cn(
        "w-10 h-5 rounded-full relative transition-colors duration-200",
        enabled ? "bg-emerald-500" : "bg-zinc-800"
      )}>
        <div className={cn(
          "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200",
          enabled ? "left-6" : "left-1"
        )} />
      </div>
    </div>
  )
}
