import { useState } from 'react'
import { Plus, Edit2, Trash2, X, Check, Users, Eye, EyeOff } from 'lucide-react'
import { createUser, updateUser, deleteUser } from '../supabase.js'

const ic  = 'w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all bg-white'
const lbl = 'block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5'

function UserForm({ initial, onSave, onCancel }) {
  const [d, setD] = useState({ name:'', username:'', password:'', role:'staff', ...initial })
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!d.name.trim() || !d.username.trim() || !d.password.trim()) return
    setBusy(true)
    await onSave(d)
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="font-bold text-sm">{initial?.id ? 'Edit User' : 'Add New User'}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Full Name</label>
          <input className={ic} placeholder="e.g. Ahmed Al-Rashid" value={d.name}
            onChange={e=>setD({...d,name:e.target.value})} required/>
        </div>
        <div>
          <label className={lbl}>Username</label>
          <input className={ic} placeholder="e.g. ahmed" value={d.username}
            onChange={e=>setD({...d,username:e.target.value})} required/>
        </div>
        <div className="relative">
          <label className={lbl}>Password</label>
          <div className="relative">
            <input className={ic} type={showPw ? 'text' : 'password'}
              placeholder="Set password" value={d.password}
              onChange={e=>setD({...d,password:e.target.value})} required/>
            <button type="button" onClick={()=>setShowPw(p=>!p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
            </button>
          </div>
        </div>
        <div>
          <label className={lbl}>Role</label>
          <select className={ic} value={d.role} onChange={e=>setD({...d,role:e.target.value})}>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={busy}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
          style={{background:'#1A2B6B'}}>
          <Check size={14}/> {busy ? 'Saving…' : initial?.id ? 'Update User' : 'Create User'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function UserManagement({ users, onRefresh, currentUser }) {
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [toast,    setToast]    = useState(null)

  const flash = (msg, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000) }

  const handleCreate = async (d) => {
    try {
      await createUser({ name:d.name, username:d.username, password:d.password, role:d.role })
      await onRefresh()
      setShowForm(false)
      flash('User created!')
    } catch(e) { flash(e.message, false) }
  }

  const handleUpdate = async (d) => {
    try {
      await updateUser(d.id, { name:d.name, username:d.username, password:d.password, role:d.role })
      await onRefresh()
      setEditing(null)
      flash('User updated!')
    } catch(e) { flash(e.message, false) }
  }

  const handleDelete = async (u) => {
    if (u.id === currentUser.id) { flash('Cannot delete your own account.', false); return }
    try {
      await deleteUser(u.id)
      await onRefresh()
      flash('User deleted.')
    } catch(e) { flash(e.message, false) }
  }

  return (
    <div className="space-y-4 anim-fade">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-brand"/>
          <span className="font-bold text-base">Team Members</span>
          <span className="text-slate-400 text-sm">({users.length})</span>
        </div>
        {!showForm && !editing && (
          <button onClick={()=>setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm hover:opacity-90"
            style={{background:'#1A2B6B'}}>
            <Plus size={14}/> Add User
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && <UserForm onSave={handleCreate} onCancel={()=>setShowForm(false)}/>}
      {editing  && <UserForm initial={editing} onSave={handleUpdate} onCancel={()=>setEditing(null)}/>}

      {/* Users table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              {['Name','Username','Role','Actions'].map(h=>(
                <th key={h} className="text-left p-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u=>(
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                <td className="p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{background:'#1A2B6B'}}>
                      {u.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
                    </div>
                    <span className="font-semibold text-sm">{u.name}</span>
                    {u.id === currentUser.id && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand/10 text-brand">You</span>
                    )}
                  </div>
                </td>
                <td className="p-3.5 font-mono text-xs text-slate-500">{u.username}</td>
                <td className="p-3.5">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                    ${u.role==='admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-3.5">
                  <div className="flex items-center gap-2">
                    <button onClick={()=>{ setEditing(u); setShowForm(false) }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                      <Edit2 size={11}/> Edit
                    </button>
                    {u.id !== currentUser.id && (
                      <button onClick={()=>handleDelete(u)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                        <Trash2 size={11}/> Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl text-white
          ${toast.ok ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
