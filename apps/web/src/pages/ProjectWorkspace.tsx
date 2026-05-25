import { useEffect, useCallback, useState } from 'react'
import ReactFlow, { 
  Background, 
  Controls, 
  Panel,
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useGraphStore } from '../store/useGraphStore'
import { MindNode } from '../components/graph/MindNode'
import ChatSidebar from '../components/graph/ChatSidebar'
import VaultPanel from '../components/graph/VaultPanel'
import FinancialModule from '../components/graph/FinancialModule'
import { Button, cn } from '../components/ui/core'
import { ChevronLeft, Save, MousePointer2, Share2, BrainCircuit, Sparkles, Send, X, MessagesSquare, Info, Settings2, DollarSign, History, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const nodeTypes = {
  mindNode: MindNode
}

interface ProjectWorkspaceProps {
  projectId: string
  projectName: string
  onBack: () => void
}

function GraphCanvas({ projectId, projectName, onBack }: ProjectWorkspaceProps) {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    loadGraph, 
    saveGraph, 
    setNodes,
    processBrainDump,
    isLoading,
    loadSnapshot,
    saveSnapshot,
    fetchSnapshots
  } = useGraphStore()

  const [showBrainDump, setShowBrainDump] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [brainDumpText, setBrainDumpText] = useState('')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [inspectorTab, setInspectorTab] = useState<'details' | 'finance'>('details')
  
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [showEvolution, setShowEvolution] = useState(false)
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(0)

  useEffect(() => {
    loadGraph(projectId)
  }, [projectId, loadGraph])

  const onSave = useCallback(async () => {
    await saveGraph(projectId)
    await saveSnapshot(projectId)
  }, [projectId, saveGraph, saveSnapshot])

  const addNode = useCallback(() => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'mindNode',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: 'New Idea', type: 'IDEA' },
    }
    setNodes([...nodes, newNode])
  }, [nodes, setNodes])

  const handleBrainDump = async () => {
    if (!brainDumpText) return
    await processBrainDump(projectId, brainDumpText)
    setBrainDumpText('')
    setShowBrainDump(false)
  }

  const handleEvolutionToggle = async () => {
    if (!showEvolution) {
      const fetched = await fetchSnapshots(projectId)
      setSnapshots(fetched)
      setCurrentSnapshotIndex(0)
      if (fetched.length > 0) {
        loadSnapshot(fetched[0].id)
      }
    } else {
      loadGraph(projectId)
    }
    setShowEvolution(!showEvolution)
  }

  const handleSnapshotChange = (index: number) => {
    setCurrentSnapshotIndex(index)
    if (snapshots[index]) {
      loadSnapshot(snapshots[index].id)
    }
  }

  const onNodeClick = (_: any, node: any) => {
    setSelectedNodeId(node.id)
  }

  const onPaneClick = () => {
    setSelectedNodeId(null)
  }

  const selectedNode = nodes.find(n => n.id === selectedNodeId)

  return (
    <div className="h-screen w-full bg-black relative overflow-hidden flex">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-black"
        >
          <Background color="#18181b" gap={25} size={1} />
          
          {/* Navigation / Header Panel */}
          <Panel position="top-left" className="flex items-center gap-4 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-2 rounded-2xl ml-4 mt-4 shadow-2xl">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-zinc-800 rounded-xl transition-colors group"
            >
              <ChevronLeft className="w-5 h-5 text-zinc-400 group-hover:text-white" />
            </button>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex flex-col pr-4">
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Project Workspace</span>
              <span className="text-white font-bold text-sm tracking-tight">{projectName}</span>
            </div>
          </Panel>

          {/* Action Controls Panel */}
          <Panel position="top-right" className="flex items-center gap-2 mr-4 mt-4">
            {isLoading && (
              <div className="mr-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">AI Thinking...</span>
              </div>
            )}
            <Button variant="outline" className={cn("gap-2 bg-zinc-900/50 backdrop-blur-xl transition-all", showEvolution && "border-amber-500/50 text-amber-500")} onClick={handleEvolutionToggle}>
              <History className="w-4 h-4" />
              {showEvolution ? "Exit Evolution" : "Evolution"}
            </Button>
            <Button variant="outline" className="gap-2 bg-zinc-900/50 backdrop-blur-xl" onClick={() => useGraphStore.getState().autoLayout()}>
              <BrainCircuit className="w-4 h-4" />
              Layout
            </Button>
            <Button variant="outline" className="gap-2 bg-zinc-900/50 backdrop-blur-xl" onClick={onSave}>
              <Save className="w-4 h-4" />
              Capture
            </Button>
            <Button className="gap-2 shadow-indigo-500/10" onClick={() => setShowBrainDump(true)}>
              <Sparkles className="w-4 h-4" />
              Brain Dump
            </Button>
          </Panel>

          {/* Bottom Tools Panel */}
          <Panel position="bottom-center" className="mb-6 flex flex-col items-center gap-4">
            <AnimatePresence>
               {showEvolution && snapshots.length > 0 && (
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="bg-zinc-900/90 backdrop-blur-2xl border border-zinc-800 p-6 rounded-3xl w-[500px] shadow-3xl mb-4"
                 >
                    <div className="flex items-center justify-between mb-4">
                       <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-amber-500 flex items-center gap-2">
                         <Clock className="w-3.5 h-3.5" />
                         Evolution Timeline
                       </h4>
                       <span className="text-[10px] text-zinc-500 font-bold">
                         {new Date(snapshots[currentSnapshotIndex]?.createdAt).toLocaleString()}
                       </span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max={snapshots.length - 1}
                      step="1"
                      value={currentSnapshotIndex}
                      onChange={(e) => handleSnapshotChange(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between mt-2">
                       <span className="text-[9px] text-zinc-600 font-bold uppercase">Beginning</span>
                       <span className="text-[9px] text-zinc-600 font-bold uppercase">Latest</span>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>

            <div className="bg-zinc-900/80 backdrop-blur-2xl border border-zinc-800 p-1.5 rounded-2xl flex items-center gap-1 shadow-3xl">
              <ToolButton icon={MousePointer2} active={!showEvolution} />
              <ToolButton icon={BrainCircuit} onClick={addNode} />
              <div className="w-px h-4 bg-zinc-800 mx-1" />
              <ToolButton icon={MessagesSquare} onClick={() => setShowChat(true)} />
              <ToolButton icon={Share2} />
            </div>
          </Panel>

          <Controls className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden fill-white" />
        </ReactFlow>
      </div>

      {/* Node Inspector Sidebar */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div 
            initial={{ x: 600 }}
            animate={{ x: 0 }}
            exit={{ x: 600 }}
            className={cn(
               "bg-zinc-950 border-l border-zinc-900 h-full flex flex-col z-[50] shadow-3xl transition-all duration-300",
               inspectorTab === 'finance' ? "w-[600px]" : "w-96"
            )}
          >
            <div className="p-6 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800/50">
                     <button 
                        onClick={() => setInspectorTab('details')}
                        className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", inspectorTab === 'details' ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300")}
                     >Info</button>
                     <button 
                        onClick={() => setInspectorTab('finance')}
                        className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", inspectorTab === 'finance' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-zinc-500 hover:text-zinc-300")}
                     >Finance</button>
                  </div>
                  <button onClick={() => setSelectedNodeId(null)} className="p-1.5 hover:bg-zinc-900 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-zinc-500 hover:text-white" />
                  </button>
               </div>
               <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                    {inspectorTab === 'finance' ? <DollarSign className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-white font-bold tracking-tight">{selectedNode.data.label}</h3>
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">{selectedNode.data.type}</p>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
               {inspectorTab === 'details' ? (
                 <div className="space-y-12">
                    <section>
                        <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                          <Settings2 className="w-3.5 h-3.5 text-zinc-600" />
                          Core Properties
                        </h4>
                        <div className="space-y-6">
                          <div>
                            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">Label</label>
                            <input 
                              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                              value={selectedNode.data.label}
                              onChange={(e) => {
                                const nextNodes = nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, label: e.target.value } } : n)
                                setNodes(nextNodes)
                              }}
                            />
                          </div>
                          <div>
                             <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">Strategic Vision</label>
                             <textarea 
                              placeholder="Define the core value proposition..."
                              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-100 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all leading-relaxed"
                              value={selectedNode.data.content || ''}
                              onChange={(e) => {
                                const nextNodes = nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, content: e.target.value } } : n)
                                setNodes(nextNodes)
                              }}
                             />
                          </div>
                        </div>
                    </section>

                    <VaultPanel nodeId={selectedNode.id} />
                 </div>
               ) : (
                 <FinancialModule projectId={projectId} />
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Co-Founder Chat */}
      <ChatSidebar 
        projectId={projectId} 
        isOpen={showChat} 
        onClose={() => setShowChat(false)} 
      />

      {/* AI Brain Dump Modal */}
      <AnimatePresence>
        {showBrainDump && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBrainDump(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden relative z-10 shadow-3xl"
            >
              <div className="p-8 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-indigo-500" />
                    AI Intelligence
                  </h2>
                  <p className="text-zinc-500 text-sm mt-1">Dump your messy thoughts and let the AI structure your business model.</p>
                </div>
                <button onClick={() => setShowBrainDump(false)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>
              
              <div className="p-8 pt-0 space-y-6">
                <textarea 
                  autoFocus
                  placeholder="e.g. I want to build a platform for founders to manage their ideas. It needs an interactive graph view, AI co-founder, and a financial planning module. Risks include high competition from Notion..."
                  value={brainDumpText}
                  onChange={(e) => setBrainDumpText(e.target.value)}
                  className="w-full h-64 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 resize-none transition-all leading-relaxed"
                />
                
                <div className="flex gap-3 justify-end items-center">
                  <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest mr-auto italic italic">AI structures nodes & relationships automatically</p>
                  <Button variant="ghost" onClick={() => setShowBrainDump(false)}>Cancel</Button>
                  <Button onClick={handleBrainDump} disabled={!brainDumpText || isLoading} className="gap-2">
                    <Send className="w-4 h-4" />
                    Process Brain Dump
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

function ToolButton({ icon: Icon, active, onClick }: { icon: any, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={cn(
      "p-2.5 rounded-xl transition-all duration-200",
      active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
    )}>
      <Icon className="w-4.5 h-4.5" />
    </button>
  )
}

export default function ProjectWorkspace(props: ProjectWorkspaceProps) {
  return (
    <ReactFlowProvider>
      <GraphCanvas {...props} />
    </ReactFlowProvider>
  )
}
