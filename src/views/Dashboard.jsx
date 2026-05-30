import { FileText, TrendingUp, CheckCircle, Bell, AlertTriangle, Funnel, ArrowRight, Users, Zap, Target, Clock } from 'lucide-react'
import Badge from '../components/Badge.jsx'
import { fmt, calcTotal, isOverdue } from '../lib.js'

const BRAND = '#1A2B6B'
const GOLD  = '#F5C518'

// ── Rich Quote Pipeline widget ────────────────────────────────
function QuotePipeline({ quotes, onNew }) {
  const stages = [
    { key:'draft',      label:'Draft',       color:'#64748b', bg:'#f8fafc', light:'#e2e8f0' },
    { key:'sent',       label:'Sent',        color:'#3b82f6', bg:'#eff6ff', light:'#bfdbfe' },
    { key:'won',        label:'Won',         color:'#10b981', bg:'#ecfdf5', light:'#a7f3d0' },
    { key:'inprogress', label:'In Progress', color:'#f59e0b', bg:'#fffbeb', light:'#fde68a' },
    { key:'finished',   label:'Finished',    color:'#8b5cf6', bg:'#f5f3ff', light:'#ddd6fe' },
    { key:'paid',       label:'Paid',        color:'#059669', bg:'#f0fdf4', light:'#bbf7d0' },
    { key:'lost',       label:'Lost',        color:'#ef4444', bg:'#fef2f2', light:'#fecaca' },
  ]

  const total    = quotes.length || 1
  const revenue  = quotes.filter(q=>q.stage!=='lost').reduce((s,q)=>s+calcTotal(q),0)
  const wonRev   = quotes.filter(q=>['won','inprogress','finished','paid'].includes(q.stage)).reduce((s,q)=>s+calcTotal(q),0)
  const lostRev  = quotes.filter(q=>q.stage==='lost').reduce((s,q)=>s+calcTotal(q),0)
  const wonCount = quotes.filter(q=>['won','inprogress','finished','paid'].includes(q.stage)).length
  const winRate  = quotes.length > 0 ? Math.round((wonCount / quotes.length) * 100) : 0

  // Quote type breakdown
  const typeCounts = ['misa','hr','accounts','generic'].map(t => ({
    label: t==='misa'?'MISA':t==='hr'?'HR':t==='accounts'?'Accounts':'Generic',
    count: quotes.filter(q=>q.type===t).length,
    value: quotes.filter(q=>q.type===t).reduce((s,q)=>s+calcTotal(q),0),
    color: t==='misa'?'#1A2B6B':t==='hr'?'#8b5cf6':t==='accounts'?'#3b82f6':'#64748b',
  })).filter(t=>t.count>0).sort((a,b)=>b.count-a.count)

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
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

      {quotes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{background:'#eff6ff'}}>
            <Target size={20} style={{color:'#93c5fd'}}/>
          </div>
          <p className="text-sm font-semibold text-slate-400">No quotes yet</p>
          <button onClick={onNew} className="mt-2 text-xs font-bold underline" style={{color:BRAND}}>Create first quote</button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col p-5 gap-4">

          {/* Stage rows */}
          <div className="space-y-2">
            {stages.map(s => {
              const count  = quotes.filter(q => q.stage === s.key).length
              const val    = quotes.filter(q => q.stage === s.key).reduce((a,q)=>a+calcTotal(q),0)
              const pct    = Math.round((count / total) * 100)
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 w-24 shrink-0">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{background:s.color}}/>
                    <span className="text-[11px] font-bold text-slate-600 truncate">{s.label}</span>
                  </div>
                  <div className="flex-1 relative h-7 rounded-lg overflow-hidden" style={{background:s.bg}}>
                    <div className="absolute inset-y-0 left-0 rounded-lg flex items-center transition-all duration-500"
                      style={{
                        width: count > 0 ? `${Math.max(pct,5)}%` : '0%',
                        background:`linear-gradient(90deg,${s.color}bb,${s.color})`,
                        minWidth: count > 0 ? 28 : 0,
                      }}>
                      {count > 0 && <span className="text-[10px] font-bold text-white px-2">{count}</span>}
                    </div>
                    {count === 0 && (
                      <span className="absolute inset-0 flex items-center px-3 text-[10px] text-slate-300 font-semibold">—</span>
                    )}
                  </div>
                  <div className="w-20 text-right shrink-0">
                    {count > 0
                      ? <span className="text-[11px] font-bold text-slate-500">{fmt(val)}</span>
                      : <span className="text-[10px] text-slate-300">—</span>
                    }
                  </div>
                  <div className="w-8 text-right shrink-0">
                    <span className="text-[10px] font-semibold" style={{color: count>0 ? s.color : '#e2e8f0'}}>{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* KPI tiles */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100">
            <div className="text-center bg-slate-50 rounded-xl py-2.5 px-1">
              <p className="text-lg font-extrabold leading-none" style={{color:BRAND}}>{quotes.length}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-1">Total</p>
            </div>
            <div className="text-center bg-emerald-50 rounded-xl py-2.5 px-1">
              <p className="text-lg font-extrabold leading-none text-emerald-700">{wonCount}</p>
              <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-wide mt-1">Won</p>
            </div>
            <div className="text-center rounded-xl py-2.5 px-1"
              style={{background: winRate>=50?'#ecfdf5':winRate>=25?'#fffbeb':'#fef2f2'}}>
              <p className="text-lg font-extrabold leading-none"
                style={{color: winRate>=50?'#059669':winRate>=25?'#d97706':'#dc2626'}}>{winRate}%</p>
              <p className="text-[9px] font-bold uppercase tracking-wide mt-1"
                style={{color: winRate>=50?'#6ee7b7':winRate>=25?'#fcd34d':'#fca5a5'}}>Win Rate</p>
            </div>
            <div className="text-center bg-red-50 rounded-xl py-2.5 px-1">
              <p className="text-lg font-extrabold leading-none text-red-500">
                {quotes.filter(q=>q.stage==='lost').length}
              </p>
              <p className="text-[9px] font-bold text-red-300 uppercase tracking-wide mt-1">Lost</p>
            </div>
          </div>

          {/* Revenue summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl p-3 text-center" style={{background:'#f0f9ff'}}>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mb-1">Pipeline</p>
              <p className="text-sm font-extrabold leading-tight" style={{color:BRAND}}>{fmt(revenue)}</p>
            </div>
            <div className="rounded-xl p-3 text-center bg-emerald-50">
              <p className="text-[9px] font-bold uppercase tracking-wide text-emerald-500 mb-1">Won Value</p>
              <p className="text-sm font-extrabold leading-tight text-emerald-700">{fmt(wonRev)}</p>
            </div>
            <div className="rounded-xl p-3 text-center bg-red-50">
              <p className="text-[9px] font-bold uppercase tracking-wide text-red-400 mb-1">Lost Value</p>
              <p className="text-sm font-extrabold leading-tight text-red-600">{fmt(lostRev)}</p>
            </div>
          </div>

          {/* Quote type breakdown */}
          {typeCounts.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">By Service Type</p>
              <div className="grid grid-cols-2 gap-1.5">
                {typeCounts.map(t => (
                  <div key={t.label} className="flex items-center justify-between bg-slate-50 rounded-lg px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:t.color}}/>
                      <span className="text-[11px] font-semibold text-slate-600 truncate">{t.label}</span>
                    </div>
                    <div className="text-right ml-2 shrink-0">
                      <span className="text-[11px] font-extrabold" style={{color:t.color}}>{t.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

// ── Lead funnel widget ─────────────────────────────────────────
function LeadFunnel({ leads, onLeads }) {
  const stages = [
    { key:'new',       label:'New',       color:'#3b82f6', bg:'#eff6ff', light:'#dbeafe', icon:'🔵' },
    { key:'contacted', label:'Contacted', color:'#f59e0b', bg:'#fffbeb', light:'#fde68a', icon:'🟡' },
    { key:'qualified', label:'Qualified', color:'#8b5cf6', bg:'#f5f3ff', light:'#ddd6fe', icon:'🟣' },
    { key:'converted', label:'Converted', color:'#10b981', bg:'#ecfdf5', light:'#a7f3d0', icon:'🟢' },
    { key:'lost',      label:'Lost',      color:'#ef4444', bg:'#fef2f2', light:'#fecaca', icon:'🔴' },
  ]

  const SOURCE_LABELS = {
    whatsapp:'WhatsApp', referral:'Referral', instagram:'Instagram',
    linkedin:'LinkedIn', website:'Website', walk_in:'Walk-in',
    cold_call:'Cold Call', email:'Email', existing:'Existing', other:'Other',
  }

  const total      = leads.length || 1
  const active     = leads.filter(l => !['converted','lost'].includes(l.status))
  const converted  = leads.filter(l => l.status === 'converted').length
  const convRate   = leads.length > 0 ? Math.round((converted / leads.length) * 100) : 0
  const maxActive  = Math.max(...stages.slice(0,3).map(s => leads.filter(l=>l.status===s.key).length), 1)

  // Source breakdown
  const sourceCounts = Object.entries(
    leads.reduce((acc, l) => { acc[l.source] = (acc[l.source]||0)+1; return acc }, {})
  ).sort((a,b) => b[1]-a[1]).slice(0,4)

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{background:'#f5f3ff'}}>
            <Funnel size={14} style={{color:'#8b5cf6'}}/>
          </div>
          <span className="font-bold text-sm text-slate-700">Lead Pipeline</span>
        </div>
        <button onClick={onLeads} className="text-[11px] font-bold hover:underline" style={{color:BRAND}}>
          Manage Leads →
        </button>
      </div>

      {leads.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{background:'#f5f3ff'}}>
            <Funnel size={20} style={{color:'#c4b5fd'}}/>
          </div>
          <p className="text-sm font-semibold text-slate-400">No leads yet</p>
          <button onClick={onLeads} className="mt-2 text-xs font-bold underline" style={{color:BRAND}}>Add first lead</button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col p-5 gap-4">

          {/* Stage cards — each shows count + % + mini bar */}
          <div className="space-y-2">
            {stages.map(s => {
              const count = leads.filter(l => l.status === s.key).length
              const pct   = Math.round((count / total) * 100)
              // funnel width based on stage (active stages narrower as they go down)
              const isActive = ['new','contacted','qualified'].includes(s.key)
              return (
                <div key={s.key} className="flex items-center gap-3 group">
                  {/* Stage pill */}
                  <div className="flex items-center gap-1.5 w-24 shrink-0">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{background:s.color}}/>
                    <span className="text-[11px] font-bold text-slate-600 truncate">{s.label}</span>
                  </div>
                  {/* Bar */}
                  <div className="flex-1 relative h-7 rounded-lg overflow-hidden" style={{background:s.bg}}>
                    <div className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500 flex items-center"
                      style={{
                        width: count > 0 ? `${Math.max(pct, 5)}%` : '0%',
                        background: `linear-gradient(90deg, ${s.color}cc, ${s.color})`,
                        minWidth: count > 0 ? 28 : 0,
                      }}>
                      {count > 0 && <span className="text-[10px] font-bold text-white px-2">{count}</span>}
                    </div>
                    {count === 0 && (
                      <span className="absolute inset-0 flex items-center px-3 text-[10px] text-slate-300 font-semibold">—</span>
                    )}
                  </div>
                  {/* Pct + count detail */}
                  <div className="w-14 text-right shrink-0">
                    <span className="text-[12px] font-extrabold" style={{color: count > 0 ? s.color : '#cbd5e1'}}>{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100">
            <div className="text-center bg-slate-50 rounded-xl py-2.5">
              <p className="text-xl font-extrabold leading-none" style={{color:BRAND}}>{leads.length}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-1">Total</p>
            </div>
            <div className="text-center bg-blue-50 rounded-xl py-2.5">
              <p className="text-xl font-extrabold leading-none text-blue-600">{active.length}</p>
              <p className="text-[9px] font-bold text-blue-400 uppercase tracking-wide mt-1">Active</p>
            </div>
            <div className="text-center bg-emerald-50 rounded-xl py-2.5">
              <p className="text-xl font-extrabold leading-none text-emerald-600">{converted}</p>
              <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-wide mt-1">Converted</p>
            </div>
            <div className="text-center rounded-xl py-2.5" style={{background: convRate >= 50 ? '#ecfdf5' : convRate >= 25 ? '#fffbeb' : '#fef2f2'}}>
              <p className="text-xl font-extrabold leading-none"
                style={{color: convRate >= 50 ? '#059669' : convRate >= 25 ? '#d97706' : '#dc2626'}}>
                {convRate}%
              </p>
              <p className="text-[9px] font-bold uppercase tracking-wide mt-1"
                style={{color: convRate >= 50 ? '#6ee7b7' : convRate >= 25 ? '#fcd34d' : '#fca5a5'}}>
                Conv. Rate
              </p>
            </div>
          </div>

          {/* Source breakdown */}
          {sourceCounts.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Top Sources</p>
              <div className="grid grid-cols-2 gap-1.5">
                {sourceCounts.map(([src, cnt]) => (
                  <div key={src} className="flex items-center justify-between bg-slate-50 rounded-lg px-2.5 py-1.5">
                    <span className="text-[11px] font-semibold text-slate-600 truncate">
                      {SOURCE_LABELS[src] || src}
                    </span>
                    <span className="text-[11px] font-extrabold ml-2 shrink-0" style={{color:BRAND}}>{cnt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
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

      {/* ── Middle row: pipeline + lead funnel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuotePipeline quotes={quotes} onNew={onNew}/>
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
