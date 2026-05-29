import { useState } from 'react'
import { Plus, CheckCircle2 } from 'lucide-react'
import { fmt, calcTotal, progress } from '../lib.js'

export default function Jobs({ quotes, onUpdate, onFinish }) {
  const jobs = quotes.filter(q=>q.stage==='inprogress')
  const [newText, setNewText] = useState({})

  if (!jobs.length) return (
    <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm anim-fade">
      <div className="text-5xl mb-4">💼</div>
      <h3 className="font-bold text-lg mb-1">No Active Jobs</h3>
      <p className="text-sm text-slate-400">Close a deal as Won, then click "Start Job" to populate checklists here.</p>
    </div>
  )

  return (
    <div className="space-y-6 anim-fade">
      {jobs.map(q => {
        const pg = progress(q)
        const allDone = pg.total>0 && pg.done===pg.total

        const toggle = (i, v) => onUpdate({...q, checklist: q.checklist.map((t,j)=>j===i?{...t,done:v}:t)})
        const addTask = () => {
          const txt=(newText[q.id]||'').trim(); if(!txt) return
          onUpdate({...q, checklist:[...q.checklist,{text:txt,done:false}]})
          setNewText(p=>({...p,[q.id]:''}))
        }

        return (
          <div key={q.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-extrabold text-base">{q.clientName}</span>
                  <span className="font-mono text-xs text-slate-400">{q.quoteNumber}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wide">In Progress</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">{q.type} · {fmt(calcTotal(q))}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-bold text-brand">{pg.done}/{pg.total}</span>
                {allDone && (
                  <button onClick={()=>onFinish(q.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm">
                    <CheckCircle2 size={15}/> Finish Job
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Completion</span>
                  <span className="font-bold text-brand">{pg.pct}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{width:`${pg.pct}%`}}/></div>
              </div>

              {/* Tasks */}
              <div className="space-y-2 mb-4">
                {q.checklist.map((t,i)=>(
                  <div key={i}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
                      ${t.done?'bg-emerald-50/70 border-emerald-200':'bg-white border-slate-200'}`}>
                    <input type="checkbox" checked={t.done} onChange={e=>toggle(i,e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 cursor-pointer rounded"/>
                    <span className={`text-sm flex-1 ${t.done?'line-through text-slate-400':''}`}>{t.text}</span>
                  </div>
                ))}
              </div>

              {/* Add task */}
              <div className="flex gap-2">
                <input
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand transition-colors"
                  placeholder="Add a custom task…"
                  value={newText[q.id]||''}
                  onChange={e=>setNewText(p=>({...p,[q.id]:e.target.value}))}
                  onKeyDown={e=>e.key==='Enter'&&addTask()}
                />
                <button onClick={addTask}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition-colors">
                  <Plus size={14}/> Add
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
