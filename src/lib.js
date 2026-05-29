// ─── Constants ────────────────────────────────────────────────
export const STAGES = {
  draft:      { label: 'Draft',            cls: 'bg-slate-100 text-slate-600'    },
  sent:       { label: 'Quote Sent',       cls: 'bg-blue-100 text-blue-700'      },
  won:        { label: 'Closed Won',       cls: 'bg-emerald-100 text-emerald-700'},
  lost:       { label: 'Closed Lost',      cls: 'bg-red-100 text-red-700'        },
  inprogress: { label: 'In Progress',      cls: 'bg-amber-100 text-amber-800'    },
  finished:   { label: 'Finished',         cls: 'bg-violet-100 text-violet-700'  },
  paid:       { label: 'Payment Collected',cls: 'bg-green-100 text-green-800'    },
}

export const MISA_DEFAULT_ITEMS = [
  { id:1,  service:'Oman company all documentation work - client scope',               byTaxit:false },
  { id:2,  service:'Name reservation in KSA',                                           byTaxit:true  },
  { id:3,  service:'Drafting and issuing Article of Association (AoA)',                byTaxit:true  },
  { id:4,  service:'Issuance of Commercial Registration (CR) 1 Year',                 byTaxit:true  },
  { id:5,  service:'Registration of Chamber of Commerce (CoC)',                        byTaxit:true  },
  { id:6,  service:'Registration with Ministry of Labour',                             byTaxit:true  },
  { id:7,  service:'Registration with General Organization for Social Insurance (GOSI)',byTaxit:true  },
  { id:8,  service:'Registration of National Address',                                 byTaxit:true  },
  { id:9,  service:'Registration of ZATCA and VAT',                                   byTaxit:true  },
  { id:10, service:'Activate Chamber of Commerce (CoC) Account',                      byTaxit:true  },
  { id:11, service:'Registration with Absher, Muqeem, Qiwa and Mudad portal',         byTaxit:true  },
  { id:12, service:'Assisting for Bank account opening',                               byTaxit:true  },
  { id:13, service:'GM visa ( for two persons )',                                     byTaxit:true  },
  { id:14, service:'Local saudi employee salary - 1 month',                           byTaxit:true  },
]

export const HR_SERVICE_GROUPS = [
  {
    group: 'General Government & Business Services',
    services: [
      'Ministry of Investment: Renewal of the Investment License',
      'Saudi Business Center: Commercial Registration Extract / Commercial Certificate',
      'Saudi Business Center: Annual Confirmation of Main Commercial Registration Data',
      "Saudi Business Center: Amendment of Company's Main Commercial Registration Data",
      "Saudi Business Center: Updating Beneficiary's Data for Commercial Registration",
      'Chamber of Commerce: Submit a request to attest a document',
      'Chamber of Commerce: Authorization Services',
      'Chamber of Commerce: Updating Establishment Data Request',
    ]
  },
  {
    group: 'Qiwa Platform Services',
    services: [
      'Contract Management: Documentation and management of employee contracts',
      'Visas: Issuance of instant visas',
      'Work Licenses: Renewal of work licenses',
      "Work Stoppage: Reporting work stoppage (Inqita'a)",
      'Employee Exclusion: Removing employees with employment contracts',
      'Profession Correction: Correcting worker professions',
      'Locations: Assigning employee locations',
      'Subscription: Renewing Qiwa subscription',
      'Entity Locations: Management of establishment locations',
      'Regulations: Creating Standard Working Organization Regulations',
      'Transfer Services: Transferring worker services',
      'Appointments: Booking appointments with the Ministry of Human Resources',
      'Work Permits: Issuance of work permits',
      'Saudization: Issuance of Saudization (Nitaqat) certificates',
      "Profession Change: Changing a worker's profession",
    ]
  },
  {
    group: 'Mudad Platform (Payroll & Compliance)',
    services: [
      'Payroll Management: Uploading the payroll sheet',
      "IBAN Management: Adding the establishment's IBAN",
      'Employee IBAN: Adding employee bank details',
      'Wage Protection: Uploading payroll sheets for the Wage Protection Program',
      'Payslips: Printing employee payslips',
      'Commitment Certificate: Printing compliance/commitment certificates',
      'Data Updates: Updating employee data',
      'Violations: Justifying wage protection violations',
    ]
  },
  {
    group: 'Muqeem Platform (Residency & Visas)',
    services: [
      'Iqama Issuance: Issuing new residency permits',
      'Iqama Renewal: Renewing residency permits',
      'Passport Info: Updating passport information',
      'Exit Re-entry: Issuing exit and re-entry visas',
      'Subscription: Renewing Muqeem platform subscription',
      'Printing: Residency printing services',
      'Reports: Generating Muqeem reports',
      'Final Exit: Issuing final exit visas',
      'User Management: Managing platform users',
      'Name Translation: Changing translated names',
      'Transfer Services: Managing Muqeem transfer services',
    ]
  },
  {
    group: 'Municipal & Safety Services',
    services: [
      'Balady Platform: Renewal of commercial licenses',
      'Balady Platform: Quick Response (QR) Code printing service',
      'Civil Defense (Salamah): Renewal of Civil Defense licenses',
      'SPL (Saudi Post): Printing National Address',
      'SPL (Saudi Post): Amending establishment National Address',
    ]
  },
  {
    group: 'HR Technology & Specialized Services',
    services: [
      'Comprehensive Reporting: Preparing full HR reports',
      'Monthly Reporting: Preparing monthly status reports',
      'Database: Creating a comprehensive establishment database',
      'Nitaqat: Monitoring Nitaqat levels and recruitment credit',
      'Payroll Factors: Reviewing monthly payroll factors',
      'Communication: Contacting employees when necessary',
      'Settlements: End-of-service settlement calculations',
      'Platform Service: Free service for an additional platform',
      'Foreign Affairs: Issuing business visit visas',
      'Foreign Affairs: Family visit requests',
    ]
  },
  {
    group: 'GOSI (Social Insurance) Services',
    services: [
      'Fines Initiative: Initiative to exempt fines for delays/violations',
      'Debt Management: Installment of establishment debt',
      'Member Data: Modifying employee data',
      'Invoices: Inquiry about invoices and violations',
      'Account Management: Adding or editing account managers',
      'Facility Data: Completing establishment data',
      'Owner Management: Managing establishment owners',
      'Employee Removal: Removing employees from GOSI',
      'Admin Management: Adding establishment administrators',
      'Certificates: Issuing commitment/establishment certificates',
      'Admin Change: Changing the account administrator',
      'Data Completion: Filling in employee data details',
    ]
  },
]

export const CHECKLISTS = {
  misa:     ['Collect all client documentation & scope confirmation','Submit MISA license application','Process Commercial Registration (CR)','Register: GOSI, ZATCA, Qiwa, Mudad portals','Final handover – deliver all documents to client'],
  accounts: ['Collect financial documents & bank statements','Setup bookkeeping ledger / chart of accounts','Process transactions & bank reconciliation','Prepare financial report & deliver to client'],
  hr:       ['Confirm JD and headcount plan','Source and screen qualified candidates','Coordinate interviews and selection process','Complete onboarding documentation & contracts'],
  generic:  ['Project kickoff meeting with client','Deliver initial work product','Client review & feedback round','Final delivery and sign-off'],
}

// ─── Helpers ─────────────────────────────────────────────────
export const uid = () => 'q_' + Date.now() + '_' + Math.random().toString(36).slice(2,7)

export function qNumber(count) {
  const d = new Date()
  const ymd = d.getFullYear() + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0')
  return `TW-${ymd}-${String(count+1).padStart(3,'0')}`
}

export const fmt = (n) =>
  'SAR ' + Number(n||0).toLocaleString('en-SA', { minimumFractionDigits:0, maximumFractionDigits:2 })

export function calcSubtotal(q) {
  if (!q) return 0
  if (q.type==='misa')     return +q.misaTotal||0
  if (q.type==='accounts') return (+q.bookkeepingRate||0)+(+q.taxFee||0)+(+q.auditHours||0)*(+q.auditRate||0)
  if (q.type==='hr')       return +q.hrTotal||0
  if (q.type==='generic')  return (q.lineItems||[]).reduce((s,l)=>s+(+l.qty||0)*(+l.price||0),0)
  return 0
}

export const VAT_RATE = 0.15

export function calcVAT(q) {
  if (q?.vatEnabled === false) return 0
  return calcSubtotal(q) * VAT_RATE
}

export function calcTotal(q) {
  return calcSubtotal(q) + calcVAT(q)
}

export const isOverdue = (q) =>
  q.stage==='sent' && !!q.followUpDate && new Date(q.followUpDate) < new Date(new Date().toDateString())

export function progress(q) {
  const list = q.checklist||[]
  if (!list.length) return { done:0, total:0, pct:0 }
  const done = list.filter(t=>t.done).length
  return { done, total:list.length, pct:Math.round(done/list.length*100) }
}

export const today = () => new Date().toISOString().split('T')[0]
