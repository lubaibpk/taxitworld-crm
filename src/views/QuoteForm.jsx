import { useState } from 'react'
import { Plus, Trash2, Printer, Save } from 'lucide-react'
import { MISA_DEFAULT_ITEMS, fmt, today, calcSubtotal, calcVAT, calcTotal, VAT_RATE, HR_SERVICE_GROUPS } from '../lib.js'
import Preview from '../components/Preview.jsx'
import { printQuote } from '../components/PrintManager.jsx'

const ic  = 'w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all bg-white'
const lbl = 'block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5'

/* ── MISA ─────────────────────────────────────────────────── */
function MisaFields({ d, set }) {
  const items = d.misaItems || JSON.parse(JSON.stringify(MISA_DEFAULT_ITEMS))
  const upd  = (newItems) => set({ ...d, misaItems: newItems })
  const edit = (id, key, val) => upd(items.map(it => it.id===id ? {...it,[key]:val} : it))
  const add  = () => upd([...items, { id: Date.now(), service:'', byTaxit:true }])
  const del  = (id) => upd(items.filter(it => it.id!==id))

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <span className="font-bold text-sm">MISA / Company Setup Services</span>
        <button onClick={add} type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-slate-50 transition-colors">
          <Plus size={12}/> Add Row
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{background:'#1A2B6B'}}>
              <th className="p-3 text-white text-[10px] font-bold w-10 text-center">#</th>
              <th className="p-3 text-white text-[10px] font-bold text-left">Service Description</th>
              <th className="p-3 text-white text-[10px] font-bold w-28 text-center">By Taxit</th>
              <th className="p-3 w-10"/>
            </tr>
          </thead>
          <tbody>
            {items.map((it,i) => (
              <tr key={it.id} className={i%2===0?'bg-white':'bg-slate-50/60'}>
                <td className="p-2 text-center text-xs text-slate-400 font-mono">{i+1}</td>
                <td className="p-2">
                  <input value={it.service} onChange={e=>edit(it.id,'service',e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-brand transition-colors"
                    placeholder="Service description"/>
                </td>
                <td className="p-2 text-center">
                  <select value={String(it.byTaxit)} onChange={e=>edit(it.id,'byTaxit',e.target.value==='true')}
                    className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-brand">
                    <option value="true">✓ By Taxit</option>
                    <option value="false">✗ Client Scope</option>
                  </select>
                </td>
                <td className="p-2 text-center">
                  <button onClick={()=>del(it.id)} type="button"
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                    <Trash2 size={12}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-5 border-t border-slate-100 grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Total Fees (SAR)</label>
          <input type="number" className={ic} placeholder="25000"
            value={d.misaTotal||''} onChange={e=>set({...d,misaTotal:e.target.value})}/>
        </div>
        <div>
          <label className={lbl}>Total in Words</label>
          <input className={ic} placeholder="Twenty Five Thousand Saudi Riyals Only"
            value={d.misaTotalWords||''} onChange={e=>set({...d,misaTotalWords:e.target.value})}/>
        </div>
      </div>
    </div>
  )
}

/* ── ACCOUNTS ─────────────────────────────────────────────── */
function AccountsFields({ d, set }) {
  const f = k => ({ value: d[k]||'', onChange: e => set({...d,[k]:e.target.value}) })
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <h3 className="font-bold text-sm mb-4 pb-3 border-b border-slate-100">Accounts Work Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={lbl}>Monthly Bookkeeping Rate (SAR)</label><input type="number" className={ic} placeholder="1500" {...f('bookkeepingRate')}/></div>
        <div><label className={lbl}>Tax Preparation Fee (SAR)</label><input type="number" className={ic} placeholder="2000" {...f('taxFee')}/></div>
        <div><label className={lbl}>Audit Support Hours</label><input type="number" className={ic} placeholder="10" {...f('auditHours')}/></div>
        <div><label className={lbl}>Hourly Audit Rate (SAR)</label><input type="number" className={ic} placeholder="250" {...f('auditRate')}/></div>
        <div className="col-span-2"><label className={lbl}>Scope Description</label>
          <textarea className={ic} rows={3} placeholder="Describe accounting scope..." {...f('accountsScope')}/></div>
      </div>
    </div>
  )
}

/* ── HR ───────────────────────────────────────────────────── */
// Build flat default list with all services pre-selected
function buildDefaultHRServices() {
  return HR_SERVICE_GROUPS.flatMap(grp =>
    grp.services.map(name => ({ name, fee: 0, group: grp.group }))
  )
}

function HRFields({ d, set }) {
  // On first render, if hrServices is empty, seed all services
  const services = (d.hrServices && d.hrServices.length > 0)
    ? d.hrServices
    : buildDefaultHRServices()

  // Sync default into state if needed
  if (!d.hrServices || d.hrServices.length === 0) {
    // defer to avoid render loop
    setTimeout(() => set({ ...d, hrServices: buildDefaultHRServices() }), 0)
  }

  const isSelected = (name) => services.some(s => s.name === name && s.selected !== false)

  const toggleSvc = (name) => {
    set({
      ...d,
      hrServices: services.map(s =>
        s.name === name ? { ...s, selected: s.selected === false ? true : false } : s
      )
    })
  }

  const setFee = (name, fee) => {
    set({
      ...d,
      hrServices: services.map(s => s.name === name ? { ...s, fee: fee === '' ? '' : +fee } : s)
    })
  }

  // Group services for display
  const grouped = HR_SERVICE_GROUPS.map(grp => ({
    ...grp,
    items: services.filter(s => s.group === grp.group)
  }))

  const selectedServices = services.filter(s => s.selected !== false)

  return (
    <div className="space-y-4">

      {/* Pricing line — editable single description */}
      <div className="bg-white border-2 border-brand/20 rounded-2xl p-5" style={{background:'#f8faff'}}>
        <label className={lbl}>Pricing Description (shown in quote)</label>
        <input
          className={ic}
          value={d.hrPricingLabel || 'HR works as described for the company of size upto 10 employee per month'}
          onChange={e => set({ ...d, hrPricingLabel: e.target.value })}
          placeholder="HR works as described for the company of size upto 10 employee per month"
        />
        <div className="mt-3 flex items-center gap-3">
          <label className={lbl + ' mb-0 shrink-0'}>Total Amount (SAR)</label>
          <input
            type="number"
            className={ic}
            value={d.hrTotal || ''}
            onChange={e => set({ ...d, hrTotal: e.target.value })}
            placeholder="e.g. 25000"
            min={0}
          />
        </div>
        {d.hrTotalWords !== undefined ? (
          <div className="mt-3">
            <label className={lbl}>Amount in Words</label>
            <input className={ic} value={d.hrTotalWords || ''}
              onChange={e => set({ ...d, hrTotalWords: e.target.value })}
              placeholder="e.g. Twenty Five Thousand Saudi Riyals Only"/>
          </div>
        ) : (
          <button type="button" onClick={() => set({ ...d, hrTotalWords: '' })}
            className="mt-2 text-xs text-brand underline">+ Add amount in words</button>
        )}
      </div>

      {/* Service list — all selected by default, toggle & fee editable */}
      {grouped.map(grp => (
        <div key={grp.group} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100"
            style={{background:'#1A2B6B'}}>
            <span className="text-white font-bold text-xs uppercase tracking-wide">{grp.group}</span>
            <span className="text-white/50 text-[10px]">
              {grp.items.filter(s=>s.selected!==false).length}/{grp.items.length} selected
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {grp.items.map((svc) => {
              const active = svc.selected !== false
              return (
                <div key={svc.name}
                  className={`flex items-center gap-3 px-4 py-2.5 transition-all
                    ${active ? '' : 'opacity-40'}`}>
                  {/* Checkbox */}
                  <button type="button" onClick={() => toggleSvc(svc.name)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all
                      ${active ? 'border-brand bg-brand' : 'border-slate-300 bg-white'}`}>
                    {active && <svg width="9" height="9" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>}
                  </button>
                  {/* Service name */}
                  <span className={`text-xs flex-1 ${active ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                    {svc.name}
                  </span>
                  {/* Fee input — always visible */}
                  <input
                    type="number"
                    value={svc.fee === 0 ? '' : svc.fee}
                    onChange={e => setFee(svc.name, e.target.value)}
                    onClick={e => e.stopPropagation()}
                    placeholder="—"
                    min={0}
                    disabled={!active}
                    className="w-28 px-2 py-1 border border-slate-200 rounded-lg text-xs text-right focus:outline-none focus:border-brand transition-colors disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 w-7 shrink-0">SAR</span>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Summary count */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          <strong className="text-brand">{selectedServices.length}</strong> of {services.length} services selected
        </span>
        <span className="text-xs font-bold text-brand">
          Total: SAR {(+d.hrTotal||0).toLocaleString()}
        </span>
      </div>

      {/* Notes */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <label className={lbl}>Additional Notes / Scope</label>
        <textarea className={ic} rows={3} placeholder="Any additional notes or scope details..."
          value={d.hrScope||''} onChange={e=>set({...d,hrScope:e.target.value})}/>
      </div>
    </div>
  )
}

/* ── GENERIC ──────────────────────────────────────────────── */
function GenericFields({ d, set }) {
  const lines = d.lineItems || [{ id:1, desc:'', qty:1, price:0 }]
  const upd  = ls => set({...d, lineItems:ls})
  const edit = (id,k,v) => upd(lines.map(l=>l.id===id?{...l,[k]:v}:l))
  const add  = () => upd([...lines, { id:Date.now(), desc:'', qty:1, price:0 }])
  const del  = (id) => upd(lines.filter(l=>l.id!==id))
  const subtotal = lines.reduce((s,l)=>s+(+l.qty||0)*(+l.price||0),0)
  const vatAmt   = d.vatEnabled !== false ? subtotal * VAT_RATE : 0
  const grandTotal = subtotal + vatAmt

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <span className="font-bold text-sm">Custom Line Items</span>
        <button onClick={add} type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-slate-50">
          <Plus size={12}/> Add Line
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead><tr style={{background:'#1A2B6B'}}>
            <th className="p-3 text-white text-[10px] font-bold text-left">Description</th>
            <th className="p-3 text-white text-[10px] font-bold text-center w-20">Qty</th>
            <th className="p-3 text-white text-[10px] font-bold text-right w-32">Unit Price (SAR)</th>
            <th className="p-3 text-white text-[10px] font-bold text-right w-32">Line Total</th>
            <th className="p-3 w-10"/>
          </tr></thead>
          <tbody>
            {lines.map((l,i)=>(
              <tr key={l.id} className={i%2===0?'bg-white':'bg-slate-50/60'}>
                <td className="p-2"><input value={l.desc} onChange={e=>edit(l.id,'desc',e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-brand" placeholder="Service description"/></td>
                <td className="p-2"><input type="number" value={l.qty} onChange={e=>edit(l.id,'qty',e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:border-brand" min={1}/></td>
                <td className="p-2"><input type="number" value={l.price} onChange={e=>edit(l.id,'price',e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:border-brand" min={0}/></td>
                <td className="p-2 text-right text-xs font-bold text-brand">{fmt((+l.qty||0)*(+l.price||0))}</td>
                <td className="p-2 text-center"><button onClick={()=>del(l.id)} type="button"
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"><Trash2 size={12}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-slate-100 text-right space-y-1">
        <div className="text-xs text-slate-500">Subtotal: <span className="font-semibold">{fmt(subtotal)}</span></div>
        {d.vatEnabled !== false && (
          <div className="text-xs text-amber-700">VAT (15%): <span className="font-semibold">{fmt(vatAmt)}</span></div>
        )}
        <div className="text-sm font-bold text-brand">Grand Total: {fmt(grandTotal)}</div>
      </div>
    </div>
  )
}

/* ── Main Form ────────────────────────────────────────────── */
export default function QuoteForm({ initial, qNum, onSave, onCancel }) {
  const [d, setD] = useState(() => ({
    clientName:'', email:'', phone:'', date:today(), validUntil:'',
    type:'misa', paymentTerms:'50% Initial payment, 25% after MISA, 25% after CR', notes:'',
    vatEnabled: true,
    misaItems: JSON.parse(JSON.stringify(MISA_DEFAULT_ITEMS)),
    misaTotal: 25000, misaTotalWords:'Twenty Five Thousand Saudi Riyals Only',
    lineItems:[{ id:1, desc:'', qty:1, price:0 }],
    hrServices: [],
    hrTotal: '', hrPricingLabel: 'HR works as described for the company of size upto 10 employee per month',
    ...initial,
  }))
  const [busy, setBusy] = useState(false)

  const handleSave = async (andPreview=false) => {
    if (!d.clientName.trim()) { alert('Please enter a client name.'); return }
    setBusy(true)
    try { await onSave(d, andPreview) } finally { setBusy(false) }
  }

  const printNow = () => {
    printQuote(d, qNum)
  }

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_380px]">

      {/* ── LEFT: form ── */}
      <div className="space-y-4 min-w-0">

        {/* Client card */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <span className="font-bold text-sm">Client & Quote Details</span>
            <span className="font-mono text-xs font-bold text-brand">{qNum}</span>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className={lbl}>Client Name *</label>
              <input className={ic} placeholder="e.g. Al-Rashid Trading Co." value={d.clientName} onChange={e=>setD({...d,clientName:e.target.value})}/>
            </div>
            <div>
              <label className={lbl}>Quote Type *</label>
              <select className={ic} value={d.type} onChange={e=>setD({...d,type:e.target.value})}>
                <option value="misa">MISA / Company Setup</option>
                <option value="accounts">Accounts Work</option>
                <option value="hr">HR Works</option>
                <option value="generic">Generic / Custom</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Contact Email</label>
              <input type="email" className={ic} placeholder="client@company.com" value={d.email||''} onChange={e=>setD({...d,email:e.target.value})}/>
            </div>
            <div>
              <label className={lbl}>Contact Phone</label>
              <input className={ic} placeholder="+966 5X XXX XXXX" value={d.phone||''} onChange={e=>setD({...d,phone:e.target.value})}/>
            </div>
            <div>
              <label className={lbl}>Quote Date</label>
              <input type="date" className={ic} value={d.date||''} onChange={e=>setD({...d,date:e.target.value})}/>
            </div>
            <div>
              <label className={lbl}>Valid Until</label>
              <input type="date" className={ic} value={d.validUntil||''} onChange={e=>setD({...d,validUntil:e.target.value})}/>
            </div>
          </div>
        </div>

        {/* Dynamic template */}
        {d.type==='misa'     && <MisaFields     d={d} set={setD}/>}
        {d.type==='accounts' && <AccountsFields d={d} set={setD}/>}
        {d.type==='hr'       && <HRFields       d={d} set={setD}/>}
        {d.type==='generic'  && <GenericFields  d={d} set={setD}/>}

        {/* Notes */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="grid gap-4">
            <div>
              <label className={lbl}>Payment Terms</label>
              <input className={ic} value={d.paymentTerms||''} onChange={e=>setD({...d,paymentTerms:e.target.value})}/>
            </div>
            <div>
              <label className={lbl}>Notes / Remarks</label>
              <textarea className={ic} rows={3} placeholder="Special conditions, exclusions..." value={d.notes||''} onChange={e=>setD({...d,notes:e.target.value})}/>
            </div>
            {/* VAT Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed"
              style={{ borderColor: d.vatEnabled !== false ? '#F5C518' : '#e2e8f0', background: d.vatEnabled !== false ? '#fefce8' : '#f8fafc' }}>
              <div>
                <div className="text-sm font-bold" style={{ color: d.vatEnabled !== false ? '#92400e' : '#64748b' }}>
                  VAT 15% (ZATCA Compliant)
                </div>
                <div className="text-xs mt-0.5" style={{ color: d.vatEnabled !== false ? '#b45309' : '#94a3b8' }}>
                  {d.vatEnabled !== false
                    ? 'VAT is included — shown in quote summary'
                    : 'VAT disabled — quote is VAT exempt'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setD({ ...d, vatEnabled: d.vatEnabled === false ? true : false })}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-all"
                style={d.vatEnabled !== false
                  ? { background: '#F5C518', color: '#1a1a1a', borderColor: '#d97706' }
                  : { background: '#fff', color: '#64748b', borderColor: '#e2e8f0' }}>
                {d.vatEnabled !== false ? '✓ VAT ON' : '✗ VAT OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 pb-4">
          <button onClick={()=>handleSave(false)} disabled={busy}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-60"
            style={{background:'#1A2B6B'}}>
            <Save size={14}/> {busy ? 'Saving…' : initial?.id ? 'Update Quote' : 'Save Quote'}
          </button>
          <button onClick={()=>handleSave(true)} disabled={busy}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-60"
            style={{background:'#F5C518',color:'#1A2B6B'}}>
            Save & Preview
          </button>
          {onCancel && (
            <button onClick={onCancel} className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ── RIGHT: live preview ── */}
      <div className="lg:sticky lg:top-20 self-start order-first lg:order-last">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <span className="font-bold text-sm">Live Preview</span>
            <button onClick={printNow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors hover:opacity-90"
              style={{background:'#1A2B6B'}}>
              <Printer size={12}/> Print / PDF
            </button>
          </div>
          <div className="overflow-y-auto" style={{maxHeight:'72vh'}}>
            <Preview q={d} qNum={qNum}/>
          </div>
        </div>
      </div>

    </div>
  )
}
