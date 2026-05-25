import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { 
  Lightbulb, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Search, 
  FileText,
  Zap
} from 'lucide-react'
import { cn } from '../ui/core'

const typeConfig: Record<string, { icon: any; color: string; bg: string; border: string; glow: string }> = {
  IDEA: { 
    icon: Lightbulb, 
    color: 'text-amber-400', 
    bg: 'bg-amber-500/5', 
    border: 'border-amber-500/20',
    glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]'
  },
  TASK: { 
    icon: CheckCircle2, 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/5', 
    border: 'border-emerald-500/20',
    glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]'
  },
  RISK: { 
    icon: AlertTriangle, 
    color: 'text-rose-400', 
    bg: 'bg-rose-500/5', 
    border: 'border-rose-500/20',
    glow: 'group-hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]'
  },
  REVENUE: { 
    icon: TrendingUp, 
    color: 'text-indigo-400', 
    bg: 'bg-indigo-500/5', 
    border: 'border-indigo-500/20',
    glow: 'group-hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]'
  },
  INSIGHT: { 
    icon: Search, 
    color: 'text-cyan-400', 
    bg: 'bg-cyan-500/5', 
    border: 'border-cyan-500/20',
    glow: 'group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]'
  },
  DOCUMENT: { 
    icon: FileText, 
    color: 'text-zinc-400', 
    bg: 'bg-zinc-500/5', 
    border: 'border-zinc-500/20',
    glow: 'group-hover:shadow-[0_0_20px_rgba(113,113,122,0.15)]'
  },
}

export const MindNode = memo(({ data, selected }: NodeProps<{ type: string; label: string }>) => {
  const config = typeConfig[data.type] || typeConfig.IDEA
  const Icon = config.icon

  return (
    <div className={cn(
      "group relative px-5 py-4 rounded-2xl border bg-zinc-950/80 backdrop-blur-xl transition-all duration-300 min-w-[200px] shadow-2xl",
      config.border,
      selected ? "border-white/40 ring-4 ring-white/5" : "hover:border-white/20",
      config.glow
    )}>
      {/* Dynamic Type Glow */}
      <div className={cn(
         "absolute -inset-1 rounded-[22px] opacity-0 group-hover:opacity-100 transition-opacity blur-md z-[-1]",
         config.bg
      )} />

      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2.5 rounded-xl border transition-colors group-hover:bg-white/5",
          config.bg,
          config.border,
          config.color
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-sm tracking-tight leading-none mb-1.5">{data.label}</p>
          <div className="flex items-center gap-1.5">
             <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", config.bg.replace('bg-', 'bg-').split('/')[0])} />
             <span className="text-[9px] uppercase font-black tracking-[0.2em] text-zinc-500">{data.type}</span>
          </div>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2.5 h-2.5 !bg-zinc-800 border-2 border-zinc-900 !opacity-0 group-hover:!opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2.5 h-2.5 !bg-zinc-800 border-2 border-zinc-900 !opacity-0 group-hover:!opacity-100 transition-opacity"
      />

      {/* Selection Border Glow */}
      {selected && (
        <div className="absolute inset-0 border-2 border-white/20 rounded-2xl pointer-events-none animate-pulse" />
      )}

      {/* Interactive indicator */}
      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100">
         <div className="bg-indigo-600 p-1 rounded-full shadow-lg">
            <Zap className="w-2 h-2 text-white" />
         </div>
      </div>
    </div>
  )
})

MindNode.displayName = 'MindNode'
