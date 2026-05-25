import { useEffect, useState } from 'react'
import { useAuthStore } from './store/useAuthStore'
import { useProjectStore } from './store/useProjectStore'
import AuthPage from './pages/AuthPage'
import ProjectWorkspace from './pages/ProjectWorkspace'
import JournalView from './components/dashboard/JournalView'
import SettingsModal from './components/dashboard/SettingsModal'
import { supabase } from './lib/supabase'
import { Button, Input, cn } from './components/ui/core'
import { Plus, LayoutGrid, Settings, BrainCircuit, ExternalLink, Activity, BookOpen, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const { user, isLoading: authLoading, setUser } = useAuthStore()
  const { projects, isLoading: projectsLoading, fetchProjects, createProject } = useProjectStore()
  const [showModal, setShowModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [activeProject, setActiveProject] = useState<{ id: string, name: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'projects' | 'journal'>('projects')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [setUser])

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user, fetchProjects])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newProjectName) return
    await createProject({ name: newProjectName })
    setNewProjectName('')
    setShowModal(false)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  if (activeProject) {
    return (
      <ProjectWorkspace 
        projectId={activeProject.id} 
        projectName={activeProject.name}
        onBack={() => setActiveProject(null)} 
      />
    )
  }

  return (
    <div className="min-h-screen bg-black text-zinc-400 flex flex-col items-center">
      {/* Navbar */}
      <nav className="w-full border-b border-zinc-900 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600/10 p-1.5 rounded-lg border border-indigo-500/20">
                <BrainCircuit className="w-5 h-5 text-indigo-500" />
              </div>
              <span className="text-white font-bold tracking-tight text-lg mr-4">MindOps</span>
            </div>

            <div className="hidden md:flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
               <NavTab active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} icon={LayoutGrid}>Projects</NavTab>
               <NavTab active={activeTab === 'journal'} onClick={() => setActiveTab('journal')} icon={BookOpen}>Journal</NavTab>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right mr-2 hidden sm:block">
              <p className="text-xs font-medium text-white">{user.email?.split('@')[0]}</p>
              <p className="text-[10px] text-zinc-500">Founder Account</p>
            </div>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg hover:bg-zinc-900 transition-colors group"
            >
              <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      <main className="w-full">
        {activeTab === 'projects' ? (
          <div className="max-w-7xl mx-auto px-6 py-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <motion.h2 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="text-3xl font-bold text-white tracking-tight mb-2"
                >Projects</motion.h2>
                <motion.p 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.1 }}
                   className="text-zinc-500"
                >Manage and evolve your startup ideas.</motion.p>
              </div>
              <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex gap-3"
              >
                <Button onClick={() => setShowModal(true)} className="gap-2 shadow-indigo-500/10">
                    <Plus className="w-4 h-4" />
                    New Project
                </Button>
              </motion.div>
            </header>

            {projectsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-zinc-900 border border-zinc-900 rounded-2xl p-6 h-56 animate-pulse" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-800 rounded-3xl">
                <div className="bg-zinc-900 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Plus className="w-8 h-8 text-zinc-700" />
                </div>
                <h3 className="text-white font-medium mb-2">No projects yet</h3>
                <p className="text-zinc-500 text-sm mb-8">Start by capturing your first business idea.</p>
                <Button onClick={() => setShowModal(true)}>Create Project</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    layoutId={project.id}
                    key={project.id}
                    onClick={() => setActiveProject({ id: project.id, name: project.name })}
                    className="group relative bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 hover:bg-zinc-900 hover:border-indigo-500/30 transition-all cursor-pointer shadow-xl hover:shadow-indigo-500/10"
                  >
                    <div className="flex items-start justify-between mb-8">
                      <div className="bg-indigo-500/10 p-2.5 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all border border-indigo-500/10">
                        <Activity className="w-5 h-5 text-indigo-500 group-hover:text-white" />
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800/80 rounded-lg border border-zinc-700/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:animate-pulse" />
                        <span className="text-[10px] uppercase font-bold text-zinc-400">Active</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-white transition-colors">{project.name}</h3>
                    <p className="text-zinc-500 text-sm line-clamp-2 mb-8 h-10 group-hover:text-zinc-400 transition-colors">
                      {project.vision || "Your business vision will emerge here through collective discovery."}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase text-zinc-600 font-bold tracking-widest">Brain Nodes</span>
                          <span className="text-white font-bold text-sm tracking-tight">{project._count?.nodes || 0}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-zinc-600 group-hover:text-indigo-400 transition-colors">
                         Enter
                         <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <JournalView />
        )}
      </main>

      {/* Modals */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-[32px] p-8 relative z-10 shadow-3xl"
            >
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Initialize Brain</h2>
              <p className="text-zinc-500 text-sm mb-8">Establish a new strategic domain for your project.</p>
              
              <form onSubmit={handleCreateProject} className="space-y-8">
                <Input 
                  label="Project Name"
                  placeholder="e.g. Project Odyssey"
                  autoFocus
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
                
                <div className="flex gap-3 justify-end pt-4">
                  <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" className="px-8 shadow-indigo-500/20">Create Project</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function NavTab({ children, active, onClick, icon: Icon }: { children: React.ReactNode, active: boolean, onClick: () => void, icon: any }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-[0.1em] transition-all duration-300",
        active ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20" : "text-zinc-500 hover:text-white hover:bg-zinc-800"
      )}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  )
}

export default App
