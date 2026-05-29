import { STAGES } from '../lib.js'
export default function Badge({ stage, overdue }) {
  const s = STAGES[stage] || STAGES.draft
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${s.cls}`}>
        {s.label}
      </span>
      {overdue && (
        <span className="anim-pulse inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
          ⚠ Due!
        </span>
      )}
    </span>
  )
}
