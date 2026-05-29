import { useState, useRef } from 'react'
import { Printer } from 'lucide-react'
import { fmt, calcTotal } from '../lib.js'

const STAGES = ['draft','sent','negotiation','inprogress','finished','won','lost']
const TYPES  = ['misa','accounts','hr','generic']
const STAGE_COLORS = { draft:'bg-slate-100 text-slate-600', sent:'bg-blue-100 text-blue-700', negotiation:'bg-amber-100 text-amber-700', inprogress:'bg-purple-100 text-purple-700', finished:'bg-cyan-100 text-cyan-700', won:'bg-emerald-100 text-emerald-700', lost:'bg-red-100 text-red-600' }

function Bar({ pct }) {
  return (
    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{width:`${Math.max(pct,0)}%`, background:'#1A2B6B'}}/>
    </div>
  )
}

function Stat({ label, value, sub, green }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-xl font-extrabold ${green ? 'text-emerald-600' : 'text-brand'}`}>{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  )
}

function PrintReport({ quotes, dateFrom, dateTo }) {
  const now = new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})
  const won     = quotes.filter(q => q.stage === 'won')
  const wonRev  = won.reduce((s,q)=>s+calcTotal(q),0)
  const total   = quotes.reduce((s,q)=>s+calcTotal(q),0)
  const winRate = quotes.length ? Math.round(won.length/quotes.length*100) : 0

  return (
    <div style={{fontFamily:'Plus Jakarta Sans,sans-serif',color:'#0f172a',padding:0}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,paddingBottom:14,borderBottom:'2px solid #1A2B6B'}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,color:'#1A2B6B'}}>TaxitWorld</div>
          <div style={{fontSize:10,color:'#64748b',marginTop:2}}>Business Consultancy | Al Khobar · Riyadh · Jeddah · Dammam</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:17,fontWeight:700,color:'#1A2B6B'}}>Quote Report</div>
          <div style={{fontSize:10,color:'#64748b',marginTop:2}}>Printed: {now}</div>
          {(dateFrom||dateTo) && <div style={{fontSize:10,color:'#64748b'}}>Period: {dateFrom||'—'} to {dateTo||'—'}</div>}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
        {[['Total Quotes',quotes.length,''],['Won Revenue',fmt(wonRev),won.length+' deals'],
          ['Pipeline',fmt(quotes.filter(q=>!['won','lost'].includes(q.stage)).reduce((s,q)=>s+calcTotal(q),0)),'excl. won/lost'],
          ['Win Rate',winRate+'%',won.length+' of '+quotes.length+' won']
        ].map(([label,value,sub])=>(
          <div key={label} style={{background:'#f8fafc',borderRadius:8,padding:10,border:'1px solid #e2e8f0'}}>
            <div style={{fontSize:9,color:'#64748b',marginBottom:3,textTransform:'uppercase',letterSpacing:'0.05em'}}>{label}</div>
            <div style={{fontSize:15,fontWeight:700,color:'#1A2B6B'}}>{value}</div>
            {sub && <div style={{fontSize:9,color:'#94a3b8',marginTop:2}}>{sub}</div>}
          </div>
        ))}
      </div>

      <table style={{width:'100%',borderCollapse:'collapse',fontSize:11,marginBottom:14}}>
        <thead>
          <tr style={{background:'#1A2B6B',color:'white'}}>
            {['Quote #','Client','Type','Date','Stage','Total (incl. VAT)'].map(h=>(
              <th key={h} style={{padding:'7px 9px',textAlign:'left',fontWeight:600,fontSize:10}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {quotes.map((q,i)=>(
            <tr key={q.id} style={{background:i%2===0?'#fff':'#f8fafc',borderBottom:'1px solid #e2e8f0'}}>
              <td style={{padding:'6px 9px',fontFamily:'monospace',fontSize:10,color:'#1A2B6B'}}>{q.quoteNumber}</td>
              <td style={{padding:'6px 9px',fontWeight:500}}>{q.clientName||'—'}</td>
              <td style={{padding:'6px 9px',textTransform:'uppercase',fontSize:9,fontWeight:700,color:'#1A2B6B'}}>{q.type}</td>
              <td style={{padding:'6px 9px',color:'#64748b'}}>{q.date||'—'}</td>
              <td style={{padding:'6px 9px'}}>
                <span style={{fontSize:9,padding:'2px 6px',borderRadius:10,fontWeight:600,
                  background:q.stage==='won'?'#dcfce7':q.stage==='lost'?'#fee2e2':q.stage==='sent'?'#dbeafe':'#f1f5f9',
                  color:q.stage==='won'?'#166534':q.stage==='lost'?'#991b1b':q.stage==='sent'?'#1d4ed8':'#475569',
                }}>{q.stage}</span>
              </td>
              <td style={{padding:'6px 9px',fontWeight:600,textAlign:'right'}}>{fmt(calcTotal(q))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{background:'#1A2B6B',color:'white'}}>
            <td colSpan={5} style={{padding:'7px 9px',fontWeight:700,fontSize:10}}>TOTAL ({quotes.length} quotes)</td>
            <td style={{padding:'7px 9px',fontWeight:700,textAlign:'right'}}>{fmt(total)}</td>
          </tr>
        </tfoot>
      </table>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        {[['By Stage', STAGES.map(stage=>{const qs=quotes.filter(q=>q.stage===stage); return qs.length?{label:stage,count:qs.length,total:qs.reduce((s,q)=>s+calcTotal(q),0)}:null}).filter(Boolean)],
          ['By Type',  TYPES.map(type=>{const qs=quotes.filter(q=>q.type===type);   return qs.length?{label:type, count:qs.length,total:qs.reduce((s,q)=>s+calcTotal(q),0)}:null}).filter(Boolean)]
        ].map(([title, rows])=>(
          <div key={title} style={{border:'1px solid #e2e8f0',borderRadius:8,overflow:'hidden'}}>
            <div style={{background:'#f8fafc',padding:'7px 11px',fontWeight:600,fontSize:11,borderBottom:'1px solid #e2e8f0'}}>{title}</div>
            <table style={{width:'100%',fontSize:10,borderCollapse:'collapse'}}>
              <tbody>
                {rows.map(r=>(
                  <tr key={r.label} style={{borderBottom:'1px solid #f1f5f9'}}>
                    <td style={{padding:'5px 11px',textTransform:'capitalize'}}>{r.label}</td>
                    <td style={{padding:'5px 11px',color:'#64748b'}}>{r.count} quotes</td>
                    <td style={{padding:'5px 11px',fontWeight:600,textAlign:'right'}}>{fmt(r.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div style={{marginTop:20,paddingTop:10,borderTop:'1px solid #e2e8f0',display:'flex',justifyContent:'space-between',fontSize:9,color:'#94a3b8'}}>
        <span>TaxitWorld Business Consultancy · www.taxitworld.com</span>
        <span>Confidential — for internal use only</span>
      </div>
    </div>
  )
}

export default function ReportsView({ quotes }) {
  const [tab,         setTab]         = useState('summary')
  const [dateFrom,    setDateFrom]    = useState('')
  const [dateTo,      setDateTo]      = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [typeFilter,  setTypeFilter]  = useState('all')
  const printRef = useRef(null)

  const filtered = quotes.filter(q => {
    const d = q.date || ''
    if (dateFrom && d < dateFrom) return false
    if (dateTo   && d > dateTo)   return false
    if (stageFilter !== 'all' && q.stage !== stageFilter) return false
    if (typeFilter  !== 'all' && q.type  !== typeFilter)  return false
    return true
  })

  const won      = filtered.filter(q => q.stage === 'won')
  const pipeline = filtered.filter(q => !['won','lost'].includes(q.stage))
  const wonRev   = won.reduce((s,q)=>s+calcTotal(q),0)
  const pipeVal  = pipeline.reduce((s,q)=>s+calcTotal(q),0)
  const winRate  = filtered.length ? Math.round(won.length/filtered.length*100) : 0

  const stageGroups = STAGES.map(s => ({ stage:s, count:filtered.filter(q=>q.stage===s).length, total:filtered.filter(q=>q.stage===s).reduce((a,q)=>a+calcTotal(q),0) }))
  const typeGroups  = TYPES.map(t  => ({ type:t,  count:filtered.filter(q=>q.type===t).length,  total:filtered.filter(q=>q.type===t).reduce((a,q)=>a+calcTotal(q),0) })).filter(g=>g.count>0)

  const clientGroups = Object.values(
    filtered.reduce((acc,q) => {
      const k = q.clientName||'Unknown'
      if (!acc[k]) acc[k] = { name:k, count:0, total:0 }
      acc[k].count++; acc[k].total += calcTotal(q)
      return acc
    }, {})
  ).sort((a,b)=>b.total-a.total).slice(0,10)
  const maxCT = Math.max(...clientGroups.map(c=>c.total), 1)

  const printReport = () => {
    const portal = document.getElementById('print-portal')
    if (portal && printRef.current) {
      portal.innerHTML = printRef.current.innerHTML
      window.print()
    }
  }

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—'
  const initials = name => (name||'?').split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase()

  return (
    <div className="space-y-4 anim-fade">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-lg text-slate-800">Reports</h2>
          <p className="text-xs text-slate-400 mt-0.5">{filtered.length} quotes in view</p>
        </div>
        <button onClick={printReport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-colors">
          <Printer size={14}/>Print report
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
        {[['summary','Summary'],['quote-list','Quote list'],['pipeline','By stage'],['clients','By client']].map(([k,label])=>(
          <button key={k} onClick={()=>setTab(k)}
            className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${tab===k ? 'bg-white shadow text-brand' : 'text-slate-500 hover:text-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white"/>
        <span className="text-slate-400 text-sm">to</span>
        <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white"/>
        <select value={stageFilter} onChange={e=>setStageFilter(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white">
          <option value="all">All stages</option>
          {STAGES.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
        <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white">
          <option value="all">All types</option>
          {TYPES.map(t=><option key={t} value={t}>{t.toUpperCase()}</option>)}
        </select>
        {(dateFrom||dateTo||stageFilter!=='all'||typeFilter!=='all') && (
          <button onClick={()=>{setDateFrom('');setDateTo('');setStageFilter('all');setTypeFilter('all')}}
            className="text-xs text-slate-400 hover:text-slate-700 border border-slate-200 px-3 py-2 rounded-xl bg-white">
            Clear
          </button>
        )}
      </div>

      {/* Summary */}
      {tab==='summary' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Total quotes" value={filtered.length} sub="in selected range"/>
            <Stat label="Won revenue" value={fmt(wonRev).replace('SAR ','')} sub={`SAR · ${won.length} deals`} green/>
            <Stat label="Open pipeline" value={fmt(pipeVal).replace('SAR ','')} sub="SAR excl. won/lost"/>
            <Stat label="Win rate" value={winRate+'%'} sub={`${won.length} won of ${filtered.length}`}/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">By stage</h3>
              <div className="space-y-3">
                {stageGroups.map(({stage,count,total})=>(
                  <div key={stage}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="capitalize font-semibold text-slate-700">{stage}</span>
                      <span className="text-slate-400">{count} · {fmt(total)}</span>
                    </div>
                    <Bar pct={filtered.length ? count/filtered.length*100 : 0}/>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">By type</h3>
              {typeGroups.length === 0 ? <p className="text-slate-400 text-sm text-center py-6">No data</p> : (
                <div className="divide-y divide-slate-50">
                  {typeGroups.map(({type,count,total})=>(
                    <div key={type} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase" style={{color:'#1A2B6B'}}>{type}</span>
                        <span className="text-xs text-slate-400">{count} quotes</span>
                      </div>
                      <span className="text-sm font-bold text-slate-700">{fmt(total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quote list */}
      {tab==='quote-list' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{['Quote #','Client','Type','Date','Stage','Total (incl. VAT)'].map(h=><th key={h} className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(q=>(
                  <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{q.quoteNumber}</td>
                    <td className="px-4 py-3 font-semibold">{q.clientName||'—'}</td>
                    <td className="px-4 py-3 text-xs uppercase font-bold text-brand">{q.type}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{q.date||'—'}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-bold ${STAGE_COLORS[q.stage]||''}`}>{q.stage}</span></td>
                    <td className="px-4 py-3 font-bold text-right">{fmt(calcTotal(q))}</td>
                  </tr>
                ))}
                {filtered.length===0 && <tr><td colSpan={6} className="text-center py-10 text-slate-400">No quotes match filters</td></tr>}
              </tbody>
              {filtered.length>0 && (
                <tfoot>
                  <tr style={{background:'#1A2B6B'}} className="text-white">
                    <td colSpan={5} className="px-4 py-3 font-bold text-xs">TOTAL ({filtered.length} quotes)</td>
                    <td className="px-4 py-3 font-bold text-right">{fmt(filtered.reduce((s,q)=>s+calcTotal(q),0))}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* Pipeline */}
      {tab==='pipeline' && (
        <div className="space-y-3">
          {STAGES.map(stage=>{
            const qs = filtered.filter(q=>q.stage===stage)
            return (
              <div key={stage} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${STAGE_COLORS[stage]}`}>{stage}</span>
                    <span className="text-xs text-slate-400">{qs.length} quotes</span>
                  </div>
                  <span className="font-bold text-sm text-slate-700">{fmt(qs.reduce((s,q)=>s+calcTotal(q),0))}</span>
                </div>
                {qs.length>0 && (
                  <div className="divide-y divide-slate-50">
                    {qs.map(q=>(
                      <div key={q.id} className="px-5 py-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{q.clientName||'—'}</div>
                          <div className="text-xs text-slate-400 font-mono">{q.quoteNumber} · {q.date||'—'}</div>
                        </div>
                        <span className="font-bold text-sm">{fmt(calcTotal(q))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* By client */}
      {tab==='clients' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Top clients by quote value</h3>
          {clientGroups.length===0 ? <p className="text-slate-400 text-sm text-center py-8">No data</p> : (
            <div className="space-y-4">
              {clientGroups.map(({name,count,total})=>(
                <div key={name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{background:'rgba(26,43,107,0.1)',color:'#1A2B6B'}}>
                        {initials(name)}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{name}</span>
                      <span className="text-xs text-slate-400">{count} quotes</span>
                    </div>
                    <span className="font-bold text-sm">{fmt(total)}</span>
                  </div>
                  <Bar pct={Math.round(total/maxCT*100)}/>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hidden print content */}
      <div ref={printRef} style={{display:'none'}}>
        <PrintReport quotes={filtered} dateFrom={dateFrom} dateTo={dateTo}/>
      </div>
    </div>
  )
}
