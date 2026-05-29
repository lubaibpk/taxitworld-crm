import { FileText, TrendingUp, CheckCircle, Bell, AlertTriangle } from 'lucide-react'
import Badge from '../components/Badge.jsx'
import { fmt, calcTotal, isOverdue } from '../lib.js'

export default function Dashboard({ quotes, onOpen, onNew }) {
  const won      = quotes.filter(q=>['won','inprogress','finished'].includes(q.stage)).length
  const revenue  = quotes.filter(q=>q.stage!=='lost').reduce((s,q)=>s+calcTotal(q),0)
  const overdue  = quotes.filter(isOverdue)
  const recent   = [...quotes].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).slice(0,12)

  const StatCard = ({ icon:Icon, label, value, accent, warn }) => (
    <div className={`bg-white rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${warn?'border-red-200 bg-red-50/50':'border-slate-200'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">{label}</p>
          <p className={`text-3xl font-extrabold leading-none ${warn?'text-red-600':''}`} style={!warn?{color:accent}:{}}>{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${warn?'bg-red-100':'bg-slate-100'}`}>
          <Icon size={18} className={warn?'text-red-500':'text-slate-400'}/>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 anim-fade">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText}    label="Total Quotes"       value={quotes.length}        accent="#1A2B6B"/>
        <StatCard icon={CheckCircle} label="Deals Won"          value={won}                   accent="#059669"/>
        <StatCard icon={TrendingUp}  label="Pipeline Value"     value={fmt(revenue)}          accent="#1A2B6B"/>
        <StatCard icon={Bell}        label="Overdue Follow-ups" value={overdue.length}        warn={overdue.length>0}/>
      </div>

      {overdue.length > 0 && (
        <div className="bg-white border border-red-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center gap-2.5 px-5 py-4 bg-red-50/70 border-b border-red-100">
            <AlertTriangle size={16} className="text-red-500"/>
            <span className="font-bold text-sm text-red-700">Overdue Follow-ups ({overdue.length})</span>
          </div>
          <div className="p-4 space-y-2">
            {overdue.map(q=>(
              <div key={q.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-red-50 border border-red-100">
                <div>
                  <p className="font-bold text-sm">{q.clientName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{q.quoteNumber} · Follow-up was: <b>{q.followUpDate}</b></p>
                </div>
                <button onClick={()=>onOpen(q.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{background:'#1A2B6B'}}>
                  Open →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <span className="font-bold text-sm">Recent Quotes</span>
          <button onClick={onNew} className="text-xs font-semibold text-brand hover:underline">View All →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {['Quote #','Client','Type','Value','Stage','Action'].map(h=>(
                  <th key={h} className="text-left p-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.length===0 ? (
                <tr><td colSpan={6} className="py-14 text-center text-sm text-slate-400">
                  No quotes yet. <button onClick={()=>onNew()} className="font-bold text-brand underline">Create your first quote</button>
                </td></tr>
              ) : recent.map(q=>(
                <tr key={q.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-mono text-xs font-semibold text-brand">{q.quoteNumber}</td>
                  <td className="p-3.5 font-semibold text-sm">{q.clientName}</td>
                  <td className="p-3.5 text-xs capitalize text-slate-500">{q.type}</td>
                  <td className="p-3.5 text-sm font-bold text-slate-700">{fmt(calcTotal(q))}</td>
                  <td className="p-3.5"><Badge stage={q.stage} overdue={isOverdue(q)}/></td>
                  <td className="p-3.5">
                    <button onClick={()=>onOpen(q.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
