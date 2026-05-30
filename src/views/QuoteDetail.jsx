import { useState, useRef, useEffect } from 'react'
import { Edit3, Printer, Trash2, Send, MessageSquare, Users, X, Activity, ArrowRight } from 'lucide-react'
import Badge from '../components/Badge.jsx'
import Preview from '../components/Preview.jsx'
import { printQuote } from '../components/PrintManager.jsx'
import { fmt, calcTotal, isOverdue, progress, CHECKLISTS } from '../lib.js'

// ── Comments ─────────────────────────────────────────────────
function CommentSection({ q, currentUser, onUpdate }) {
  const [text, setText] = useState('')
  const bottomRef = useRef(null)
  const comments = q.comments || []

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [comments.length])

  const addComment = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    const newComment = {
      id: Date.now(),
      text: trimmed,
      userName: currentUser?.name || 'Unknown',
      userId: currentUser?.id || '',
      createdAt: new Date().toISOString(),
    }
    onUpdate({ ...q, comments: [...comments, newComment] })
    setText('')
  }

  const deleteComment = (id) => onUpdate({ ...q, comments: comments.filter(c => c.id !== id) })

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })
  }

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
        <MessageSquare size={11}/> Progress Notes
        {comments.length > 0 && <span className="text-brand font-bold ml-1">({comments.length})</span>}
      </p>

      <div className="space-y-2 mb-3 max-h-72 overflow-y-auto pr-1">
        {comments.length === 0 && (
          <p className="text-xs text-slate-400 italic py-3">No notes yet — add the first one below.</p>
        )}
        {comments.map(c => (
          <div key={c.id} className="group bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-slate-700 leading-relaxed flex-1">{c.text}</p>
              {(currentUser?.role === 'admin' || c.userId === currentUser?.id) && (
                <button onClick={() => deleteComment(c.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400 shrink-0 mt-0.5">
                  <X size={12}/>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                style={{background:'#1A2B6B'}}>
                {(c.userName||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
              </div>
              <span className="text-[11px] font-semibold text-slate-500">{c.userName || 'Unknown'}</span>
              <span className="text-[10px] text-slate-400">{formatDate(c.createdAt)}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      <div className="flex gap-2">
        <textarea rows={2} value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); addComment() } }}
          placeholder="Add a progress note… (Enter to save)"
          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"/>
        <button onClick={addComment} disabled={!text.trim()}
          className="self-end px-3 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-30 hover:opacity-90 transition-all"
          style={{background:'#1A2B6B'}}>
          <Send size={14}/>
        </button>
      </div>
    </div>
  )
}

// ── Assign Users ──────────────────────────────────────────────
function AssignUsers({ q, users, onUpdate }) {
  const assigned   = q.assignedUsers || []
  const staffUsers = users
  const isAssigned = (u) => assigned.some(a => a.id === u.id)

  const toggle = (u) => {
    const next = isAssigned(u)
      ? assigned.filter(a => a.id !== u.id)
      : [...assigned, { id: u.id, name: u.name }]
    onUpdate({ ...q, assignedUsers: next })
  }

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
        <Users size={11}/> Assigned Team
      </p>
      {staffUsers.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No users yet. Add users in User Management.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {staffUsers.map(u => {
            const active = isAssigned(u)
            return (
              <button key={u.id} onClick={() => toggle(u)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all"
                style={active
                  ? { background:'#1A2B6B', color:'#fff', borderColor:'#1A2B6B' }
                  : { background:'#fff', color:'#475569', borderColor:'#e2e8f0' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                  style={{ background: active ? '#F5C518' : '#e2e8f0', color: active ? '#1A2B6B' : '#64748b' }}>
                  {u.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
                </div>
                {u.name}
                {active && <span className="text-emerald-400 font-bold">✓</span>}
              </button>
            )
          })}
        </div>
      )}
      {assigned.length > 0 && (
        <p className="text-[10px] text-slate-400 mt-2">{assigned.length} person{assigned.length!==1?'s':''} assigned</p>
      )}
    </div>
  )
}

// ── Main QuoteDetail page ─────────────────────────────────────
export default function QuoteDetail({ q, users, currentUser, onUpdate, onEdit, onDelete, onBack }) {
  if (!q) return null
  const total   = calcTotal(q)
  const over    = isOverdue(q)
  const pg      = progress(q)
  const isAdmin = currentUser?.role === 'admin'

  // Set document.title → filename when browser saves as PDF
  const handlePrint = async () => {
    const safeName = (q.clientName || 'Client').replace(/[^a-zA-Z0-9\s\-]/g, '').trim()
    const filename  = `${q.quoteNumber} - ${safeName}`
    const prev      = document.title
    document.title  = filename
    await printQuote(q, q.quoteNumber)
    document.title  = prev
  }

  const STAGE_LABELS = {
    draft:'Reopened as Draft', sent:'Quote Sent', won:'Closed Won',
    lost:'Closed Lost', inprogress:'Job Started', finished:'Job Finished',
    paid:'Payment Collected & Invoice Given',
  }

  const move = (stage) => {
    let updated = { ...q, stage }
    if (stage === 'inprogress' && !q.checklist?.length) {
      const key = q.type==='accounts'?'accounts':q.type==='hr'?'hr':q.type==='misa'?'misa':'generic'
      updated.checklist = CHECKLISTS[key].map(t => ({ text:t, done:false }))
    }
    // Append to stage log
    const logEntry = {
      id: Date.now(),
      stage,
      label: STAGE_LABELS[stage] || stage,
      fromStage: q.stage,
      userId: currentUser?.id || '',
      userName: currentUser?.name || 'Unknown',
      userRole: currentUser?.role || '',
      timestamp: new Date().toISOString(),
    }
    updated.stageLog = [...(q.stageLog || []), logEntry]
    onUpdate(updated)
  }

  return (
    <div className="anim-fade">
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_400px]">

      {/* ── LEFT: details panel ── */}
      <div className="space-y-5">

        {/* Header card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-mono text-xs font-bold text-brand mb-1">{q.quoteNumber}</p>
              <h2 className="text-2xl font-extrabold leading-tight">{q.clientName}</h2>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {q.email && <span className="text-sm text-slate-500">{q.email}</span>}
                {q.phone && (<>
                  {q.email && <span className="text-slate-300">·</span>}
                  <span className="text-sm text-slate-500">{q.phone}</span>
                  <a href={`https://wa.me/${q.phone.replace(/[^0-9]/g,'')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-white hover:opacity-90"
                    style={{background:'#25D366'}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                </>)}
              </div>
            </div>
            <Badge stage={q.stage} overdue={over}/>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[['Value',fmt(total)],['Type',q.type],['Date',q.date||'—']].map(([l,v])=>(
              <div key={l} className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{l}</p>
                <p className="font-bold text-sm capitalize">{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">Pipeline Actions</p>
          <div className="flex flex-wrap gap-2">
            {q.stage==='draft'      && <button onClick={()=>move('sent')} className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">📤 Mark as Sent</button>}
            {q.stage==='sent'       && <><button onClick={()=>move('won')} className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">🏆 Close Won</button>
                                         <button onClick={()=>move('lost')} className="px-4 py-2 rounded-xl text-xs font-bold bg-red-100 text-red-600 hover:bg-red-200 transition-colors">✗ Close Lost</button></>}
            {q.stage==='won'        && <button onClick={()=>move('inprogress')} className="px-4 py-2 rounded-xl text-xs font-bold transition-colors" style={{background:'#F5C518',color:'#1A2B6B'}}>▶ Start Job</button>}
            {q.stage==='inprogress' && (
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs"><span className="text-slate-400">Checklist progress</span><span className="font-bold text-brand">{pg.done}/{pg.total}</span></div>
                <div className="progress-bar"><div className="progress-fill" style={{width:`${pg.pct}%`}}/></div>
                {pg.done===pg.total && pg.total>0 && (
                  <button onClick={()=>move('finished')} className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">✓ Finish Job</button>
                )}
              </div>
            )}
            {q.stage==='finished' && (
              <button onClick={()=>move('paid')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors"
                style={{background:'#15803d'}}>
                💰 Mark Payment Collected & Invoice Given
              </button>
            )}
            {(q.stage==='lost'||q.stage==='paid') && (
              <button onClick={()=>move('draft')} className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 transition-colors">↩ Reopen as Draft</button>
            )}
          </div>

          {q.stage==='sent' && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Next Follow-up Date</p>
              <input type="date"
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand transition-colors"
                value={q.followUpDate||''} onChange={e=>onUpdate({...q,followUpDate:e.target.value})}/>
              {over && <p className="text-xs text-red-500 mt-1.5">⚠ This follow-up is overdue!</p>}
            </div>
          )}
        </div>

        {/* Assign team — admin only */}
        {isAdmin && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <AssignUsers q={q} users={users} onUpdate={onUpdate}/>
          </div>
        )}

        {/* Progress notes */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <CommentSection q={q} currentUser={currentUser} onUpdate={onUpdate}/>
        </div>

        {/* Payment terms / notes */}
        {(q.paymentTerms || q.notes) && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            {q.paymentTerms && (
              <div className="p-3.5 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Payment Terms</p>
                <p className="text-sm text-slate-700">{q.paymentTerms}</p>
              </div>
            )}
            {q.notes && (
              <div className="p-3.5 bg-amber-50 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">Notes</p>
                <p className="text-sm text-slate-700">{q.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Activity Timeline */}
        {(q.stageLog || []).length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Activity size={11}/> Activity Timeline
            </p>
            <div className="space-y-0">
              {[...(q.stageLog || [])].reverse().map((entry, i, arr) => {
                const isLeadEvent = !!entry._fromLead
                const STAGE_COLORS = {
                  draft:      { bg:'#f1f5f9', color:'#475569', dot:'#94a3b8' },
                  sent:       { bg:'#dbeafe', color:'#1d4ed8', dot:'#3b82f6' },
                  won:        { bg:'#d1fae5', color:'#065f46', dot:'#10b981' },
                  lost:       { bg:'#fee2e2', color:'#991b1b', dot:'#ef4444' },
                  inprogress: { bg:'#fef3c7', color:'#92400e', dot:'#f59e0b' },
                  finished:   { bg:'#ede9fe', color:'#5b21b6', dot:'#8b5cf6' },
                  paid:       { bg:'#dcfce7', color:'#14532d', dot:'#22c55e' },
                  // lead-specific stages
                  lead:       { bg:'#f0fdf4', color:'#166534', dot:'#22c55e' },
                  new:        { bg:'#dbeafe', color:'#1d4ed8', dot:'#3b82f6' },
                  contacted:  { bg:'#fef3c7', color:'#92400e', dot:'#f59e0b' },
                  qualified:  { bg:'#ede9fe', color:'#5b21b6', dot:'#8b5cf6' },
                  converted:  { bg:'#d1fae5', color:'#065f46', dot:'#10b981' },
                }
                const c = STAGE_COLORS[entry.stage] || STAGE_COLORS.draft
                const d = new Date(entry.timestamp)
                const dateStr = d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})
                const timeStr = d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})
                const isLast = i === arr.length - 1
                return (
                  <div key={entry.id} className="flex gap-3">
                    {/* Timeline line + dot */}
                    <div className="flex flex-col items-center shrink-0" style={{width:20}}>
                      <div className="w-3 h-3 rounded-full border-2 border-white shrink-0 mt-1"
                        style={{background:c.dot, boxShadow:`0 0 0 2px ${c.dot}40`}}/>
                      {!isLast && <div className="w-0.5 flex-1 mt-1 mb-0" style={{background:'#e2e8f0', minHeight:24}}/>}
                    </div>
                    {/* Content */}
                    <div className="pb-4 flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isLeadEvent && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600 uppercase tracking-wide">Lead</span>
                          )}
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{background:c.bg, color:c.color}}>
                            {entry.label}
                          </span>
                          {entry.fromStage && entry.fromStage !== 'lead' && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              from <span className="font-medium text-slate-500 capitalize">{entry.fromStage.replace('inprogress','In Progress')}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                          style={{background: isLeadEvent ? '#8b5cf6' : '#1A2B6B'}}>
                          {(entry.userName||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-slate-600">{entry.userName}</span>
                        <span className="text-[10px] text-slate-400">·</span>
                        <span className="text-[10px] text-slate-400">{dateStr}</span>
                        <span className="text-[10px] text-slate-400">·</span>
                        <span className="text-[10px] font-medium text-slate-500">{timeStr}</span>
                        {entry.userRole && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide
                            ${entry.userRole==='admin'?'bg-amber-100 text-amber-700':'bg-blue-100 text-blue-600'}`}>
                            {entry.userRole}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Action bar */}
        {isAdmin && (
          <div className="flex gap-3 pb-4">
            <button onClick={()=>onEdit(q)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-colors">
              <Edit3 size={14}/> Edit Quote
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-all"
              style={{background:'#1A2B6B'}}>
              <Printer size={14}/> Print / PDF
            </button>
            <button onClick={()=>{ onDelete(q.id) }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
              <Trash2 size={14}/> Delete
            </button>
          </div>
        )}
      </div>

      {/* ── RIGHT: quote preview ── */}
      <div className="lg:sticky lg:top-20 self-start order-first lg:order-last">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <p className="text-xs font-bold text-brand">Quote Preview</p>
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white hover:opacity-90"
              style={{background:'#1A2B6B'}}>
              <Printer size={11}/> Print
            </button>
          </div>
          <div className="overflow-y-auto" style={{maxHeight:'60vh'}}>
            <Preview q={q} qNum={q.quoteNumber}/>
          </div>
        </div>
      </div>

    </div>
    </div>
  )
}
