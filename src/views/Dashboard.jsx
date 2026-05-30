import { FileText, TrendingUp, CheckCircle, Bell, AlertTriangle, Funnel, ArrowRight, Users, Zap, Target, Clock } from 'lucide-react'
import Badge from '../components/Badge.jsx'
import { fmt, calcTotal, isOverdue } from '../lib.js'

const BRAND = '#1A2B6B'
const GOLD  = '#F5C518'

// ── Mini bar chart for pipeline stages ───────────────────────
function PipelineBar({ quotes }) {
  const stages = [
    { key:'draft',      label:'Draft',       color:'#94a3b8' },
    { key:'sent',       label:'Sent',        color:'#3b82f6' },
    { key:'won',        label:'Won',         color:'#10b981' },
    { key:'inprogress', label:'In Progress', color:'#f59e0b' },
    { key:'finished',   label:'Finished',    color:'#8b5cf6' },
    { key:'lost',       label:'Lost',        color:'#ef4444' },
  ]
  const total = quotes.length || 1
  return (
    <div className="space-y-2">
      {stages.map(s => {
        const count = quotes.filter(q => q.stage === s.key).length
        const pct   = Math.round((count / total) * 100)
        if (!count) return null
        return (
          <div key={s.key} className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-slate-500 w-20 shrink-0">{s.label}</span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width:`${pct}%`, background:s.color }}/>
            </div>
            <span className="text-[11px] font-bold text-slate-600 w-6 text-right shrink-0">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Lead funnel widget ─────────────────────────────────────────
function LeadFunnel({ leads, onLeads }) {
  const statuses = [
    { key:'new',       label:'New',       color:'#3b82f6', bg:'#eff6ff' },
    { key:'contacted', label:'Contacted', color:'#f59e0b', bg:'#fffbeb' },
    { key:'qualified', label:'Qualified', color:'#8b5cf6', bg:'#f5f3ff' },
    { key:'converted', label:'Converted', color:'#10b981', bg:'#ecfdf5' },
    { key:'lost',      label:'Lost',      color:'#ef4444', bg:'#fef2f2' },
  ]
  const active = leads.filter(l => !['converted','lost'].includes(l.status))
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{background:'#f5f3ff'}}>
            <Funnel size={14} style={{color:'#8b5cf6'}}/>
          </div>
          <span className="font-bold text-sm text-slate-700">Lead Pipeline</span>
        </div>
        <button onClick={onLeads} className="text-[11px] font-bold hover:underline" style={{color:BRAND}}>
          View All →
        </button>
      </div>

      {leads.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-xs text-slate-400">No leads yet</p>
          <button onClick={onLeads} className="mt-2 text-xs font-bold text-brand underline">Add first lead</button>
        </div>
      ) : (
        <>
          {/* Funnel bars */}
          <div className="space-y-2 mb-4">
            {statuses.map(s => {
              const count = leads.filter(l => l.status === s.key).length
              if (!count) return null
              const pct = Math.round((count / leads.length) * 100)
              return (
                <div key={s.key} className="flex items-center gap-2.5">
                  <span className="text-[10px] font-bold w-16 shrink-0" style={{color:s.color}}>{s.label}</span>
                  <div className="flex-1 h-5 rounded-lg overflow-hidden" style={{background:s.bg}}>
                    <div className="h-full rounded-lg flex items-center px-2 transition-all"
                      style={{width:`${Math.max(pct,8)}%`, background:s.color}}>
                      <span className="text-[9px] font-bold text-white">{count}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary row */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
            <div className="text-center">
              <p className="text-lg font-extrabold" style={{color:BRAND}}>{leads.length}</p>
              <p className="text-[10px] text-slate-400 font-semibold">Total</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-emerald-600">{active.length}</p>
              <p className="text-[10px] text-slate-400 font-semibold">Active</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-emerald-600">
                {leads.filter(l=>l.status==='converted').length}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold">Converted</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Recent leads mini-list ─────────────────────────────────────
function RecentLeads({ leads, onLeads }) {
  const STATUS_DOT = {
    new:'bg-blue-400', contacted:'bg-amber-400',
    qualified:'bg-violet-400', converted:'bg-emerald-400', lost:'bg-red-400',
  }
  const SOURCE_EMOJI = {
    whatsapp:'💬', referral:'🤝', instagram:'📸', linkedin:'💼',
    website:'🌐', walk_in:'🚶', cold_call:'📞', email:'📧', existing:'⭐', other:'📌',
  }
  const recent = [...leads]
    .filter(l => !['converted','lost'].includes(l.status))
    .sort((a,b) => new Date(b.created_at||0) - new Date(a.created_at||0))
    .slice(0, 5)

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <span className="font-bold text-sm text-slate-700">Active Leads</span>
        <button onClick={onLeads} className="text-[11px] font-bold hover:underline" style={{color:BRAND}}>Manage →</button>
      </div>
      {recent.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400">No active leads</div>
      ) : (
        <div className="divide-y divide-slate-50">
          {recent.map(l => (
            <div key={l.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                style={{background:GOLD, color:BRAND}}>
                {(l.name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{l.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{l.company || l.service_interest || '—'}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-base">{SOURCE_EMOJI[l.source] || '📌'}</span>
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT[l.status] || 'bg-slate-300'}`}/>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function Dashboard({ quotes, leads = [], onOpen, onNew, onLeads }) {
  const won       = quotes.filter(q => ['won','inprogress','finished','paid'].includes(q.stage)).length
  const revenue   = quotes.filter(q => q.stage !== 'lost').reduce((s,q) => s + calcTotal(q), 0)
  const wonRev    = quotes.filter(q => ['won','inprogress','finished','paid'].includes(q.stage)).reduce((s,q) => s + calcTotal(q), 0)
  const overdue   = quotes.filter(isOverdue)
  const inprog    = quotes.filter(q => q.stage === 'inprogress').length
  const recent    = [...quotes].sort((a,b) => (b.createdAt||0) - (a.createdAt||0)).slice(0, 8)
  const convRate  = leads.length > 0
    ? Math.round((leads.filter(l=>l.status==='converted').length / leads.length) * 100)
    : 0

  // Top stats
  const stats = [
    { label:'Pipeline Value',    value: fmt(revenue),     sub: `${quotes.length} quotes total`,    icon: TrendingUp,   color:'#1A2B6B', bg:'#eff6ff'  },
    { label:'Revenue Won',       value: fmt(wonRev),      sub: `${won} deals closed`,              icon: CheckCircle,  color:'#059669', bg:'#ecfdf5'  },
    { label:'Active Leads',      value: leads.filter(l=>!['converted','lost'].includes(l.status)).length,
                                         sub: `${convRate}% conversion rate`,           icon: Funnel,       color:'#8b5cf6', bg:'#f5f3ff'  },
    { label:'Jobs In Progress',  value: inprog,           sub: 'active right now',                 icon: Zap,          color:'#f59e0b', bg:'#fffbeb'  },
  ]

  return (
    <div className="space-y-6 anim-fade">

      {/* ── Greeting banner ── */}
      <div className="rounded-2xl p-5 md:p-6 flex items-center justify-between gap-4 overflow-hidden relative"
        style={{background:`linear-gradient(135deg, ${BRAND} 0%, #2d4a9e 100%)`}}>
        <div className="relative z-10">
          <p className="text-white/60 text-xs font-semibold mb-1 uppercase tracking-wider">
            {new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
          </p>
          <h1 className="text-white text-xl md:text-2xl font-extrabold leading-tight">
            TaxitWorld Business CRM
          </h1>
          <p className="text-white/60 text-sm mt-1">Al Khobar · Riyadh · Jeddah · Dammam</p>
        </div>
        {/* Decorative circles */}
        <div className="absolute right-0 top-0 w-48 h-48 rounded-full opacity-10"
          style={{background:GOLD, transform:'translate(30%,-30%)'}}/>
        <div className="absolute right-16 bottom-0 w-24 h-24 rounded-full opacity-10"
          style={{background:'white', transform:'translateY(40%)'}}/>
        <div className="relative z-10 hidden sm:block text-right shrink-0">
          <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-1">Total Pipeline</p>
          <p className="text-3xl font-extrabold" style={{color:GOLD}}>{fmt(revenue)}</p>
        </div>
      </div>

      {/* ── 4 KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-xl" style={{background:s.bg}}>
                <s.icon size={16} style={{color:s.color}}/>
              </div>
              {s.label === 'Active Leads' && (
                <button onClick={onLeads}
                  className="text-[10px] font-bold hover:underline" style={{color:BRAND}}>View →</button>
              )}
            </div>
            <p className="text-2xl font-extrabold leading-none mb-1" style={{color:s.color}}>{s.value}</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide leading-tight">{s.label}</p>
            <p className="text-[11px] text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Overdue alert ── */}
      {overdue.length > 0 && (
        <div className="bg-white border border-red-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center gap-2.5 px-5 py-3.5 bg-red-50/80 border-b border-red-100">
            <AlertTriangle size={15} className="text-red-500"/>
            <span className="font-bold text-sm text-red-700">
              {overdue.length} Overdue Follow-up{overdue.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="p-4 grid gap-2 sm:grid-cols-2">
            {overdue.map(q => (
              <div key={q.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-red-50 border border-red-100">
                <div>
                  <p className="font-bold text-sm">{q.clientName}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {q.quoteNumber} · <span className="text-red-500 font-semibold">{q.followUpDate}</span>
                  </p>
                </div>
                <button onClick={() => onOpen(q.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shrink-0 ml-3"
                  style={{background:BRAND}}>
                  Open →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Middle row: pipeline bar + lead funnel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pipeline breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{background:'#eff6ff'}}>
                <Target size={14} style={{color:BRAND}}/>
              </div>
              <span className="font-bold text-sm text-slate-700">Quote Pipeline</span>
            </div>
            <button onClick={onNew} className="text-[11px] font-bold hover:underline" style={{color:BRAND}}>
              All Quotes →
            </button>
          </div>
          {quotes.length === 0
            ? <p className="text-xs text-slate-400 py-6 text-center">No quotes yet</p>
            : <PipelineBar quotes={quotes}/>
          }
          {/* Revenue won vs pipeline */}
          {quotes.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Pipeline</p>
                <p className="text-base font-extrabold" style={{color:BRAND}}>{fmt(revenue)}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-emerald-600 uppercase tracking-wide mb-1">Won</p>
                <p className="text-base font-extrabold text-emerald-700">{fmt(wonRev)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Lead funnel */}
        <LeadFunnel leads={leads} onLeads={onLeads}/>
      </div>

      {/* ── Bottom row: recent quotes + active leads ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent quotes — 2/3 width */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-slate-100">
                <FileText size={13} className="text-slate-500"/>
              </div>
              <span className="font-bold text-sm text-slate-700">Recent Quotes</span>
            </div>
            <button onClick={onNew} className="text-[11px] font-bold hover:underline" style={{color:BRAND}}>
              View All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  {['Quote #','Client','Type','Value','Stage',''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-sm text-slate-400">
                    No quotes yet.{' '}
                    <button onClick={onNew} className="font-bold text-brand underline">Create one</button>
                  </td></tr>
                ) : recent.map(q => (
                  <tr key={q.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] font-bold" style={{color:BRAND}}>{q.quoteNumber}</td>
                    <td className="px-4 py-3 font-semibold text-sm text-slate-800 max-w-[130px] truncate">{q.clientName}</td>
                    <td className="px-4 py-3 text-[11px] capitalize text-slate-500">{q.type}</td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-700">{fmt(calcTotal(q))}</td>
                    <td className="px-4 py-3"><Badge stage={q.stage} overdue={isOverdue(q)}/></td>
                    <td className="px-4 py-3">
                      <button onClick={() => onOpen(q.id)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active leads — 1/3 width */}
        <RecentLeads leads={leads} onLeads={onLeads}/>
      </div>

    </div>
  )
}
