import { useState, useEffect, useCallback } from 'react'
import { LayoutDashboard, FilePlus, Kanban, List, Briefcase, Archive as ArchiveIcon, Trash2, Users, CheckSquare, Menu, X, ChevronLeft } from 'lucide-react'
import { fetchQuotes, upsertQuote, softDeleteQuote, restoreQuote, permanentDeleteQuote, fetchUsers, fetchClients } from './supabase.js'
import { uid, qNumber, isOverdue, CHECKLISTS } from './lib.js'
import Dashboard      from './views/Dashboard.jsx'
import QuoteForm      from './views/QuoteForm.jsx'
import Pipeline       from './views/Pipeline.jsx'
import QuotesList     from './views/QuotesList.jsx'
import Jobs           from './views/Jobs.jsx'
import Archive        from './views/Archive.jsx'
import Trash          from './views/Trash.jsx'
import MyTasks        from './views/MyTasks.jsx'
import UserManagement from './views/UserManagement.jsx'
import QuoteDetail    from './views/QuoteDetail.jsx'
import Login          from './components/Login.jsx'
import ClientsView    from './views/ClientsView.jsx'
import ReportsView    from './views/ReportsView.jsx'

const ADMIN_NAV = [
  { key:'dashboard',   label:'Dashboard',   icon:LayoutDashboard, group:'main'    },
  { key:'new-quote',   label:'New Quote',   icon:FilePlus,        group:'main'    },
  { key:'pipeline',    label:'Pipeline',    icon:Kanban,          group:'main'    },
  { key:'quotes-list', label:'All Quotes',  icon:List,            group:'records' },
  { key:'jobs',        label:'Active Jobs', icon:Briefcase,       group:'records' },
  { key:'archive',     label:'Archive',     icon:ArchiveIcon,     group:'records' },
  { key:'trash',       label:'Trash',       icon:Trash2,          group:'records' },
  { key:'my-tasks',    label:'My Tasks',    icon:CheckSquare,     group:'admin'   },
  { key:'users',       label:'Users',       icon:Users,           group:'admin'   },
]
const STAFF_NAV = [
  { key:'my-tasks', label:'My Tasks', icon:CheckSquare, group:'main' },
]
const TITLES = {
  'dashboard':   ['Dashboard',       'Business pipeline overview'],
  'new-quote':   ['New Quotation',   'Create a professional quote'],
  'pipeline':    ['Pipeline Board',  'Drag deals across stages'],
  'quotes-list': ['All Quotes',      'Search and manage every quotation'],
  'jobs':        ['Active Jobs',     'Task checklists for in-progress work'],
  'archive':     ['Archive',         'Completed and closed deals'],
  'trash':       ['Trash',           'Deleted quotes — restore here'],
  'users':       ['User Management', 'Manage team members and access'],
  'my-tasks':    ['My Tasks',        'Jobs assigned to you'],
  'quote-detail':['Quote Detail',    'Full quote view'],
  'clients':     ['Clients',         'Client contact database'],
  'reports':     ['Reports',         'Revenue & pipeline analytics'],
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('tw_user')) } catch { return null }
  })
  const [quotes,      setQuotes]      = useState([])
  const [users,       setUsers]       = useState([])
  const [clients,     setClients]     = useState([])
  const [loading,     setLoading]     = useState(false)
  const [view,        setView]        = useState(() => {
    try { const u = JSON.parse(sessionStorage.getItem('tw_user')); return u ? (u.role==='admin'?'dashboard':'my-tasks') : null } catch { return null }
  })
  const [detailId,    setDetailId]    = useState(null)
  const [editing,     setEditing]     = useState(null)
  const [toast,       setToast]       = useState(null)
  const [err,         setErr]         = useState(null)
  const [sideOpen,    setSideOpen]    = useState(false)   // mobile sidebar toggle
  const [sideCollapsed, setSideCollapsed] = useState(false) // desktop collapse

  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    if (!currentUser) return
    setLoading(true)
    Promise.all([fetchQuotes(), fetchUsers(), fetchClients()])
      .then(([q, u, c]) => { setQuotes(q); setUsers(u); setClients(c); setLoading(false) })
      .catch(e => { setErr(e.message); setLoading(false) })
  }, [currentUser?.id])

  const handleLogin = (user) => {
    sessionStorage.setItem('tw_user', JSON.stringify(user))
    setCurrentUser(user)
    setView(user.role === 'admin' ? 'dashboard' : 'my-tasks')
  }

  const logout = () => {
    sessionStorage.removeItem('tw_user')
    setCurrentUser(null); setView(null); setQuotes([]); setUsers([])
  }

  const showToast = (msg, type='success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500)
  }

  const saveQuote = useCallback(async (formData, andPreview=false) => {
    const isEdit = !!editing
    const base   = isEdit ? editing : null
    const q = {
      ...(base||{}), ...formData,
      id:           base?.id           || uid(),
      quoteNumber:  base?.quoteNumber  || qNumber(quotes.length),
      stage:        base?.stage        || 'draft',
      checklist:    base?.checklist    || [],
      followUpDate: base?.followUpDate || '',
      createdAt:    base?.createdAt    || Date.now(),
    }
    try {
      const saved = await upsertQuote(q)
      setQuotes(prev => { const idx=prev.findIndex(x=>x.id===saved.id); return idx>-1?prev.map(x=>x.id===saved.id?saved:x):[saved,...prev] })
      showToast(isEdit ? 'Quote updated!' : 'Quote saved!')
      setEditing(null)
      if (andPreview) openDetail(saved.id)
      else setView(isEdit ? 'quotes-list' : 'dashboard')
    } catch(e) { showToast(e.message,'error') }
  }, [editing, quotes.length])

  const updateQuote = useCallback(async (q) => {
    try { const saved=await upsertQuote(q); setQuotes(prev=>prev.map(x=>x.id===saved.id?saved:x)) }
    catch(e) { showToast(e.message,'error') }
  }, [])

  const deleteQuote = useCallback(async (id) => {
    try {
      const saved=await softDeleteQuote(id)
      setQuotes(prev=>prev.map(x=>x.id===saved.id?saved:x))
      if (view==='quote-detail') setView('quotes-list')
      showToast('Moved to Trash.','info')
    } catch(e) { showToast(e.message,'error') }
  }, [view])

  const handleRestore = useCallback(async (id) => {
    try { const saved=await restoreQuote(id); setQuotes(prev=>prev.map(x=>x.id===saved.id?saved:x)); showToast('Quote restored!') }
    catch(e) { showToast(e.message,'error') }
  }, [])

  const handlePermanentDelete = useCallback(async (id) => {
    try { await permanentDeleteQuote(id); setQuotes(prev=>prev.filter(q=>q.id!==id)); showToast('Permanently deleted.','info') }
    catch(e) { showToast(e.message,'error') }
  }, [])

  const refreshUsers = async () => { const u=await fetchUsers(); setUsers(u) }
  const refreshClients = async () => { const c=await fetchClients(); setClients(c) }

  const goto = (v) => {
    setView(v)
    if (v!=='new-quote') setEditing(null)
    if (v!=='quote-detail') setDetailId(null)
    setSideOpen(false) // close mobile sidebar on nav
  }
  const openDetail = (id) => { setDetailId(id); setView('quote-detail'); setSideOpen(false) }
  const editQuote  = (q)  => { setEditing(q); goto('new-quote') }

  const activeQuotes  = quotes.filter(q=>!q.deletedAt)
  const overdueCount  = activeQuotes.filter(isOverdue).length
  const jobCount      = activeQuotes.filter(q=>q.stage==='inprogress').length
  const trashCount    = quotes.filter(q=>q.deletedAt).length
  const myTaskCount   = activeQuotes.filter(q=>q.stage==='inprogress'&&(q.assignedUsers||[]).some(u=>u.id===currentUser?.id)).length
  const detailQuote   = quotes.find(q=>q.id===detailId)||null
  const [title, sub]  = TITLES[view||'dashboard']||['TaxitWorld','']
  const NAV           = isAdmin ? ADMIN_NAV : STAFF_NAV

  if (!currentUser) return <Login onLogin={handleLogin}/>

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-4" style={{borderColor:'#1A2B6B',borderTopColor:'transparent'}}/>
        <p className="text-sm text-slate-500 font-medium">Loading TaxitWorld CRM…</p>
      </div>
    </div>
  )

  if (err) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center max-w-sm px-4">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="font-bold text-lg mb-2">Connection Error</h2>
        <p className="text-sm text-slate-500 mb-4">{err}</p>
        <button onClick={()=>window.location.reload()} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{background:'#1A2B6B'}}>Retry</button>
      </div>
    </div>
  )

  // ── Sidebar content (shared between mobile & desktop) ─────────
  const SidebarContent = () => (
    <>
      {/* Logo / brand */}
      <div className="flex items-center justify-between p-5 border-b" style={{borderColor:'rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.05)'}}>
        {!sideCollapsed && (
          <div>
            <div className="text-white font-extrabold text-lg tracking-tight leading-none">TaxitWorld</div>
            <div className="text-[11px] mt-0.5 font-semibold" style={{color:'#F5C518'}}>CRM & Quotation</div>
          </div>
        )}
        {/* Desktop collapse toggle */}
        <button
          onClick={() => setSideCollapsed(p=>!p)}
          className="hidden md:flex p-1.5 rounded-lg hover:bg-white/10 transition-colors ml-auto"
          style={{color:'rgba(255,255,255,0.5)'}}>
          <ChevronLeft size={16} style={{transform: sideCollapsed?'rotate(180deg)':'none', transition:'transform 0.2s'}}/>
        </button>
        {/* Mobile close */}
        <button onClick={()=>setSideOpen(false)} className="md:hidden p-1.5 rounded-lg hover:bg-white/10" style={{color:'rgba(255,255,255,0.5)'}}>
          <X size={16}/>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {['main','records','admin'].map(group => {
          const items = NAV.filter(n=>n.group===group)
          if (!items.length) return null
          return (
            <div key={group}>
              {!sideCollapsed && (
                <p className="px-3 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest" style={{color:'rgba(255,255,255,0.28)'}}>
                  {group}
                </p>
              )}
              {sideCollapsed && <div className="my-1 mx-3 border-t" style={{borderColor:'rgba(255,255,255,0.1)'}}/>}
              {items.map(n => {
                const Icon   = n.icon
                const active = view===n.key
                return (
                  <button key={n.key} onClick={()=>goto(n.key)} title={sideCollapsed?n.label:undefined}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all mb-0.5"
                    style={{ background:active?'#F5C518':'transparent', color:active?'#1A2B6B':'rgba(255,255,255,0.72)', justifyContent:sideCollapsed?'center':'flex-start' }}>
                    <Icon size={16} style={{flexShrink:0}}/>
                    {!sideCollapsed && <span className="flex-1 text-left truncate">{n.label}</span>}
                    {!sideCollapsed && n.key==='jobs'     && jobCount>0    && <span className="text-[10px] font-bold bg-amber-300 text-amber-900 px-1.5 py-0.5 rounded-full">{jobCount}</span>}
                    {!sideCollapsed && n.key==='trash'    && trashCount>0  && <span className="text-[10px] font-bold bg-red-400 text-white px-1.5 py-0.5 rounded-full">{trashCount}</span>}
                    {!sideCollapsed && n.key==='my-tasks' && myTaskCount>0 && <span className="text-[10px] font-bold bg-emerald-400 text-white px-1.5 py-0.5 rounded-full">{myTaskCount}</span>}
                    {sideCollapsed && n.key==='jobs'     && jobCount>0    && <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full"/>}
                  </button>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="p-3 border-t" style={{borderColor:'rgba(255,255,255,0.08)'}}>
        {!sideCollapsed ? (
          <>
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{background:'#F5C518',color:'#1A2B6B'}}>
                {currentUser.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-none">{currentUser.name}</p>
                <p className="text-[10px] capitalize mt-0.5" style={{color:'rgba(255,255,255,0.4)'}}>{currentUser.role}</p>
              </div>
            </div>
            <button onClick={logout} className="w-full text-[11px] font-semibold py-1.5 rounded-lg hover:bg-white/10 transition-all text-center" style={{color:'rgba(255,255,255,0.45)',background:'rgba(255,255,255,0.06)'}}>
              Sign out
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{background:'#F5C518',color:'#1A2B6B'}} title={currentUser.name}>
              {currentUser.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
            </div>
            <button onClick={logout} title="Sign out" className="p-1.5 rounded-lg hover:bg-white/10 transition-all" style={{color:'rgba(255,255,255,0.4)'}}>
              <X size={13}/>
            </button>
          </div>
        )}
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ── MOBILE OVERLAY ── */}
      {sideOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={()=>setSideOpen(false)}/>
      )}

      {/* ── SIDEBAR (mobile: fixed overlay, desktop: static) ── */}
      <aside
        className={`
          flex flex-col shrink-0 transition-all duration-300
          fixed md:static inset-y-0 left-0 z-50
          ${sideOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{
          width: sideCollapsed ? 64 : 248,
          background:'#1A2B6B',
          minHeight:'100vh',
          transition: 'width 0.25s ease, transform 0.25s ease'
        }}>
        <SidebarContent/>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col overflow-auto min-w-0">

        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile hamburger */}
            <button onClick={()=>setSideOpen(p=>!p)} className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0" style={{color:'#1A2B6B'}}>
              <Menu size={20}/>
            </button>

            {view==='quote-detail' && (
              <button onClick={()=>goto('quotes-list')} className="hidden md:flex items-center gap-1 p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 text-sm font-medium shrink-0">
                <ChevronLeft size={16}/> Back
              </button>
            )}
            <div className="min-w-0">
              <h1 className="font-extrabold text-base md:text-lg text-slate-800 truncate leading-tight">{title}</h1>
              <p className="text-[11px] text-slate-400 hidden md:block">{sub}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && overdueCount>0 && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                ⚠ {overdueCount}
              </span>
            )}
            {isAdmin && view!=='new-quote' && view!=='quote-detail' && (
              <button onClick={()=>goto('new-quote')}
                className="flex items-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold text-white shadow-sm hover:shadow-md transition-all"
                style={{background:'#1A2B6B'}}>
                <FilePlus size={14}/> <span className="hidden sm:inline">New Quote</span>
              </button>
            )}
          </div>
        </header>

        {/* Mobile back button for detail view */}
        {view==='quote-detail' && (
          <div className="md:hidden px-4 pt-3">
            <button onClick={()=>goto('quotes-list')} className="flex items-center gap-1 text-sm font-semibold text-brand">
              <ChevronLeft size={16}/> Back to All Quotes
            </button>
          </div>
        )}

        {/* Page content */}
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          {view==='dashboard'    && <Dashboard      quotes={activeQuotes} onOpen={openDetail} onNew={()=>goto('quotes-list')}/>}
          {view==='new-quote'    && <QuoteForm       initial={editing} qNum={editing?.quoteNumber||qNumber(activeQuotes.length)} onSave={saveQuote} onCancel={editing?()=>goto('quotes-list'):null} clients={clients} onClientAdded={refreshClients}/>}
          {view==='pipeline'     && <Pipeline        quotes={activeQuotes} onOpen={openDetail}/>}
          {view==='quotes-list'  && <QuotesList      quotes={activeQuotes} onOpen={openDetail} onDelete={deleteQuote} onNew={()=>goto('new-quote')}/>}
          {view==='jobs'         && <Jobs            quotes={activeQuotes} onUpdate={updateQuote} onFinish={id=>{ const q=activeQuotes.find(x=>x.id===id); if(q) updateQuote({...q,stage:'finished'}) }}/>}
          {view==='archive'      && <Archive         quotes={activeQuotes} onOpen={openDetail}/>}
          {view==='trash'        && <Trash           quotes={quotes} onRestore={handleRestore} onPermanentDelete={handlePermanentDelete}/>}
          {view==='users'        && <UserManagement  users={users} onRefresh={refreshUsers} currentUser={currentUser}/>}
          {view==='my-tasks'     && <MyTasks         quotes={activeQuotes} currentUser={currentUser} onUpdate={updateQuote} onFinish={id=>{ const q=activeQuotes.find(x=>x.id===id); if(q) updateQuote({...q,stage:'finished'}) }}/>}
          {view==='clients'     && <ClientsView onRefresh={refreshClients}/>}
          {view==='reports'     && <ReportsView quotes={quotes.filter(q=>!q.deletedAt)}/>}
          {view==='quote-detail' && detailQuote && (
            <QuoteDetail q={detailQuote} users={users} currentUser={currentUser}
              onUpdate={updateQuote} onEdit={editQuote} onDelete={deleteQuote} onBack={()=>goto('quotes-list')}/>
          )}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-50">
          <div className={`px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl text-white whitespace-nowrap
            ${toast.type==='success'?'bg-emerald-600':toast.type==='info'?'bg-slate-700':'bg-red-600'}`}>
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  )
}
