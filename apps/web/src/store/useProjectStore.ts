import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface Project {
  id: string
  name: string
  vision: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    nodes: number
  }
}

interface ProjectState {
  projects: Project[]
  isLoading: boolean
  fetchProjects: () => Promise<void>
  createProject: (data: { name: string; vision?: string }) => Promise<void>
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  isLoading: false,
  fetchProjects: async () => {
    set({ isLoading: true })
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`${API_URL}/projects`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
      const data = await response.json()
      set({ projects: Array.isArray(data) ? data : [] })
    } catch (err) {
      console.error('Failed to fetch projects', err)
    } finally {
      set({ isLoading: false })
    }
  },
  createProject: async (data) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(data),
      })
      const newProject = await response.json()
      set((state) => ({ projects: [newProject, ...state.projects] }))
    } catch (err) {
      console.error('Failed to create project', err)
    }
  },
}))
