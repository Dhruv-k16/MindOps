import { create } from 'zustand'
import { 
  type Connection, 
  type Edge, 
  type EdgeChange, 
  type Node, 
  type NodeChange, 
  addEdge, 
  applyEdgeChanges, 
  applyNodeChanges,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  Position
} from 'reactflow'
import { supabase } from '../lib/supabase'
import dagre from 'dagre'

interface GraphState {
  nodes: Node[]
  edges: Edge[]
  isLoading: boolean
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  saveGraph: (projectId: string) => Promise<void>
  loadGraph: (projectId: string) => Promise<void>
  autoLayout: () => void
  processBrainDump: (projectId: string, text: string) => Promise<void>
  loadSnapshot: (snapshotId: string) => Promise<void>
  saveSnapshot: (projectId: string) => Promise<void>
  fetchSnapshots: (projectId: string) => Promise<any[]>
}

const API_URL = 'http://localhost:3000'

const dagreGraph = new dagre.graphlib.Graph()
dagreGraph.setDefaultEdgeLabel(() => ({}))

const nodeWidth = 200
const nodeHeight = 80

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  isLoading: false,
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    })
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    })
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    })
  },
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  loadGraph: async (projectId) => {
    set({ isLoading: true })
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`${API_URL}/projects/${projectId}/graph`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      })
      const data = await response.json()
      set({ nodes: data.nodes || [], edges: data.edges || [] })
    } catch (err) {
      console.error('Failed to load graph', err)
    } finally {
      set({ isLoading: false })
    }
  },
  saveGraph: async (projectId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch(`${API_URL}/projects/${projectId}/graph`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          nodes: get().nodes,
          edges: get().edges,
        }),
      })
    } catch (err) {
      console.error('Failed to save graph', err)
    }
  },
  autoLayout: () => {
    const { nodes, edges } = get()
    dagreGraph.setGraph({ rankdir: 'TB', marginx: 50, marginy: 50 })

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
    })

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target)
    })

    dagre.layout(dagreGraph)

    const nextNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id)
      return {
        ...node,
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        },
      }
    })

    set({ nodes: nextNodes })
  },
  processBrainDump: async (_projectId, text) => {
    set({ isLoading: true })
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`${API_URL}/ai/brain-dump`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ text }),
      })
      const { nodes: newNodes, edges: newEdges } = await response.json()
      
      const rfNodes = newNodes.map((n: any) => ({
        id: `ai-${Date.now()}-${n.id}`,
        type: 'mindNode',
        position: { x: Math.random() * 200, y: Math.random() * 200 },
        data: { label: n.label, type: n.type || 'IDEA', content: n.content }
      }))

      const rfEdges = newEdges.map((e: any) => ({
        id: `edge-${Date.now()}-${e.source}-${e.target}`,
        source: rfNodes.find((n: any) => n.id.endsWith(e.source))?.id || e.source,
        target: rfNodes.find((n: any) => n.id.endsWith(e.target))?.id || e.target,
        label: e.label,
      }))

      set((state) => ({ 
        nodes: [...state.nodes, ...rfNodes],
        edges: [...state.edges, ...rfEdges]
      }))

      get().autoLayout()
    } catch (err) {
      console.error('Brain dump processing failed', err)
    } finally {
      set({ isLoading: false })
    }
  },
  loadSnapshot: async (snapshotId) => {
    set({ isLoading: true })
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`${API_URL}/snapshots/${snapshotId}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      })
      const data = await response.json()
      set({ nodes: data.state.nodes || [], edges: data.state.edges || [] })
    } catch (err) {
      console.error('Failed to load snapshot', err)
    } finally {
      set({ isLoading: false })
    }
  },
  saveSnapshot: async (projectId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch(`${API_URL}/snapshots/project/${projectId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          state: {
            nodes: get().nodes,
            edges: get().edges,
          }
        }),
      })
    } catch (err) {
      console.error('Failed to save snapshot', err)
    }
  },
  fetchSnapshots: async (projectId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`${API_URL}/snapshots/project/${projectId}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      })
      return await response.json()
    } catch (err) {
      console.error('Failed to fetch snapshots', err)
      return []
    }
  }
}))
