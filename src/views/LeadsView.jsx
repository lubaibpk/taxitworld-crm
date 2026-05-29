import { useState, useEffect } from 'react'
import { Plus, Search, UserPlus, Phone, Mail, Building2, Tag, ArrowRight, Trash2, Edit3, X, Check, ChevronDown } from 'lucide-react'
import { fetchLeads, upsertLead, deleteLead } from '../supabase.js'

// ── Constants ─────────────────────────────────────────────────
export const LEAD_SOURCES = [
  { value: 'whatsapp',    label: 'WhatsApp',          emoji: '💬' },
  { value: 'referral',   label: 'Referral',           emoji: '🤝' },
  { value: 'instagram',  label: 'Instagram',          emoji: '📸' },
  { value: 'linkedin',   label: 'LinkedIn',           emoji: '💼' },
  { value: 'website',    label: 'Website',            emoji: '🌐' },
  { value: 'walk_in',    label: 'Walk-in',            emoji: '🚶' },
  { value: 'cold_call',  label: 'Cold Call',          emoji: '📞' },
  { value: 'email',      label: 'Email Campaign',     emoji: '📧' },
  { value: 'existing',   label: 'Existing Client',    emoji: '⭐' },
  { value: 'other',      label: 'Other',              emoji: '📌' },
]

export const LEAD_STATUSES = [
  { value: 'new',         label: 'New',           cls: 'bg-blue-100 text-blue-700 border-blue-200'      },
  { value: 'contacted',   label: 'Contacted',     cls: 'bg-amber-100 text-amber-700 border-amber-200'   },
  { value: 'qualified',   label: 'Qualified',     cls: 'bg-violet-100 text-violet-700 border-violet-200'},
  { value: 'converted',   label: 'Converted',     cls: 'bg-emerald-100 text-emerald-700 border-emerald-200'},
  { value: 'lost',        label: 'Lost',          cls: 'bg-red-100 text-red-600 border-red-200'         },
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

// ── Status badge ───────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = LEAD_STATUSES.find(x => x.value === status) || LEAD_STATUSES[0]
  return (
    <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${s.cls}`}>
      {s.label}
    </span>
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
    else    { set('assigned_to', ''); set('assigned_name', '') }
  }

  const submit = async () => {
    if (!form.name.trim())   return setErr('Contact name is required.')
    if (!form.source)        return setErr('Lead source is required.')
    setSaving(true); setErr('')
    try { await onSave(form) } catch(e) { setErr(e.message); setSaving(false) }
  }

  const inputCls = 'w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 transition'
  const labelCls = 'block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.45)'}}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
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
              <label className={labelCls}>Contact Name <span className="text-red-400">*</span></label>
              <input className={inputCls} placeholder="Full name" value={form.name}
                onChange={e => set('name', e.target.value)}/>
            </div>
            <div>
              <label className={labelCls}>Company</label>
              <input className={inputCls} placeholder="Company name" value={form.company}
                onChange={e => set('company', e.target.value)}/>
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Email</label>
              <input className={inputCls} type="email" placeholder="email@domain.com" value={form.email}
                onChange={e => set('email', e.target.value)}/>
            </div>
            <div>
              <label className={labelCls}>Phone / WhatsApp</label>
              <input className={inputCls} placeholder="+966 5x xxx xxxx" value={form.phone}
                onChange={e => set('phone', e.target.value)}/>
            </div>
          </div>

          {/* Source */}
          <div>
            <label className={labelCls}>Lead Source <span className="text-red-400">*</span></label>
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
              <label className={labelCls}>Service Interest</label>
              <select className={inputCls} value={form.service_interest}
                onChange={e => set('service_interest', e.target.value)}>
                <option value="">— Select —</option>
                {SERVICE_INTERESTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={form.status}
                onChange={e => set('status', e.target.value)}>
                {LEAD_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assign To */}
          <div>
            <label className={labelCls}>Assign To</label>
            <select className={inputCls}
              value={form.assigned_to || ''}
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
            <label className={labelCls}>Notes</label>
            <textarea className={inputCls} rows={3} placeholder="Any initial notes, requirements or context…"
              value={form.notes} onChange={e => set('notes', e.target.value)}/>
          </div>

          {err && <p className="text-xs text-red-500 font-semibold">{err}</p>}

          {/* Actions */}
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

// ── Lead Card (kanban column item) ─────────────────────────────
function LeadCard({ lead, onEdit, onDelete, onConvert }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-4 group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="font-bold text-sm text-slate-800 truncate">{lead.name}</p>
          {lead.company && <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
            <Building2 size={10}/> {lead.company}
          </p>}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => onEdit(lead)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <Edit3 size={12}/>
          </button>
          <button onClick={() => onDelete(lead.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 size={12}/>
          </button>
        </div>
      </div>

      <SourceBadge source={lead.source}/>

      {lead.service_interest && (
        <p className="mt-2 text-[11px] font-semibold text-slate-500 flex items-center gap-1">
          <Tag size={10}/> {lead.service_interest}
        </p>
      )}

      <div className="mt-3 space-y-1">
        {lead.phone && (
          <a href={`tel:${lead.phone}`} className="text-[11px] text-slate-500 flex items-center gap-1.5 hover:text-blue-600 transition-colors">
            <Phone size={10}/> {lead.phone}
          </a>
        )}
        {lead.email && (
          <a href={`mailto:${lead.email}`} className="text-[11px] text-slate-500 flex items-center gap-1.5 hover:text-blue-600 transition-colors truncate">
            <Mail size={10}/> {lead.email}
          </a>
        )}
      </div>

      {lead.assigned_name && (
        <div className="mt-3 flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
            style={{background:'#F5C518', color:'#1A2B6B'}}>
            {lead.assigned_name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
          </div>
          <span className="text-[11px] text-slate-500">{lead.assigned_name}</span>
        </div>
      )}

      {lead.notes && (
        <p className="mt-2 text-[11px] text-slate-400 italic line-clamp-2">{lead.notes}</p>
      )}

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="font-mono text-[10px] text-slate-300">{lead.lead_number}</span>
        {lead.status !== 'converted' && lead.status !== 'lost' && (
          <button onClick={() => onConvert(lead)}
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
            Convert <ArrowRight size={11}/>
          </button>
        )}
        {lead.status === 'converted' && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <Check size={11}/> Converted
          </span>
        )}
      </div>
    </div>
  )
}

// ── Main LeadsView ─────────────────────────────────────────────
export default function LeadsView({ users = [], onConvertToQuote, onRefresh }) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSource, setFilterSource] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editLead, setEditLead] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type='success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    try {
      setLoading(true)
      const data = await fetchLeads()
      setLeads(data)
    } catch(e) { showToast(e.message, 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSave = async (form) => {
    const saved = await upsertLead(form)
    setLeads(prev => {
      const idx = prev.findIndex(x => x.id === saved.id)
      return idx > -1 ? prev.map(x => x.id === saved.id ? saved : x) : [saved, ...prev]
    })
    setShowModal(false)
    setEditLead(null)
    showToast(editLead ? 'Lead updated!' : 'Lead added!')
    if (onRefresh) onRefresh()
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this lead?')) return
    try {
      await deleteLead(id)
      setLeads(prev => prev.filter(x => x.id !== id))
      showToast('Lead removed.', 'info')
    } catch(e) { showToast(e.message, 'error') }
  }

  const handleEdit = (lead) => { setEditLead(lead); setShowModal(true) }

  const handleConvert = (lead) => {
    if (onConvertToQuote) onConvertToQuote(lead)
  }

  // Filtered leads
  const filtered = leads.filter(l => {
    const q = search.toLowerCase()
    const matchSearch = !search
      || l.name?.toLowerCase().includes(q)
      || l.company?.toLowerCase().includes(q)
      || l.phone?.includes(q)
      || l.email?.toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all' || l.status === filterStatus
    const matchSource = filterSource === 'all' || l.source === filterSource
    return matchSearch && matchStatus && matchSource
  })

  // Stats
  const stats = LEAD_STATUSES.map(s => ({
    ...s,
    count: leads.filter(l => l.status === s.value).length
  }))

  // Source breakdown
  const sourceCounts = LEAD_SOURCES.map(s => ({
    ...s,
    count: leads.filter(l => l.source === s.value).length
  })).filter(s => s.count > 0).sort((a,b) => b.count - a.count)

  return (
    <div className="space-y-6 anim-fade">

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map(s => (
          <button key={s.value}
            onClick={() => setFilterStatus(prev => prev === s.value ? 'all' : s.value)}
            className={`bg-white rounded-2xl border p-4 text-left shadow-sm hover:shadow-md transition-all
              ${filterStatus === s.value ? 'ring-2 ring-offset-1' : ''}`}
            style={filterStatus === s.value ? {ringColor:'#1A2B6B'} : {}}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
            <p className="text-2xl font-extrabold mt-1" style={{color:'#1A2B6B'}}>{s.count}</p>
          </button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input
              className="pl-8 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 w-52"
              placeholder="Search leads…"
              value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          {/* Source filter */}
          <select
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            value={filterSource} onChange={e => setFilterSource(e.target.value)}>
            <option value="all">All Sources</option>
            {LEAD_SOURCES.map(s => (
              <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>
            ))}
          </select>
          {/* Status filter */}
          <select
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            {LEAD_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => { setEditLead(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm hover:shadow-md transition-all shrink-0"
          style={{background:'#1A2B6B'}}>
          <Plus size={15}/> Add Lead
        </button>
      </div>

      {/* ── Main content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Lead table */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-sm text-slate-700">
                {filtered.length} Lead{filtered.length !== 1 ? 's' : ''}
                {search || filterStatus !== 'all' || filterSource !== 'all' ? ' (filtered)' : ''}
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
                      {['Lead #', 'Contact', 'Source', 'Service', 'Assigned', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {h}
                        </th>
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
                        <td className="px-4 py-3">
                          <StatusBadge status={lead.status}/>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(lead)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors" title="Edit">
                              <Edit3 size={13}/>
                            </button>
                            {lead.status !== 'converted' && lead.status !== 'lost' && (
                              <button onClick={() => handleConvert(lead)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 transition-colors" title="Convert to Quote">
                                <ArrowRight size={12}/> Quote
                              </button>
                            )}
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
                        <span className="text-[11px] font-semibold text-slate-600">
                          {s.emoji} {s.label}
                        </span>
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

          {/* Quick tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-[11px] font-bold text-amber-700 mb-2">💡 Lead Workflow</p>
            <ol className="text-[11px] text-amber-600 space-y-1.5 list-decimal list-inside">
              <li>Add lead with source</li>
              <li>Assign to team member</li>
              <li>Update status as it progresses</li>
              <li>Click <strong>Convert → Quote</strong> when ready</li>
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
