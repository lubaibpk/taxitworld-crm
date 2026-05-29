import { fmt, calcTotal } from '../lib.js'
import { Trash2, RotateCcw } from 'lucide-react'

export default function Trash({ quotes, onRestore }) {
  const deleted = quotes.filter(q => q.deletedAt)

  return (
    <div className="space-y-4 anim-fade">
      <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3 flex items-center gap-3">
        <Trash2 size={16} className="text-red-400 shrink-0"/>
        <p className="text-sm text-red-700">
          Deleted quotes are stored here. You can <strong>restore</strong> any quote back to its original state.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-sm">
            Trash &nbsp;
            <span className="text-slate-400 font-normal">({deleted.length})</span>
          </span>
          {deleted.length > 0 && (
            <span className="text-xs text-slate-400">
              {deleted.length} deleted quote{deleted.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {['Quote #', 'Client', 'Type', 'Value', 'Deleted On', 'Action'].map(h => (
                  <th key={h} className="text-left p-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deleted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Trash2 size={32} className="text-slate-200"/>
                      <p className="text-sm text-slate-400">Trash is empty</p>
                    </div>
                  </td>
                </tr>
              ) : (
                deleted.map(q => (
                  <tr key={q.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-mono text-xs font-semibold text-slate-400 line-through">
                      {q.quoteNumber}
                    </td>
                    <td className="p-3.5 font-semibold text-sm text-slate-500">{q.clientName}</td>
                    <td className="p-3.5 text-xs capitalize text-slate-400">{q.type}</td>
                    <td className="p-3.5 text-sm font-bold text-slate-400">{fmt(calcTotal(q))}</td>
                    <td className="p-3.5 text-xs text-slate-400">
                      {q.deletedAt ? new Date(q.deletedAt).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      }) : '—'}
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => onRestore(q.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors">
                        <RotateCcw size={11}/> Restore
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
