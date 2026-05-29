import { useState, useEffect, useRef } from 'react'
import { Plus, Search, UserPlus, Phone, ChevronDown, ArrowRight, Trash2, Edit3, X } from 'lucide-react'
import { fetchLeads, upsertLead, deleteLead, upsertClient } from '../supabase.js'

// ── Constants ─────────────────────────────────────────────────
export const LEAD_SOURCES = [
  { value: 'whatsapp',   label: 'WhatsApp',       emoji: '💬' },
  { value: 'referral',   label: 'Referral',        emoji: '🤝' },
  { value: 'instagram',  label: 'Instagram',       emoji: '📸' },
  { value: 'linkedin',   label: 'LinkedIn',        emoji: '💼' },
  { value: 'website',    label: 'Website',         emoji: '🌐' },
  { value: 'walk_in',    label: 'Walk-in',         emoji: '🚶' },
  { value: 'cold_call',  label: 'Cold Call',       emoji: '📞' },
  { value: 'email',      label: 'Email Campaign',  emoji: '📧' },
  { value: 'existing',   label: 'Existing Client', emoji: '⭐' },
  { value: 'other',      label: 'Other',           emoji: '📌' },
]

export const LEAD_STATUSES = [
  { value: 'new',       label: 'New',       cls: 'bg-blue-100 text-blue-700 border-blue-200',           dot: 'bg-blue-500'    },
  { value: 'contacted', label: 'Contacted', cls: 'bg-amber-100 text-amber-700 border-amber-200',        dot: 'bg-amber-500'   },
  { value: 'qualified', label: 'Qualified', cls: 'bg-violet-100 text-violet-700 border-violet-200',     dot: 'bg-violet-500'  },
  { value: 'converted', label: 'Converted → Quote', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  { value: 'lost',      label: 'Lost',      cls: 'bg-red-100 text-red-600 border-red-200',              dot: 'bg-red-400'     },
]

export const SERVICE_INTERESTS = [
  'MISA / Company Setup', 'HR Services', 'Bookkeeping & Accounts',
  'VAT & Tax Filing', 'Audit Services', 'PRO Services',
  'Payroll', 'Business Consulting', 'Other',
]

const uid = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
const leadNumber = (n) => {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`
  return `LD-${ymd}-${String((n||0)+1).padStart(3,'0')}`
}

const EMPTY = {
  id: '', lead_number: '', name: '', company: '', email: '', phone: '',
  source: 'other', service_interest: '', notes: '', status: 'new',
  assigned_to: '', assigned_name: '',
}

// ── Source badge ───────────────────────────────────────────────
function SourceBadge({ source }) {
  const s = LEAD_SOURCES.find(x => x.value === source) || LEAD_SOURCES[LEAD_SOURCES.length - 1]
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
      {s.emoji} {s.label}
    </span>
  )
}

// ── Inline Status Dropdown ─────────────────────────────────────
// Single click opens a small popover with all status options.
// Choosing "converted" fires onConvert instead of saving status.
function StatusDropdown({ lead, onStatusChange, onConvert }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = LEAD_STATUSES.find(x => x.value === lead.status) || LEAD_STATUSES[0]

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const choose = (s) => {
    setOpen(false)
    if (s.value === 'converted') {
      onConvert(lead)
    } else {
      onStatusChange(lead, s.value)
    }
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all hover:opacity-80 ${current.cls}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}/>
        {lead.status === 'converted' ? 'Converted' : current.label}
        <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`}/>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden min-w-[170px]">
          {LEAD_STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => choose(s)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] font-semibold text-left transition-colors
                ${s.value === lead.status
                  ? 'bg-slate-50 text-slate-400 cursor-default'
                  : s.value === 'converted'
                    ? 'hover:bg-emerald-50 text-emerald-700'
                    : 'hover:bg-slate-50 text-slate-700'}`}>
              <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`}/>
              {s.label}
              {s.value === 'converted' && <ArrowRight size={11} className="ml-auto"/>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Lead Form Modal ────────────────────────────────────────────
function LeadModal({ initial, users, totalLeads, onSave, onClose }) {
  const isEdit = !!initial?.id
  const [form, setForm] = useState(() =>
    isEdit ? { ...initial } : { ...EMPTY, id: uid(), lead_number: leadNumber(totalLeads) }
  )
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleAssign = (userId) => {
    const u = users.find(x => x.id === userId || x.username === userId)
    if (u) { set('assigned_to', u.id || u.username); set('assigned_name', u.name) }
    else   { set('assigned_to', ''); set('assigned_name', '') }
  }

  const submit = async () => {
    if (!form.name.trim()) return setErr('Contact name is required.')
    if (!form.source)      return setErr('Lead source is required.')
    setSaving(true); setErr('')
    try { await onSave(form) } catch(e) { setErr(e.message); setSaving(false) }
  }

  const ic  = 'w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 transition'
  const lbl = 'block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.45)'}}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="font-extrabold text-base" style={{color:'#1A2B6B'}}>
              {isEdit ? 'Edit Lead' : 'Add New Lead'}
            </h2>
            {!isEdit && <p className="text-[11px] text-slate-400 font-mono mt-0.5">{form.lead_number}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400">
            <X size={18}/>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Name + Company */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Contact Name <span className="text-red-400">*</span></label>
              <input className={ic} placeholder="Full name" value={form.name}
                onChange={e => set('name', e.target.value)}/>
            </div>
            <div>
              <label className={lbl}>Company</label>
              <input className={ic} placeholder="Company name" value={form.company}
                onChange={e => set('company', e.target.value)}/>
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Email</label>
              <input className={ic} type="email" placeholder="email@domain.com" value={form.email}
                onChange={e => set('email', e.target.value)}/>
            </div>
            <div>
              <label className={lbl}>Phone / WhatsApp</label>
              <input className={ic} placeholder="+966 5x xxx xxxx" value={form.phone}
                onChange={e => set('phone', e.target.value)}/>
            </div>
          </div>

          {/* Source */}
          <div>
            <label className={lbl}>Lead Source <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-5 gap-1.5">
              {LEAD_SOURCES.map(s => (
                <button key={s.value} type="button"
                  onClick={() => set('source', s.value)}
                  className={`flex flex-col items-center gap-0.5 px-1 py-2 rounded-xl border text-[10px] font-bold transition-all
                    ${form.source === s.value
                      ? 'border-[#1A2B6B] bg-[#1A2B6B] text-white shadow-md'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}>
                  <span className="text-base leading-none">{s.emoji}</span>
                  <span className="leading-tight text-center">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Service Interest + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Service Interest</label>
              <select className={ic} value={form.service_interest}
                onChange={e => set('service_interest', e.target.value)}>
                <option value="">— Select —</option>
                {SERVICE_INTERESTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Status</label>
              <select className={ic} value={form.status}
                onChange={e => set('status', e.target.value)}>
                {LEAD_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assign To */}
          <div>
            <label className={lbl}>Assign To</label>
            <select className={ic} value={form.assigned_to || ''}
              onChange={e => handleAssign(e.target.value)}>
              <option value="">— Unassigned —</option>
              {users.map(u => (
                <option key={u.id || u.username} value={u.id || u.username}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className={lbl}>Notes</label>
            <textarea className={ic} rows={3} placeholder="Any initial notes, requirements or context…"
              value={form.notes} onChange={e => set('notes', e.target.value)}/>
          </div>

          {err && <p className="text-xs text-red-500 font-semibold">{err}</p>}

          <div className="flex gap-2 pt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
              Cancel
            </button>
            <button onClick={submit} disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition shadow-sm hover:shadow-md"
              style={{background: saving ? '#94a3b8' : '#1A2B6B'}}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Lead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main LeadsView ─────────────────────────────────────────────
export default function LeadsView({ users = [], onConvertToQuote, onClientSaved }) {
  const [leads, setLeads]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilterStatus] = useState('active')
  const [filterSource, setFilterSource] = useState('all')
  const [showModal, setShowModal]   = useState(false)
  const [editLead, setEditLead]     = useState(null)
  const [toast, setToast]           = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    try { setLoading(true); setLeads(await fetchLeads()) }
    catch(e) { showToast(e.message, 'error') }
    finally  { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  // ── Save (create or edit) ──────────────────────────────────
  const handleSave = async (form) => {
    const isEdit = !!editLead?.id
    const saved  = await upsertLead(form)
    setLeads(prev => {
      const idx = prev.findIndex(x => x.id === saved.id)
      return idx > -1 ? prev.map(x => x.id === saved.id ? saved : x) : [saved, ...prev]
    })
    // Auto-create client on new lead
    if (!isEdit) {
      try {
        await upsertClient({ name: saved.name, company: saved.company || '', email: saved.email || '', phone: saved.phone || '', notes: saved.notes || '', source: saved.source || '' })
        if (onClientSaved) onClientSaved()
      } catch(e) { console.warn('Auto-client save failed:', e.message) }
    }
    setShowModal(false)
    setEditLead(null)
    showToast(isEdit ? 'Lead updated!' : 'Lead added & client saved!')
  }

  // ── Quick inline status change ─────────────────────────────
  const handleStatusChange = async (lead, newStatus) => {
    try {
      const updated = await upsertLead({ ...lead, status: newStatus })
      setLeads(prev => prev.map(x => x.id === updated.id ? updated : x))
      showToast('Status updated!')
    } catch(e) { showToast(e.message, 'error') }
  }

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm('Remove this lead?')) return
    try {
      await deleteLead(id)
      setLeads(prev => prev.filter(x => x.id !== id))
      showToast('Lead removed.', 'info')
    } catch(e) { showToast(e.message, 'error') }
  }

  const handleEdit    = (lead) => { setEditLead(lead); setShowModal(true) }
  const handleConvert = (lead) => { if (onConvertToQuote) onConvertToQuote(lead) }

  // ── Filter ────────────────────────────────────────────────
  const filtered = leads.filter(l => {
    const q = search.toLowerCase()
    const matchSearch = !search
      || l.name?.toLowerCase().includes(q)
      || l.company?.toLowerCase().includes(q)
      || l.phone?.includes(q)
      || l.email?.toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all'
      ? true
      : filterStatus === 'active'
        ? !['converted', 'lost'].includes(l.status)
        : l.status === filterStatus
    const matchSource = filterSource === 'all' || l.source === filterSource
    return matchSearch && matchStatus && matchSource
  })

  // ── Stats ─────────────────────────────────────────────────
  const stats = LEAD_STATUSES.map(s => ({
    ...s,
    count: leads.filter(l => l.status === s.value).length
  }))

  const sourceCounts = LEAD_SOURCES
    .map(s => ({ ...s, count: leads.filter(l => l.source === s.value).length }))
    .filter(s => s.count > 0)
    .sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-6 anim-fade">

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map(s => (
          <button key={s.value}
            onClick={() => setFilterStatus(prev => prev === s.value ? 'active' : s.value)}
            className={`bg-white rounded-2xl border p-4 text-left shadow-sm hover:shadow-md transition-all
              ${filterStatus === s.value ? 'border-[#1A2B6B] ring-2 ring-[#1A2B6B]/20' : 'border-slate-200'}`}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {s.value === 'converted' ? 'Converted' : s.label}
            </p>
            <p className="text-2xl font-extrabold mt-1" style={{color:'#1A2B6B'}}>{s.count}</p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input
              className="pl-8 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 w-52"
              placeholder="Search leads…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <select className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none"
            value={filterSource} onChange={e => setFilterSource(e.target.value)}>
            <option value="all">All Sources</option>
            {LEAD_SOURCES.map(s => <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>)}
          </select>
          <select className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none"
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="active">Active Leads</option>
            <option value="all">All (incl. Converted)</option>
            {LEAD_STATUSES.map(s => <option key={s.value} value={s.value}>{s.value === 'converted' ? 'Converted' : s.label}</option>)}
          </select>
        </div>
        <button onClick={() => { setEditLead(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm hover:shadow-md transition-all shrink-0"
          style={{background:'#1A2B6B'}}>
          <Plus size={15}/> Add Lead
        </button>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Table */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-700">
                {filtered.length} Lead{filtered.length !== 1 ? 's' : ''}
                {(search || filterStatus !== 'active' || filterSource !== 'all') ? ' (filtered)' : ''}
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-sm text-slate-400">Loading leads…</div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <UserPlus size={32} className="mx-auto text-slate-200 mb-3"/>
                <p className="text-sm font-semibold text-slate-400">No leads found</p>
                <p className="text-xs text-slate-300 mt-1">Add your first lead to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['Lead #', 'Contact', 'Source', 'Service', 'Assigned', 'Status', ''].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(lead => (
                      <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group">
                        <td className="px-4 py-3 font-mono text-[11px] font-semibold" style={{color:'#1A2B6B'}}>
                          {lead.lead_number}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-sm text-slate-800">{lead.name}</p>
                          {lead.company && <p className="text-[11px] text-slate-400">{lead.company}</p>}
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} className="text-[11px] text-slate-400 hover:text-blue-600 flex items-center gap-1">
                              <Phone size={9}/> {lead.phone}
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <SourceBadge source={lead.source}/>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-slate-500 max-w-[120px] truncate">
                          {lead.service_interest || '—'}
                        </td>
                        <td className="px-4 py-3">
                          {lead.assigned_name ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                                style={{background:'#F5C518', color:'#1A2B6B'}}>
                                {lead.assigned_name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                              </div>
                              <span className="text-[11px] text-slate-600 font-medium">{lead.assigned_name}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-300">Unassigned</span>
                          )}
                        </td>

                        {/* ── Inline status dropdown ── */}
                        <td className="px-4 py-3">
                          <StatusDropdown
                            lead={lead}
                            onStatusChange={handleStatusChange}
                            onConvert={handleConvert}
                          />
                        </td>

                        {/* ── Actions ── */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(lead)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors" title="Edit">
                              <Edit3 size={13}/>
                            </button>
                            <button onClick={() => handleDelete(lead.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                              <Trash2 size={13}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Source breakdown sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-sm text-slate-700 mb-4">Lead Sources</h3>
            {sourceCounts.length === 0 ? (
              <p className="text-xs text-slate-300 text-center py-4">No data yet</p>
            ) : (
              <div className="space-y-2">
                {sourceCounts.map(s => {
                  const pct = leads.length > 0 ? Math.round((s.count / leads.length) * 100) : 0
                  return (
                    <div key={s.value}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-slate-600">{s.emoji} {s.label}</span>
                        <span className="text-[11px] font-bold text-slate-500">{s.count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{width:`${pct}%`, background:'#1A2B6B'}}/>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-[11px] font-bold text-amber-700 mb-2">💡 Lead Workflow</p>
            <ol className="text-[11px] text-amber-600 space-y-1.5 list-decimal list-inside">
              <li>Add lead with source</li>
              <li>Assign to team member</li>
              <li>Click the status pill to update</li>
              <li>Select <strong>Converted → Quote</strong> when ready</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <LeadModal
          initial={editLead}
          users={users}
          totalLeads={leads.length}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditLead(null) }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className={`px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl text-white
            ${toast.type==='success'?'bg-emerald-600':toast.type==='info'?'bg-slate-700':'bg-red-600'}`}>
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  )
}
