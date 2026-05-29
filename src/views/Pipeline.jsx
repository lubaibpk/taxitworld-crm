import { fmt, calcTotal, isOverdue } from '../lib.js'

const COLS = [
  { key:'draft',      label:'Draft',              bg:'#f1f5f9', fg:'#475569' },
  { key:'sent',       label:'Quote Sent',         bg:'#dbeafe', fg:'#1d4ed8' },
  { key:'won',        label:'Closed Won',         bg:'#d1fae5', fg:'#065f46' },
  { key:'inprogress', label:'In Progress',        bg:'#fef3c7', fg:'#92400e' },
  { key:'finished',   label:'Finished',           bg:'#ede9fe', fg:'#5b21b6' },
  { key:'paid',       label:'Payment Collected',  bg:'#dcfce7', fg:'#14532d' },
  { key:'lost',       label:'Lost',               bg:'#fee2e2', fg:'#991b1b' },
]

export default function Pipeline({ quotes, onOpen }) {
  return (
    <div className="overflow-x-auto pb-6 anim-fade">
      <div className="flex gap-4" style={{minWidth:'max-content'}}>
        {COLS.map(col => {
          const qs = quotes.filter(q=>q.stage===col.key)
          return (
            <div key={col.key} style={{width:220}}>
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-t-xl text-[11px] font-bold uppercase tracking-wider"
                style={{background:col.bg, color:col.fg}}>
                <span>{col.label}</span>
                <span className="opacity-60 font-mono">{qs.length}</span>
              </div>
              <div className="bg-slate-50/80 border border-t-0 border-slate-200 rounded-b-xl p-2.5 space-y-2" style={{minHeight:280}}>
                {qs.length===0
                  ? <p className="text-center text-xs text-slate-300 pt-8">—</p>
                  : qs.map(q=>(
                    <div key={q.id} onClick={()=>onOpen(q.id)}
                      className="bg-white border border-slate-200 rounded-xl p-3.5 cursor-pointer hover:border-brand/40 hover:shadow-md transition-all">
                      <p className="font-bold text-xs leading-snug text-slate-800">{q.clientName}</p>
                      <p className="font-mono text-[10px] text-slate-400 mt-1">{q.quoteNumber}</p>
                      <p className="text-xs font-extrabold mt-2 text-brand">{fmt(calcTotal(q))}</p>
                      <p className="text-[10px] text-slate-400 capitalize mt-0.5">{q.type}</p>
                      {isOverdue(q) && <span className="mt-1.5 inline-block text-[10px] font-bold bg-red-50 text-red-500 border border-red-200 px-2 py-0.5 rounded-full anim-pulse">⚠ Due</span>}
                    </div>
                  ))
                }
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
