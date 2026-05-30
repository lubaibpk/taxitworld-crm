import { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { Plus, Search, UserPlus, Phone, Mail, ChevronDown, ArrowRight, Edit3, X, Activity, MessageSquare, Send, Clock } from 'lucide-react'
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
  { value: 'new',       label: 'New',                  cls: 'bg-blue-100 text-blue-700 border-blue-200',           dot: 'bg-blue-500'    },
  { value: 'contacted', label: 'Contacted',            cls: 'bg-amber-100 text-amber-700 border-amber-200',        dot: 'bg-amber-500'   },
  { value: 'qualified', label: 'Qualified',            cls: 'bg-violet-100 text-violet-700 border-violet-200',     dot: 'bg-violet-500'  },
  { value: 'converted', label: 'Converted → Quote',   cls: 'bg-emerald-100 text-emerald-700 border-emerald-200',  dot: 'bg-emerald-500' },
  { value: 'lost',      label: 'Lost',                 cls: 'bg-red-100 text-red-600 border-red-200',              dot: 'bg-red-400'     },
]

const STATUS_COLORS = {
  new:       { bg:'#dbeafe', color:'#1d4ed8', dot:'#3b82f6' },
  contacted: { bg:'#fef3c7', color:'#92400e', dot:'#f59e0b' },
  qualified: { bg:'#ede9fe', color:'#5b21b6', dot:'#8b5cf6' },
  converted: { bg:'#d1fae5', color:'#065f46', dot:'#10b981' },
  lost:      { bg:'#fee2e2', color:'#991b1b', dot:'#ef4444' },
}

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
const fmtDT = (iso) => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) +
    ' · ' + d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})
}

const EMPTY = {
  id:'', lead_number:'', name:'', company:'', email:'', phone:'',
  source:'other', service_interest:'', notes:'', status:'new',
  assigned_to:'', assigned_name:'', activity_log:[],
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

// ── WhatsApp icon (inline SVG so no extra dep) ────────────────
const WaIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const waLink = (phone) => `https://wa.me/${(phone||'').replace(/[^0-9]/g,'')}`

// ── Inline Status Dropdown — fixed-position popup ─────────────
function StatusDropdown({ lead, onStatusChange, onConvert }) {
  const [open, setOpen] = useState(false)
  const [pos,  setPos]  = useState({ top: 0, left: 0 })
  const btnRef = useRef(null)
  const current = LEAD_STATUSES.find(x => x.value === lead.status) || LEAD_STATUSES[0]

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const h = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target) &&
          !document.getElementById('status-popup')?.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 6, left: r.left })
    }
    setOpen(o => !o)
  }

  const choose = (s) => {
    setOpen(false)
    if (s.value === 'converted') onConvert(lead)
    else onStatusChange(lead, s.value)
  }

  return (
    <>
      <button ref={btnRef} onClick={toggle}
        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all hover:opacity-80 ${current.cls}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}/>
        {lead.status === 'converted' ? 'Converted' : current.label}
        <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180':''}`}/>
      </button>

      {open && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div id="status-popup"
          style={{ position:'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
          className="bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden min-w-[185px]">
          <p className="px-3 pt-2.5 pb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">Change Status</p>
          {LEAD_STATUSES.map(s => (
            <button key={s.value} onClick={() => choose(s)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] font-semibold text-left transition-colors
                ${s.value === lead.status
                  ? 'bg-slate-50 text-slate-300 cursor-default'
                  : s.value === 'converted'
                    ? 'hover:bg-emerald-50 text-emerald-700 font-bold'
                    : 'hover:bg-slate-50 text-slate-700'}`}>
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`}/>
              {s.label}
              {s.value === lead.status && <span className="ml-auto text-[10px] text-slate-300">current</span>}
              {s.value === 'converted' && s.value !== lead.status && <ArrowRight size={12} className="ml-auto"/>}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}

// ── Activity Timeline (for lead detail panel) ─────────────────
function LeadTimeline({ lead }) {
  const log = [...(lead.activity_log || [])].reverse()
  if (log.length === 0) return (
    <p className="text-xs text-slate-400 italic py-2">No activity yet.</p>
  )
  return (
    <div className="space-y-0">
      {log.map((entry, i, arr) => {
        const c = STATUS_COLORS[entry.status] || STATUS_COLORS.new
        const isLast = i === arr.length - 1
        return (
          <div key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center shrink-0" style={{width:18}}>
              <div className="w-2.5 h-2.5 rounded-full border-2 border-white mt-1 shrink-0"
                style={{background:c.dot, boxShadow:`0 0 0 2px ${c.dot}40`}}/>
              {!isLast && <div className="w-0.5 flex-1 mt-1" style={{background:'#e2e8f0', minHeight:20}}/>}
            </div>
            <div className="pb-3 flex-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{background:c.bg, color:c.color}}>
                {entry.label}
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                  style={{background:'#1A2B6B'}}>
                  {(entry.userName||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <span className="text-[10px] font-semibold text-slate-500">{entry.userName}</span>
                <span className="text-[10px] text-slate-400">· {fmtDT(entry.timestamp)}</span>
              </div>
              {entry.note && (
                <p className="mt-1 text-[11px] text-slate-600 bg-slate-50 rounded-lg px-2 py-1">{entry.note}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Lead Detail Side Panel ─────────────────────────────────────
function LeadPanel({ lead, users, currentUser, onClose, onStatusChange, onConvert, onAddNote, onEdit }) {
  const [noteText, setNoteText] = useState('')
  const [saving, setSaving] = useState(false)
  const src = LEAD_SOURCES.find(x => x.value === lead.source)

  const submitNote = async () => {
    const t = noteText.trim()
    if (!t) return
    setSaving(true)
    await onAddNote(lead, t)
    setNoteText('')
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{background:'rgba(0,0,0,0.35)'}}>
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100" style={{background:'#1A2B6B'}}>
          <div>
            <p className="font-mono text-[10px] text-white/50 mb-0.5">{lead.lead_number}</p>
            <h2 className="text-lg font-extrabold text-white leading-tight">{lead.name}</h2>
            {lead.company && <p className="text-sm text-white/60 mt-0.5">{lead.company}</p>}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={() => onEdit(lead)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/70">
              <Edit3 size={15}/>
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/70">
              <X size={18}/>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Quick info */}
          <div className="grid grid-cols-2 gap-3">
            {lead.phone && (
              <div className="space-y-1.5">
                <a href={`tel:${lead.phone}`} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <Phone size={13} className="text-slate-400 shrink-0"/>
                  <span className="text-xs font-semibold text-slate-700 truncate">{lead.phone}</span>
                </a>
                <a href={waLink(lead.phone)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold text-white hover:opacity-90 transition-opacity w-full"
                  style={{background:'#25D366'}}>
                  <WaIcon/> WhatsApp
                </a>
              </div>
            )}
            {lead.email && (
              <a href={`mailto:${lead.email}`} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <Mail size={13} className="text-slate-400 shrink-0"/>
                <span className="text-xs font-semibold text-slate-700 truncate">{lead.email}</span>
              </a>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-2">
            <StatusDropdown lead={lead} onStatusChange={onStatusChange} onConvert={onConvert}/>
            {src && <SourceBadge source={lead.source}/>}
            {lead.service_interest && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                {lead.service_interest}
              </span>
            )}
          </div>

          {/* Assigned */}
          {lead.assigned_name && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                style={{background:'#F5C518', color:'#1A2B6B'}}>
                {lead.assigned_name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
              </div>
              Assigned to <span className="font-semibold text-slate-700">{lead.assigned_name}</span>
            </div>
          )}

          {/* Notes */}
          {lead.notes && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-xs text-slate-700">{lead.notes}</p>
            </div>
          )}

          {/* Activity Timeline */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Activity size={11}/> Activity Timeline
            </p>
            <LeadTimeline lead={lead}/>
          </div>

          {/* Add note */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <MessageSquare size={11}/> Add Note
            </p>
            <div className="flex gap-2">
              <textarea rows={2} value={noteText} onChange={e => setNoteText(e.target.value)}
                onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); submitNote() }}}
                placeholder="Add a note… (Enter to save)"
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-brand transition-all"/>
              <button onClick={submitNote} disabled={!noteText.trim() || saving}
                className="self-end px-3 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-30 hover:opacity-90 transition-all"
                style={{background:'#1A2B6B'}}>
                <Send size={14}/>
              </button>
            </div>
          </div>
        </div>

        {/* Footer convert button */}
        {lead.status !== 'converted' && lead.status !== 'lost' && (
          <div className="p-4 border-t border-slate-100">
            <button onClick={() => onConvert(lead)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-all"
              style={{background:'#059669'}}>
              <ArrowRight size={16}/> Convert to Quote
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Client Autocomplete Input ──────────────────────────────────
function ClientAutocomplete({ value, clients, onChange }) {
  const [query, setQuery] = useState(value || '')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Sync if parent resets the value
  useEffect(() => { setQuery(value || '') }, [value])

  useEffect(() => {
    if (!open) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const filtered = query.trim().length > 0
    ? clients.filter(c => {
        const q = query.toLowerCase()
        return c.name?.toLowerCase().includes(q)
          || c.company?.toLowerCase().includes(q)
          || c.phone?.includes(q)
          || c.email?.toLowerCase().includes(q)
      }).slice(0, 6)
    : []

  const select = (c) => {
    setQuery(c.name)
    setOpen(false)
    onChange({ name: c.name, company: c.company||'', email: c.email||'', phone: c.phone||'', _clientId: c.id })
  }

  const handleChange = (e) => {
    const v = e.target.value
    setQuery(v)
    setOpen(true)
    onChange({ name: v, _clientId: null }) // free text — will create new
  }

  return (
    <div ref={ref} className="relative">
      <input
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
        placeholder="Type name or company…"
        value={query}
        onChange={handleChange}
        onFocus={() => { if (query.trim().length > 0) setOpen(true) }}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Existing Clients</p>
          {filtered.map(c => (
            <button key={c.id} type="button" onClick={() => select(c)}
              className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-blue-50 transition-colors text-left">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                style={{background:'#F5C518', color:'#1A2B6B'}}>
                {(c.name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{[c.company, c.phone].filter(Boolean).join(' · ')}</p>
              </div>
              <span className="ml-auto text-[10px] font-bold text-blue-500 shrink-0 mt-1">Select</span>
            </button>
          ))}
          <div className="px-3 py-2 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 italic">Or keep typing to create a new client</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Lead Form Modal ────────────────────────────────────────────
function LeadModal({ initial, users, clients, totalLeads, currentUser, onSave, onClose }) {
  const isEdit = !!initial?.id
  const [form, setForm] = useState(() =>
    isEdit ? { ...initial } : { ...EMPTY, id: uid(), lead_number: leadNumber(totalLeads) }
  )
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleClientSelect = ({ name, company, email, phone, _clientId }) => {
    setForm(p => ({
      ...p,
      name:      name      !== undefined ? name    : p.name,
      company:   company   !== undefined ? company : p.company,
      email:     email     !== undefined ? email   : p.email,
      phone:     phone     !== undefined ? phone   : p.phone,
      _clientId: _clientId !== undefined ? _clientId : p._clientId,
    }))
  }

  const handleAssign = (userId) => {
    const u = users.find(x => x.id === userId || x.username === userId)
    if (u) { set('assigned_to', u.id || u.username); set('assigned_name', u.name) }
    else   { set('assigned_to', ''); set('assigned_name', '') }
  }

  const submit = async () => {
    if (!form.name.trim()) return setErr('Contact name is required.')
    if (!form.source)      return setErr('Lead source is required.')
    setSaving(true); setErr('')
    // Log creation event for new leads
    let formToSave = { ...form }
    if (!isEdit) {
      const creationEvent = {
        id: Date.now(), status: 'new', label: 'Lead Created',
        userName: currentUser?.name || 'Unknown',
        userId: currentUser?.id || '',
        timestamp: new Date().toISOString(),
      }
      formToSave.activity_log = [creationEvent]
    }
    try { await onSave(formToSave) } catch(e) { setErr(e.message); setSaving(false) }
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

          {/* Contact name — with autocomplete */}
          <div>
            <label className={lbl}>Contact Name <span className="text-red-400">*</span></label>
            <ClientAutocomplete
              value={form.name}
              clients={clients}
              onChange={handleClientSelect}
            />
            {form._clientId && (
              <p className="mt-1 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                ✓ Linked to existing client
              </p>
            )}
          </div>

          {/* Company + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Company</label>
              <input className={ic} placeholder="Company name" value={form.company}
                onChange={e => set('company', e.target.value)}/>
            </div>
            <div>
              <label className={lbl}>Phone / WhatsApp</label>
              <input className={ic} placeholder="+966 5x xxx xxxx" value={form.phone}
                onChange={e => set('phone', e.target.value)}/>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={lbl}>Email</label>
            <input className={ic} type="email" placeholder="email@domain.com" value={form.email}
              onChange={e => set('email', e.target.value)}/>
          </div>

          {/* Source */}
          <div>
            <label className={lbl}>Lead Source <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-5 gap-1.5">
              {LEAD_SOURCES.map(s => (
                <button key={s.value} type="button" onClick={() => set('source', s.value)}
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
export default function LeadsView({ users = [], clients = [], onConvertToQuote, onClientSaved }) {
  const [leads, setLeads]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState('active')
  const [filterSource, setFilterSource] = useState('all')
  const [showModal, setShowModal]       = useState(false)
  const [editLead, setEditLead]         = useState(null)
  const [panelLead, setPanelLead]       = useState(null) // detail panel
  const [toast, setToast]               = useState(null)
  const currentUser = (() => { try { return JSON.parse(sessionStorage.getItem('tw_user')) } catch { return null } })()

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
    // Sync panel if open
    if (panelLead?.id === saved.id) setPanelLead(saved)
    // Auto-create client on new lead (or update existing via _clientId)
    if (!isEdit) {
      try {
        const clientPayload = {
          name: saved.name, company: saved.company || '',
          email: saved.email || '', phone: saved.phone || '',
          notes: saved.notes || '', source: saved.source || '',
          ...(form._clientId ? { id: form._clientId } : {}),
        }
        await upsertClient(clientPayload)
        if (onClientSaved) onClientSaved()
      } catch(e) { console.warn('Auto-client save failed:', e.message) }
    }
    setShowModal(false)
    setEditLead(null)
    showToast(isEdit ? 'Lead updated!' : 'Lead added & client saved!')
  }

  // ── Quick status change + log event ───────────────────────
  const handleStatusChange = async (lead, newStatus) => {
    const statusObj = LEAD_STATUSES.find(s => s.value === newStatus)
    const logEntry = {
      id: Date.now(), status: newStatus,
      label: `Status → ${statusObj?.label || newStatus}`,
      userName: currentUser?.name || 'Unknown',
      userId: currentUser?.id || '',
      timestamp: new Date().toISOString(),
    }
    const updated = { ...lead, status: newStatus, activity_log: [...(lead.activity_log || []), logEntry] }
    try {
      const saved = await upsertLead(updated)
      setLeads(prev => prev.map(x => x.id === saved.id ? saved : x))
      if (panelLead?.id === saved.id) setPanelLead(saved)
      showToast('Status updated!')
    } catch(e) { showToast(e.message, 'error') }
  }

  // ── Add note to activity log ───────────────────────────────
  const handleAddNote = async (lead, noteText) => {
    const logEntry = {
      id: Date.now(), status: lead.status,
      label: 'Note Added',
      note: noteText,
      userName: currentUser?.name || 'Unknown',
      userId: currentUser?.id || '',
      timestamp: new Date().toISOString(),
    }
    const updated = { ...lead, activity_log: [...(lead.activity_log || []), logEntry] }
    try {
      const saved = await upsertLead(updated)
      setLeads(prev => prev.map(x => x.id === saved.id ? saved : x))
      if (panelLead?.id === saved.id) setPanelLead(saved)
    } catch(e) { showToast(e.message, 'error') }
  }

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm('Remove this lead?')) return
    try {
      await deleteLead(id)
      setLeads(prev => prev.filter(x => x.id !== id))
      if (panelLead?.id === id) setPanelLead(null)
      showToast('Lead removed.', 'info')
    } catch(e) { showToast(e.message, 'error') }
  }

  const handleEdit    = (lead) => { setEditLead(lead); setShowModal(true); setPanelLead(null) }
  const handleConvert = (lead) => { if (onConvertToQuote) onConvertToQuote(lead) }

  // ── Filter ────────────────────────────────────────────────
  const filtered = leads.filter(l => {
    const q = search.toLowerCase()
    const matchSearch = !search
      || l.name?.toLowerCase().includes(q)
      || l.company?.toLowerCase().includes(q)
      || l.phone?.includes(q)
      || l.email?.toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all' ? true
      : filterStatus === 'active' ? !['converted','lost'].includes(l.status)
      : l.status === filterStatus
    const matchSource = filterSource === 'all' || l.source === filterSource
    return matchSearch && matchStatus && matchSource
  })

  const stats = LEAD_STATUSES.map(s => ({ ...s, count: leads.filter(l => l.status === s.value).length }))
  const sourceCounts = LEAD_SOURCES
    .map(s => ({ ...s, count: leads.filter(l => l.source === s.value).length }))
    .filter(s => s.count > 0).sort((a,b) => b.count - a.count)

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
            <input className="pl-8 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 w-52"
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
                      {['Lead #','Contact','Source','Service','Assigned','Status',''].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(lead => (
                      <tr key={lead.id}
                        onClick={() => setPanelLead(lead)}
                        className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors group cursor-pointer">
                        <td className="px-4 py-3 font-mono text-[11px] font-semibold" style={{color:'#1A2B6B'}}>
                          {lead.lead_number}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-sm text-slate-800">{lead.name}</p>
                          {lead.company && <p className="text-[11px] text-slate-400">{lead.company}</p>}
                          {lead.phone && (
                            <div className="flex items-center gap-1.5 mt-0.5" onClick={e => e.stopPropagation()}>
                              <a href={`tel:${lead.phone}`}
                                className="text-[11px] text-slate-400 hover:text-blue-600 flex items-center gap-1">
                                <Phone size={9}/> {lead.phone}
                              </a>
                              <a href={waLink(lead.phone)} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white hover:opacity-90 transition-opacity"
                                style={{background:'#25D366'}} title="WhatsApp">
                                <WaIcon/> WA
                              </a>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3"><SourceBadge source={lead.source}/></td>
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
                          ) : <span className="text-[11px] text-slate-300">Unassigned</span>}
                        </td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <StatusDropdown lead={lead} onStatusChange={handleStatusChange} onConvert={handleConvert}/>
                        </td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(lead)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors" title="Edit">
                              <Edit3 size={13}/>
                            </button>
                            {(lead.activity_log||[]).length > 0 && (
                              <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                                <Clock size={9}/>{(lead.activity_log||[]).length}
                              </span>
                            )}
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
              <li>Add lead — existing clients auto-fill</li>
              <li>Click a row to open activity panel</li>
              <li>Update status or add notes there</li>
              <li>Select <strong>Converted → Quote</strong> when ready</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Lead detail panel */}
      {panelLead && (
        <LeadPanel
          lead={panelLead}
          users={users}
          currentUser={currentUser}
          onClose={() => setPanelLead(null)}
          onStatusChange={handleStatusChange}
          onConvert={handleConvert}
          onAddNote={handleAddNote}
          onEdit={handleEdit}
        />
      )}

      {/* Form modal */}
      {showModal && (
        <LeadModal
          initial={editLead}
          users={users}
          clients={clients}
          totalLeads={leads.length}
          currentUser={currentUser}
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
