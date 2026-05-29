import { useState, useRef, useEffect } from 'react'
import { X, Printer, Edit3, Trash2, Send, MessageSquare, Users } from 'lucide-react'
import Badge from './Badge.jsx'
import Preview from './Preview.jsx'
import { printQuote } from './PrintManager.jsx'
import { fmt, calcTotal, isOverdue, progress, CHECKLISTS } from '../lib.js'

function CommentSection({ q, onUpdate }) {
  const [text, setText] = useState('')
  const bottomRef = useRef(null)
  const comments = q.comments || []

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [comments.length])

  const addComment = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onUpdate({ ...q, comments: [...comments, { id:Date.now(), text:trimmed, createdAt:new Date().toISOString() }] })
    setText('')
  }

  const deleteComment = (id) => onUpdate({ ...q, comments: comments.filter(c=>c.id!==id) })

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) +
      ' · ' + d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})
  }

  return (
    <div className="mb-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
        <MessageSquare size={11}/> Progress Notes
        {comments.length>0 && <span className="text-brand font-bold">({comments.length})</span>}
      </p>
      <div className="space-y-2 mb-3 max-h-52 overflow-y-auto pr-1">
        {comments.length===0 && <p className="text-xs text-slate-400 italic py-2">No notes yet — add the first one below.</p>}
        {comments.map(c=>(
          <div key={c.id} className="group bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-slate-700 leading-relaxed flex-1">{c.text}</p>
              <button onClick={()=>deleteComment(c.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400 shrink-0 mt-0.5">
                <X size={11}/>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{formatDate(c.createdAt)}</p>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>
      <div className="flex gap-2">
        <textarea rows={2} value={text} onChange={e=>setText(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();addComment()} }}
          placeholder="Add a progress note… (Enter to save)"
          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs resize-none focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"/>
        <button onClick={addComment} disabled={!text.trim()}
          className="self-end px-3 py-2 rounded-xl text-white text-xs font-bold transition-all disabled:opacity-30 hover:opacity-90"
          style={{background:'#1A2B6B'}}>
          <Send size={13}/>
        </button>
      </div>
    </div>
  )
}

function AssignUsers({ q, users, onUpdate }) {
  const assigned = q.assignedUsers || []
  const isAssigned = (u) => assigned.some(a=>a.id===u.id)

  const toggle = (u) => {
    const next = isAssigned(u)
      ? assigned.filter(a=>a.id!==u.id)
      : [...assigned, { id:u.id, name:u.name }]
    onUpdate({ ...q, assignedUsers: next })
  }

  return (
    <div className="mb-6">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
        <Users size={11}/> Assigned Team
      </p>
      {users.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No staff users yet. Add users in User Management.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {users.filter(u=>u.role==='staff').map(u=>{
            const active = isAssigned(u)
            return (
              <button key={u.id} onClick={()=>toggle(u)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                style={active
                  ? {background:'#1A2B6B',color:'#fff',borderColor:'#1A2B6B'}
                  : {background:'#fff',color:'#475569',borderColor:'#e2e8f0'}}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                  style={{background: active ? '#F5C518' : '#e2e8f0', color: active ? '#1A2B6B' : '#64748b'}}>
                  {u.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
                </div>
                {u.name}
                {active && <span className="text-emerald-300 text-xs">✓</span>}
              </button>
            )
          })}
        </div>
      )}
      {assigned.length > 0 && (
        <p className="text-[10px] text-slate-400 mt-2">
          {assigned.length} person{assigned.length!==1?'s':''} assigned
        </p>
      )}
    </div>
  )
}

export default function Modal({ q, onClose, onUpdate, onEdit, onDelete, users=[], currentUser }) {
  if (!q) return null
  const total = calcTotal(q)
  const over  = isOverdue(q)
  const pg    = progress(q)

  const move = (stage) => {
    let updated = { ...q, stage }
    if (stage==='inprogress' && !q.checklist?.length) {
      const key = q.type==='accounts'?'accounts':q.type==='hr'?'hr':q.type==='misa'?'misa':'generic'
      updated.checklist = CHECKLISTS[key].map(t=>({text:t,done:false}))
    }
    onUpdate(updated)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full anim-slide overflow-hidden"
        style={{maxWidth:980,maxHeight:'90vh',display:'grid',gridTemplateColumns:'1fr 360px'}}
        onClick={e=>e.stopPropagation()}>

        {/* ── LEFT ── */}
        <div className="overflow-y-auto p-7" style={{borderRight:'1px solid #e2e8f0'}}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="font-mono text-xs font-bold text-brand mb-1">{q.quoteNumber}</p>
              <h2 className="text-2xl font-extrabold leading-tight">{q.clientName}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
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
            <div className="flex items-center gap-2">
              <Badge stage={q.stage} overdue={over}/>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><X size={16}/></button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[['Value',fmt(total)],['Type',q.type],['Date',q.date||'—']].map(([l,v])=>(
              <div key={l} className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{l}</p>
                <p className="font-bold text-sm capitalize">{v}</p>
              </div>
            ))}
          </div>

          {/* Assign users — admin only */}
          {currentUser?.role==='admin' && (
            <AssignUsers q={q} users={users} onUpdate={onUpdate}/>
          )}

          {/* Pipeline actions */}
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Pipeline Actions</p>
            <div className="flex flex-wrap gap-2">
              {q.stage==='draft'      && <button onClick={()=>move('sent')} className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-200">📤 Mark as Sent</button>}
              {q.stage==='sent'       && <><button onClick={()=>move('won')} className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200">🏆 Close Won</button>
                                           <button onClick={()=>move('lost')} className="px-4 py-2 rounded-xl text-xs font-bold bg-red-100 text-red-600 hover:bg-red-200">✗ Close Lost</button></>}
              {q.stage==='won'        && <button onClick={()=>move('inprogress')} className="px-4 py-2 rounded-xl text-xs font-bold" style={{background:'#F5C518',color:'#1A2B6B'}}>▶ Start Job</button>}
              {q.stage==='inprogress' && (
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-slate-400">Checklist</span><span className="font-bold text-brand">{pg.done}/{pg.total}</span></div>
                  <div className="progress-bar"><div className="progress-fill" style={{width:`${pg.pct}%`}}/></div>
                  {pg.done===pg.total && pg.total>0 && <button onClick={()=>move('finished')} className="mt-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700">✓ Finish Job</button>}
                </div>
              )}
              {(q.stage==='lost'||q.stage==='finished') && <button onClick={()=>move('draft')} className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50">↩ Reopen as Draft</button>}
            </div>
          </div>

          {/* Follow-up */}
          {q.stage==='sent' && (
            <div className="mb-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Next Follow-up Date</p>
              <input type="date"
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand"
                value={q.followUpDate||''} onChange={e=>onUpdate({...q,followUpDate:e.target.value})}/>
              {over && <p className="text-xs text-red-500 mt-1.5">⚠ This follow-up is overdue!</p>}
            </div>
          )}

          {/* Progress notes */}
          <div className="border-t border-slate-100 pt-5">
            <CommentSection q={q} onUpdate={onUpdate}/>
          </div>

          {/* Payment / Notes */}
          {q.paymentTerms && (
            <div className="mb-4 p-3.5 bg-slate-50 rounded-xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Payment Terms</p>
              <p className="text-xs text-slate-700">{q.paymentTerms}</p>
            </div>
          )}
          {q.notes && (
            <div className="mb-4 p-3.5 bg-amber-50 rounded-xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">Notes</p>
              <p className="text-xs text-slate-700">{q.notes}</p>
            </div>
          )}

          {/* Action bar */}
          <div className="flex gap-2 pt-5 border-t border-slate-100 mt-2">
            {currentUser?.role==='admin' && <>
              <button onClick={()=>onEdit(q)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50">
                <Edit3 size={12}/> Edit
              </button>
              <button onClick={()=>printQuote(q,q.quoteNumber)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white hover:opacity-90"
                style={{background:'#1A2B6B'}}>
                <Printer size={12}/> Print / PDF
              </button>
              <button onClick={()=>{ onDelete(q.id); onClose() }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100">
                <Trash2 size={12}/>
              </button>
            </>}
          </div>
        </div>

        {/* ── RIGHT: preview ── */}
        <div className="overflow-y-auto bg-slate-50">
          <div className="px-4 py-3 border-b border-slate-200">
            <p className="text-xs font-bold text-brand">Quote Preview</p>
          </div>
          <Preview q={q} qNum={q.quoteNumber}/>
        </div>
      </div>
    </div>
  )
}
