import { Plus, UserCheck } from 'lucide-react'
import Badge from '../components/Badge.jsx'
import { fmt, calcTotal, isOverdue } from '../lib.js'

export default function QuotesList({ quotes, onOpen, onDelete, onNew }) {
  const sorted = [...quotes].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0))
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm anim-fade">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <span className="font-bold text-sm">All Quotations <span className="text-slate-400 font-normal">({quotes.length})</span></span>
        <button onClick={onNew}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm hover:shadow-md transition-all"
          style={{background:'#1A2B6B'}}>
          <Plus size={14}/> New Quote
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              {['Quote #','Client','Type','Value','Stage','Date','Actions'].map(h=>(
                <th key={h} className="text-left p-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length===0
              ? <tr><td colSpan={7} className="py-14 text-center text-sm text-slate-400">No quotes yet.</td></tr>
              : sorted.map(q=>(
                <tr key={q.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-mono text-xs font-semibold text-brand">{q.quoteNumber}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm">{q.clientName}</span>
                      {q.clientId && <span title="Linked to client record" className="text-emerald-500"><UserCheck size={12}/></span>}
                    </div>
                  </td>
                  <td className="p-3.5 text-xs capitalize text-slate-500">{q.type}</td>
                  <td className="p-3.5 text-sm font-bold">{fmt(calcTotal(q))}</td>
                  <td className="p-3.5"><Badge stage={q.stage} overdue={isOverdue(q)}/></td>
                  <td className="p-3.5 text-xs text-slate-400">{q.date||'—'}</td>
                  <td className="p-3.5">
                    <div className="flex gap-2">
                      <button onClick={()=>onOpen(q.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">Open</button>
                      <button onClick={()=>{ if(confirm('Delete this quote?')) onDelete(q.id) }}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Del</button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
