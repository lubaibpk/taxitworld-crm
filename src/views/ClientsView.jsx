import { useState, useEffect, useCallback } from 'react'
import { fetchClients, upsertClient, archiveClient } from '../supabase.js'
import { Search, Plus, X, Pencil, UserX, Mail, Phone, Hash } from 'lucide-react'

const ic  = 'w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all bg-white'
const lbl = 'block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5'
const CATS = ['prospect','active','vip','inactive']
const CAT_COLORS = { prospect:'bg-blue-100 text-blue-700', active:'bg-emerald-100 text-emerald-700', vip:'bg-amber-100 text-amber-800', inactive:'bg-slate-100 text-slate-500' }

const initials = name => (name||'?').split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase()

function ClientForm({ client, onSave, onCancel }) {
  const [f, setF] = useState(client || { name:'', company:'', email:'', phone:'', whatsapp:'', nationality:'', city:'Al Khobar', country:'Saudi Arabia', category:'prospect', source:'', cr_number:'', vat_number:'', notes:'' })
  const [saving, setSaving] = useState(false)
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }))

  const save = async () => {
    if (!f.name.trim()) return alert('Name is required')
    setSaving(true)
    try { await upsertClient(f); onSave() }
    catch(e) { alert('Failed: ' + e.message) }
    setSaving(false)
  }

  const fi = (label, key, type='text') => (
    <div>
      <label className={lbl}>{label}</label>
      <input type={type} value={f[key]||''} onChange={set(key)} className={ic}/>
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {fi('Full Name *','name')} {fi('Company','company')}
        {fi('Email','email','email')} {fi('Phone','phone','tel')}
        {fi('WhatsApp','whatsapp','tel')} {fi('Nationality','nationality')}
        {fi('CR Number','cr_number')} {fi('VAT Number','vat_number')}
        {fi('City','city')}
        <div>
          <label className={lbl}>Category</label>
          <select value={f.category||'prospect'} onChange={set('category')} className={ic}>
            {CATS.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
          </select>
        </div>
        {fi('Source (how they found us)','source')}
        <div>
          <label className={lbl}>Country</label>
          <select value={f.country||'Saudi Arabia'} onChange={set('country')} className={ic}>
            {['Saudi Arabia','UAE','Kuwait','Bahrain','Qatar','Oman','Other'].map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={lbl}>Notes</label>
        <textarea value={f.notes||''} onChange={set('notes')} rows={3} className={ic+' resize-none'}/>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button onClick={onCancel} className="px-4 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
        <button onClick={save} disabled={saving} className="px-4 py-2 text-sm text-white rounded-xl hover:opacity-90 disabled:opacity-60" style={{background:'#1A2B6B'}}>
          {saving ? 'Saving…' : 'Save client'}
        </button>
      </div>
    </div>
  )
}

export default function ClientsView({ onRefresh }) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [catFilter, setCat]   = useState('all')
  const [panel, setPanel]     = useState(null)
  const [toast, setToast]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetchClients()
    setClients(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t) }
  }, [toast])

  const filtered = clients.filter(c => {
    const s = search.toLowerCase()
    const match = !s || c.name?.toLowerCase().includes(s) || c.company?.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s) || c.phone?.includes(s)
    return match && (catFilter === 'all' || c.category === catFilter)
  })

  const doArchive = async (id) => {
    if (!confirm('Archive this client?')) return
    await archiveClient(id); setPanel(null); setToast('Client archived'); load()
    if (onRefresh) onRefresh()
  }

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—'

  return (
    <div className="space-y-4 anim-fade">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-lg text-slate-800">Clients</h2>
          <p className="text-xs text-slate-400 mt-0.5">{filtered.length} records</p>
        </div>
        <button onClick={() => setPanel('new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm hover:shadow-md transition-all"
          style={{background:'#1A2B6B'}}>
          <Plus size={14}/> New Client
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, company, email…"
            className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 bg-white"/>
        </div>
        <select value={catFilter} onChange={e => setCat(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white">
          <option value="all">All categories</option>
          {CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-4xl mb-3">👤</div>
          <p className="text-sm font-medium">No clients found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(c => (
            <div key={c.id} onClick={() => setPanel({ client: c })}
              className="bg-white border border-slate-200 rounded-2xl p-4 cursor-pointer hover:border-brand hover:shadow-md transition-all shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{background:'rgba(26,43,107,0.1)', color:'#1A2B6B'}}>
                  {initials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-slate-800 truncate">{c.name}</div>
                  <div className="text-xs text-slate-400 truncate">{c.company || 'No company'}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${CAT_COLORS[c.category]||''}`}>
                  {c.category}
                </span>
              </div>
              <div className="space-y-1">
                {c.email && <div className="flex items-center gap-2 text-xs text-slate-500"><Mail size={11}/><span className="truncate">{c.email}</span></div>}
                {c.phone && <div className="flex items-center gap-2 text-xs text-slate-500"><Phone size={11}/>{c.phone}</div>}
                {c.cr_number && <div className="flex items-center gap-2 text-xs text-slate-500"><Hash size={11}/>CR: {c.cr_number}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide panel */}
      {panel && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setPanel(null)}/>
          <div className="fixed right-0 top-0 bottom-0 w-[460px] bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-800">
                {panel === 'new' ? 'New Client' : panel.editing ? 'Edit Client' : panel.client.name}
              </span>
              <button onClick={() => setPanel(null)} className="text-slate-400 hover:text-slate-700 p-1"><X size={16}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {panel === 'new' ? (
                <ClientForm onSave={() => { setPanel(null); setToast('Client saved'); load(); if(onRefresh) onRefresh() }} onCancel={() => setPanel(null)}/>
              ) : panel.editing ? (
                <ClientForm client={panel.client} onSave={() => { setPanel(null); setToast('Updated'); load(); if(onRefresh) onRefresh() }} onCancel={() => setPanel(p => ({ ...p, editing: false }))}/>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0"
                      style={{background:'rgba(26,43,107,0.1)', color:'#1A2B6B'}}>
                      {initials(panel.client.name)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-base">{panel.client.name}</div>
                      <div className="text-sm text-slate-500">{panel.client.company || 'No company'}</div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${CAT_COLORS[panel.client.category]||''}`}>{panel.client.category}</span>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {[
                      ['Email',       panel.client.email],
                      ['Phone',       panel.client.phone],
                      ['WhatsApp',    panel.client.whatsapp],
                      ['Nationality', panel.client.nationality],
                      ['City',        panel.client.city],
                      ['Country',     panel.client.country],
                      ['CR Number',   panel.client.cr_number],
                      ['VAT Number',  panel.client.vat_number],
                      ['Source',      panel.client.source],
                      ['Added',       fmtDate(panel.client.created_at)],
                    ].filter(([,v]) => v).map(([label, val]) => (
                      <div key={label} className="flex items-center gap-3 py-2.5">
                        <span className="text-xs text-slate-400 w-24 flex-shrink-0 font-medium">{label}</span>
                        <span className="text-sm text-slate-700">{val}</span>
                      </div>
                    ))}
                  </div>
                  {panel.client.notes && <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600">{panel.client.notes}</div>}
                </div>
              )}
            </div>
            {panel !== 'new' && !panel.editing && (
              <div className="flex items-center gap-2 px-5 py-4 border-t border-slate-100">
                <button onClick={() => doArchive(panel.client.id)}
                  className="flex items-center gap-1.5 text-sm text-red-500 border border-red-200 px-3 py-2 rounded-xl hover:bg-red-50">
                  <UserX size={13}/>Archive
                </button>
                <button onClick={() => setPanel(p => ({ ...p, editing: true }))}
                  className="flex items-center gap-1.5 text-sm text-white px-4 py-2 rounded-xl hover:opacity-90 ml-auto"
                  style={{background:'#1A2B6B'}}>
                  <Pencil size={13}/>Edit
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold z-[100] shadow-xl">
          {toast}
        </div>
      )}
    </div>
  )
}
