import React, { useState, useEffect } from 'react'
import { File, Upload, Trash2, ExternalLink, Paperclip } from 'lucide-react'
import { Button, cn } from '../ui/core'
import { supabase } from '../../lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";


interface Asset {
  id: string
  name: string
  url: string
  type: string
}

export default function VaultPanel({ nodeId }: { nodeId: string }) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchAssets()
  }, [nodeId])

  const fetchAssets = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const response = await fetch(`${API_URL}/vault/nodes/${nodeId}/assets`, {
      headers: { 'Authorization': `Bearer ${session?.access_token}` }
    })
    const data = await response.json()
    setAssets(data)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const fileName = `${Date.now()}-${file.name}`
      
      // 1. Upload to Supabase Storage
      const { data: storageData, error } = await supabase.storage
        .from('mindops-vault')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('mindops-vault')
        .getPublicUrl(fileName)

      // 2. Link to Node in Backend
      await fetch(`${API_URL}/vault/nodes/${nodeId}/assets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          name: file.name,
          url: publicUrl,
          type: file.type.includes('image') ? 'IMAGE' : 'PDF'
        }),
      })

      fetchAssets()
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setIsUploading(false)
    }
  }

  const deleteAsset = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    await fetch(`${API_URL}/vault/assets/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${session?.access_token}` }
    })
    fetchAssets()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
          <Paperclip className="w-3.5 h-3.5" />
          Vault Assets
        </h4>
        <label className="cursor-pointer">
          <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
          <div className={cn(
             "p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors",
             isUploading && "animate-pulse"
          )}>
            <Upload className="w-4 h-4 text-zinc-400" />
          </div>
        </label>
      </div>

      <div className="space-y-2">
        {assets.length === 0 ? (
          <p className="text-[10px] text-zinc-600 italic">No assets linked to this node.</p>
        ) : (
          assets.map(asset => (
            <div key={asset.id} className="group flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl hover:border-zinc-700 transition-all">
              <div className="flex items-center gap-3 overflow-hidden">
                <File className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-zinc-300 text-xs truncate max-w-[150px]">{asset.name}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={asset.url} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-zinc-800 rounded-lg">
                   <ExternalLink className="w-3.5 h-3.5 text-zinc-500 hover:text-white" />
                </a>
                <button onClick={() => deleteAsset(asset.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg">
                   <Trash2 className="w-3.5 h-3.5 text-zinc-500 hover:text-red-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
