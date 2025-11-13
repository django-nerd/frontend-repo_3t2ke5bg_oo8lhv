import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

function BrandHeader(){
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2">
            <div className="text-2xl">🥷</div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">TaskNinja</h1>
          </div>
          <p className="text-slate-300 max-w-xl">Slice your tasks. Master your day. Lightning‑fast item tracking with search, filters, inline editing, and status flows.</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-400/30 px-2 py-1">Open • In Progress • Done</span>
            <span className="text-xs rounded-full bg-white/5 text-white/80 border border-white/10 px-2 py-1">Persistent storage</span>
            <span className="text-xs rounded-full bg-white/5 text-white/80 border border-white/10 px-2 py-1">Activity logging</span>
          </div>
        </div>
        <div className="shrink-0">
          <a href="#create" className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white px-4 py-2 shadow">
            <span>New Task</span>
          </a>
        </div>
      </div>
    </div>
  )
}

function ItemForm({ onCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [tags, setTags] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    const payload = {
      title,
      description: description || undefined,
      due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
    }
    const res = await fetch(`${API_BASE}/api/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (res.ok) {
      onCreated(data)
      setTitle('')
      setDescription('')
      setDueDate('')
      setTags('')
    } else {
      alert(data.detail || 'Failed to create item')
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3" id="create">
      <div>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Task title (e.g., Ship homepage)" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" required />
      </div>
      <div>
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Brief description" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" rows={3} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
        <select className="border rounded px-3 py-2 text-slate-500 bg-slate-50" defaultValue="Open" onChange={()=>{}}>
          <option>Open</option>
          <option>In Progress</option>
          <option>Done</option>
        </select>
        <input value={tags} onChange={e=>setTags(e.target.value)} placeholder="tags (comma separated)" className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
      </div>
      <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow">Add task</button>
    </form>
  )
}

function StatusBadge({ status }){
  const color = status === 'Done' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : status === 'In Progress' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-800 border-slate-200'
  return <span className={`text-xs px-2 py-1 rounded border ${color}`}>{status}</span>
}

function ItemRow({ item, onUpdate, onDelete }){
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(item.title)
  const [description, setDescription] = useState(item.description || '')
  const [status, setStatus] = useState(item.status)

  const save = async () => {
    const res = await fetch(`${API_BASE}/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, status })
    })
    const data = await res.json()
    if (res.ok) {
      onUpdate(data)
      setEditing(false)
    } else {
      alert(data.detail || 'Update failed')
    }
  }
  const del = async () => {
    if(!confirm('Delete this item?')) return
    const res = await fetch(`${API_BASE}/api/items/${item.id}`, { method: 'DELETE' })
    if (res.ok) onDelete(item.id)
    else alert('Delete failed')
  }

  return (
    <div className="border rounded-xl p-3 bg-white hover:shadow-sm transition">
      {editing ? (
        <div className="space-y-2">
          <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" rows={2} />
          <select value={status} onChange={e=>setStatus(e.target.value)} className="border rounded px-2 py-1">
            <option>Open</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
          <div className="flex gap-2">
            <button onClick={save} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded">Save</button>
            <button onClick={()=>setEditing(false)} className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold text-slate-900 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs">TN</span>
              {item.title}
            </div>
            {item.description && <div className="text-slate-600 text-sm mt-1">{item.description}</div>}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <StatusBadge status={item.status} />
              {item.due_date && <span className="text-xs text-slate-500">Due: {new Date(item.due_date).toLocaleDateString()}</span>}
              {Array.isArray(item.tags) && item.tags.map(t => <span key={t} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">#{t}</span>)}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>setEditing(true)} className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 rounded">Edit</button>
            <button onClick={del} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Delete</button>
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')

  const load = async () => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (status) params.set('status', status)
    const res = await fetch(`${API_BASE}/api/items?${params.toString()}`)
    const data = await res.json()
    setItems(data)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => items, [items])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <BrandHeader />

        <section className="bg-white rounded-2xl shadow p-4 border border-slate-100">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><span className="text-emerald-600">➕</span> Add a task</h2>
          <ItemForm onCreated={(it)=>setItems([it, ...items])} />
        </section>

        <section className="bg-white rounded-2xl shadow p-4 border border-slate-100">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tasks" className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
              <select value={status} onChange={e=>setStatus(e.target.value)} className="border rounded px-3 py-2">
                <option value="">All</option>
                <option>Open</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={load} className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded">Filter</button>
              <button onClick={()=>{setQuery(''); setStatus(''); load()}} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded">Clear</button>
              <button onClick={load} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded">Refresh</button>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {filtered.length === 0 ? (
              <div className="text-center text-slate-500">No tasks yet</div>
            ) : (
              filtered.map(item => (
                <ItemRow key={item.id} item={item} onUpdate={(u)=>setItems(items.map(i=>i.id===u.id?u:i))} onDelete={(id)=>setItems(items.filter(i=>i.id!==id))} />
              ))
            )}
          </div>
        </section>

        <footer className="text-center text-slate-500 text-sm py-6">© {new Date().getFullYear()} TaskNinja — Built for speed and focus.</footer>
      </div>
    </div>
  )
}

export default App
