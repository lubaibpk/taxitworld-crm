import Badge from '../components/Badge.jsx'
import { fmt, calcTotal } from '../lib.js'

export default function Archive({ quotes, onOpen }) {
  const arch = quotes.filter(q=>q.stage==='finished'||q.stage==='lost'||q.stage==='paid')
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm anim-fade">
      <div className="px-5 py-4 border-b border-slate-100">
        <span className="font-bold text-sm">Archive <span className="text-slate-400 font-normal">({arch.length})</span></span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              {['Quote #','Client','Type','Value','Outcome','Action'].map(h=>(
                <th key={h} className="text-left p-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {arch.length===0
              ? <tr><td colSpan={6} className="py-14 text-center text-sm text-slate-400">No archived records.</td></tr>
              : arch.map(q=>(
                <tr key={q.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-mono text-xs font-semibold text-brand">{q.quoteNumber}</td>
                  <td className="p-3.5 font-semibold text-sm">{q.clientName}</td>
                  <td className="p-3.5 text-xs capitalize text-slate-500">{q.type}</td>
                  <td className="p-3.5 text-sm font-bold">{fmt(calcTotal(q))}</td>
                  <td className="p-3.5"><Badge stage={q.stage}/></td>
                  <td className="p-3.5"><button onClick={()=>onOpen(q.id)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">View</button></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
