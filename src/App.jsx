import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

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
    <form onSubmit={submit} className="space-y-3">
      <div>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full border rounded px-3 py-2" required />
      </div>
      <div>
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="w-full border rounded px-3 py-2" rows={3} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="border rounded px-3 py-2" />
        <select className="border rounded px-3 py-2" defaultValue="Open" onChange={()=>{}}>
          <option>Open</option>
          <option>In Progress</option>
          <option>Done</option>
        </select>
        <input value={tags} onChange={e=>setTags(e.target.value)} placeholder="tags (comma separated)" className="border rounded px-3 py-2" />
      </div>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Add</button>
    </form>
  )
}

function StatusBadge({ status }){
  const color = status === 'Done' ? 'bg-green-100 text-green-800' : status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
  return <span className={`text-xs px-2 py-1 rounded ${color}`}>{status}</span>
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
    <div className="border rounded p-3 bg-white">
      {editing ? (
        <div className="space-y-2">
          <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border rounded px-2 py-1" />
          <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full border rounded px-2 py-1" rows={2} />
          <select value={status} onChange={e=>setStatus(e.target.value)} className="border rounded px-2 py-1">
            <option>Open</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
          <div className="flex gap-2">
            <button onClick={save} className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
            <button onClick={()=>setEditing(false)} className="bg-gray-200 px-3 py-1 rounded">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-medium text-gray-900">{item.title}</div>
            {item.description && <div className="text-gray-600 text-sm mt-1">{item.description}</div>}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <StatusBadge status={item.status} />
              {item.due_date && <span className="text-xs text-gray-500">Due: {new Date(item.due_date).toLocaleDateString()}</span>}
              {Array.isArray(item.tags) && item.tags.map(t => <span key={t} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">#{t}</span>)}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>setEditing(true)} className="bg-blue-600 text-white px-3 py-1 rounded">Edit</button>
            <button onClick={del} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Tracking Board</h1>
          <button onClick={load} className="px-3 py-2 bg-slate-800 text-white rounded">Refresh</button>
        </header>

        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">Add new item</h2>
          <ItemForm onCreated={(it)=>setItems([it, ...items])} />
        </section>

        <section className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search" className="border rounded px-3 py-2" />
              <select value={status} onChange={e=>setStatus(e.target.value)} className="border rounded px-3 py-2">
                <option value="">All</option>
                <option>Open</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={load} className="px-3 py-2 bg-blue-600 text-white rounded">Filter</button>
              <button onClick={()=>{setQuery(''); setStatus(''); load()}} className="px-3 py-2 bg-gray-200 rounded">Clear</button>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {filtered.length === 0 ? (
              <div className="text-center text-gray-500">No items yet</div>
            ) : (
              filtered.map(item => (
                <ItemRow key={item.id} item={item} onUpdate={(u)=>setItems(items.map(i=>i.id===u.id?u:i))} onDelete={(id)=>setItems(items.filter(i=>i.id!==id))} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
