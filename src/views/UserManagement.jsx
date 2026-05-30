import { useState } from 'react'
import { Plus, Edit2, Trash2, X, Check, Users, Eye, EyeOff, Shield, Lock } from 'lucide-react'
import { createUser, updateUser, deleteUser } from '../supabase.js'

const ic  = 'w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all bg-white'
const lbl = 'block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5'

// ── User form (create or edit) ────────────────────────────────
function UserForm({ initial, onSave, onCancel }) {
  const isEdit = !!initial?.id
  const [d, setD]       = useState({
    name: '', username: '', password: '', role: 'staff', ...initial,
    password: '', // always blank on open for security
  })
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy]     = useState(false)
  const [err,  setErr]      = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!d.name.trim() || !d.username.trim()) return setErr('Name and username are required.')
    if (!isEdit && !d.password.trim()) return setErr('Password is required for new users.')
    setBusy(true); setErr('')
    try { await onSave(d) }
    catch(e) { setErr(e.message); setBusy(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.45)'}}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-extrabold text-base" style={{color:'#1A2B6B'}}>
            {isEdit ? 'Edit User' : 'Add New User'}
          </h3>
          <button onClick={onCancel} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
            <X size={16}/>
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Full Name <span className="text-red-400">*</span></label>
              <input className={ic} placeholder="e.g. Ahmed Al-Rashid" value={d.name}
                onChange={e=>setD({...d,name:e.target.value})} required/>
            </div>
            <div>
              <label className={lbl}>Username <span className="text-red-400">*</span></label>
              <input className={ic} placeholder="e.g. ahmed" value={d.username}
                onChange={e=>setD({...d,username:e.target.value})} required/>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className={lbl}>
              {isEdit ? 'New Password' : 'Password'} {!isEdit && <span className="text-red-400">*</span>}
            </label>
            {isEdit && (
              <p className="text-[11px] text-slate-400 mb-1.5 flex items-center gap-1">
                <Lock size={10}/> Leave blank to keep existing password
              </p>
            )}
            <div className="relative">
              <input className={ic} type={showPw ? 'text' : 'password'}
                placeholder={isEdit ? 'Enter new password to change…' : 'Set password'}
                value={d.password} onChange={e=>setD({...d,password:e.target.value})}/>
              <button type="button" onClick={()=>setShowPw(p=>!p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className={lbl}>Role</label>
            <select className={ic} value={d.role} onChange={e=>setD({...d,role:e.target.value})}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>

          {err && <p className="text-xs text-red-500 font-semibold">{err}</p>}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={busy}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
              style={{background:'#1A2B6B'}}>
              <Check size={14}/> {busy ? 'Saving…' : isEdit ? 'Update User' : 'Create User'}
            </button>
            <button type="button" onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Password reset modal ──────────────────────────────────────
function ResetPasswordModal({ user, onSave, onClose }) {
  const [pw,     setPw]     = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy,   setBusy]   = useState(false)
  const [err,    setErr]    = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!pw.trim() || pw.length < 4) return setErr('Password must be at least 4 characters.')
    setBusy(true); setErr('')
    try { await onSave(user, pw) }
    catch(e) { setErr(e.message); setBusy(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.45)'}}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-sm" style={{color:'#1A2B6B'}}>Reset Password</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">for <strong>{user.name}</strong> (@{user.username})</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X size={15}/></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="relative">
            <input className={ic} type={showPw ? 'text' : 'password'}
              placeholder="Enter new password…" value={pw}
              onChange={e=>setPw(e.target.value)} autoFocus/>
            <button type="button" onClick={()=>setShowPw(p=>!p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
            </button>
          </div>
          {err && <p className="text-xs text-red-500 font-semibold">{err}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={busy}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
              style={{background:'#1A2B6B'}}>
              {busy ? 'Saving…' : 'Set Password'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────
export default function UserManagement({ users, onRefresh, currentUser, isSuperAdmin }) {
  const [formUser,   setFormUser]   = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [resetUser,  setResetUser]  = useState(null)
  const [toast,     setToast]     = useState(null)

  const flash = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  // Superadmin only — block anyone else
  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{background:'#fff3cd'}}>
          <Shield size={28} style={{color:'#f59e0b'}}/>
        </div>
        <h2 className="font-extrabold text-lg text-slate-700 mb-2">Superadmin Only</h2>
        <p className="text-sm text-slate-400 max-w-xs">User management is restricted to the Super Admin account.</p>
      </div>
    )
  }

  const handleCreate = async (d) => {
    await createUser({ name: d.name, username: d.username, password: d.password, role: d.role })
    await onRefresh()
    setFormUser(null); setIsCreating(false)
    flash('User created!')
  }

  const handleUpdate = async (d) => {
    await updateUser(d.id, { name: d.name, username: d.username, password: d.password, role: d.role })
    await onRefresh()
    setFormUser(null); setIsCreating(false)
    flash('User updated!')
  }

  const handleResetPassword = async (user, newPassword) => {
    await updateUser(user.id, { name: user.name, username: user.username, password: newPassword, role: user.role })
    await onRefresh()
    setResetUser(null)
    flash(`Password reset for ${user.name}`)
  }

  const handleDelete = async (u) => {
    if (u.id === currentUser.id) { flash('Cannot delete your own account.', false); return }
    if (u.role === 'superadmin')  { flash('Cannot delete a superadmin account.', false); return }
    if (!confirm(`Delete user "${u.name}"? This cannot be undone.`)) return
    try {
      await deleteUser(u.id)
      await onRefresh()
      flash('User deleted.')
    } catch(e) { flash(e.message, false) }
  }

  const ROLE_BADGE = {
    superadmin: { cls: 'bg-amber-100 text-amber-800 border border-amber-200', label: '👑 Super Admin' },
    admin:      { cls: 'bg-blue-100 text-blue-700 border border-blue-100',    label: 'Admin'        },
    staff:      { cls: 'bg-slate-100 text-slate-600 border border-slate-200', label: 'Staff'        },
  }

  return (
    <div className="space-y-5 anim-fade">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl" style={{background:'#eff6ff'}}>
            <Users size={16} style={{color:'#1A2B6B'}}/>
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-800">Team Members</h2>
            <p className="text-[11px] text-slate-400">{users.length} users · Superadmin access</p>
          </div>
        </div>
        <button onClick={() => { setIsCreating(true); setFormUser({}) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm hover:shadow-md transition-all"
          style={{background:'#1A2B6B'}}>
          <Plus size={14}/> Add User
        </button>
      </div>

      {/* Users table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['User', 'Username', 'Role', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const badge = ROLE_BADGE[u.role] || ROLE_BADGE.staff
              return (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                        style={{background: u.role === 'superadmin' ? '#f59e0b' : '#1A2B6B'}}>
                        {u.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-800">{u.name}</p>
                        {u.id === currentUser.id && (
                          <span className="text-[10px] font-bold text-blue-500">You</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">{u.username}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setIsCreating(false); setFormUser(u) }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                        <Edit2 size={11}/> Edit
                      </button>
                      <button onClick={() => setResetUser(u)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                        <Lock size={11}/> Password
                      </button>
                      {u.id !== currentUser.id && u.role !== 'superadmin' && (
                        <button onClick={() => handleDelete(u)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                          <Trash2 size={11}/> Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {formUser !== null && (
        <UserForm
          initial={isCreating ? undefined : formUser}
          onSave={isCreating ? handleCreate : handleUpdate}
          onCancel={() => { setFormUser(null); setIsCreating(false) }}
        />
      )}

      {resetUser && (
        <ResetPasswordModal
          user={resetUser}
          onSave={handleResetPassword}
          onClose={() => setResetUser(null)}
        />
      )}

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
