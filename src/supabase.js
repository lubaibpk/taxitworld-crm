import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ── Quote row mappers ─────────────────────────────────────────
const fromDb = r => ({
  id: r.id, quoteNumber: r.quote_number, clientName: r.client_name, clientId: r.client_id ?? null,
  email: r.email, phone: r.phone, date: r.date, validUntil: r.valid_until,
  paymentTerms: r.payment_terms, notes: r.notes, type: r.type, stage: r.stage,
  followUpDate: r.follow_up_date,
  misaItems: r.misa_items, misaTotal: r.misa_total, misaTotalWords: r.misa_total_words,
  bookkeepingRate: r.bookkeeping_rate, taxFee: r.tax_fee,
  auditHours: r.audit_hours, auditRate: r.audit_rate, accountsScope: r.accounts_scope,
  recruitmentFee: r.recruitment_fee, handbookFee: r.handbook_fee,
  hrRetainer: r.hr_retainer, placements: r.placements, hrScope: r.hr_scope,
  hrServices: r.hr_services ?? [],
  hrTotal: r.hr_total ?? 0,
  hrPricingLabel: r.hr_pricing_label ?? 'HR works as described below',
  hrTotalWords: r.hr_total_words ?? undefined,
  lineItems: r.line_items ?? [],
  checklist: r.checklist ?? [],
  comments: r.comments ?? [],
  vatEnabled: r.vat_enabled ?? true,
  deletedAt: r.deleted_at ?? null,
  assignedUsers: r.assigned_users ?? [],
  stageLog: r.stage_log ?? [],
  createdAt: new Date(r.created_at).getTime(),
  updatedAt: new Date(r.updated_at).getTime(),
})

const toDb = q => ({
  id: q.id, quote_number: q.quoteNumber, client_name: q.clientName, client_id: q.clientId ?? null,
  email: q.email??null, phone: q.phone??null, date: q.date??null,
  valid_until: q.validUntil??null, payment_terms: q.paymentTerms??null,
  notes: q.notes??null, type: q.type, stage: q.stage,
  follow_up_date: q.followUpDate??null,
  misa_items: q.misaItems??null, misa_total: q.misaTotal??null,
  misa_total_words: q.misaTotalWords??null,
  bookkeeping_rate: q.bookkeepingRate??null, tax_fee: q.taxFee??null,
  audit_hours: q.auditHours??null, audit_rate: q.auditRate??null,
  accounts_scope: q.accountsScope??null,
  recruitment_fee: q.recruitmentFee??null, handbook_fee: q.handbookFee??null,
  hr_retainer: q.hrRetainer??null, placements: q.placements??1,
  hr_scope: q.hrScope??null,
  hr_services: q.hrServices??[],
  hr_total: q.hrTotal??0,
  hr_pricing_label: q.hrPricingLabel??'HR works as described below',
  hr_total_words: q.hrTotalWords??null,
  line_items: q.lineItems??[], checklist: q.checklist??[],
  comments: q.comments??[],
  vat_enabled: q.vatEnabled ?? true,
  deleted_at: q.deletedAt ?? null,
  assigned_users: q.assignedUsers ?? [],
  stage_log: q.stageLog ?? [],
})

export async function fetchQuotes() {
  const { data, error } = await supabase
    .from('crm_quotes').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data.map(fromDb)
}

export async function upsertQuote(q) {
  const { data, error } = await supabase
    .from('crm_quotes').upsert(toDb(q), { onConflict: 'id' }).select().single()
  if (error) throw error
  return fromDb(data)
}

export async function softDeleteQuote(id) {
  const { data, error } = await supabase
    .from('crm_quotes').update({ deleted_at: new Date().toISOString() }).eq('id', id).select().single()
  if (error) throw error
  return fromDb(data)
}

export async function restoreQuote(id) {
  const { data, error } = await supabase
    .from('crm_quotes').update({ deleted_at: null }).eq('id', id).select().single()
  if (error) throw error
  return fromDb(data)
}

export async function permanentDeleteQuote(id) {
  const { error } = await supabase.from('crm_quotes').delete().eq('id', id)
  if (error) throw error
}

// ── User management ───────────────────────────────────────────
export async function fetchUsers() {
  const { data, error } = await supabase
    .from('crm_users').select('*').order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createUser(u) {
  const { data, error } = await supabase
    .from('crm_users').insert(u).select().single()
  if (error) throw error
  return data
}

export async function updateUser(id, u) {
  const { data, error } = await supabase
    .from('crm_users').update(u).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteUser(id) {
  const { error } = await supabase.from('crm_users').delete().eq('id', id)
  if (error) throw error
}

export async function loginUser(username, password) {
  const { data, error } = await supabase
    .from('crm_users').select('*').eq('username', username).eq('password', password).single()
  if (error) return null
  return data
}


// ── Client helpers ────────────────────────────────────────────
export async function fetchClients() {
  const { data, error } = await supabase
    .from('crm_clients').select('*').is('deleted_at', null).order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function upsertClient(c) {
  const payload = { ...c, updated_at: new Date().toISOString() }
  if (!payload.id) delete payload.id
  const { data, error } = await supabase
    .from('crm_clients').upsert(payload, { onConflict: 'id' }).select().single()
  if (error) throw error
  return data
}

export async function archiveClient(id) {
  const { error } = await supabase
    .from('crm_clients').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

// ── Lead helpers ──────────────────────────────────────────────
export async function fetchLeads() {
  const { data, error } = await supabase
    .from('crm_leads')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function upsertLead(l) {
  const payload = { ...l, updated_at: new Date().toISOString() }
  if (!payload.id) delete payload.id
  const { data, error } = await supabase
    .from('crm_leads').upsert(payload, { onConflict: 'id' }).select().single()
  if (error) throw error
  return data
}

export async function fetchLeadById(id) {
  const { data, error } = await supabase
    .from('crm_leads').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function deleteLead(id) {
  const { error } = await supabase
    .from('crm_leads').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export async function convertLead(leadId, quoteId) {
  const { data, error } = await supabase
    .from('crm_leads')
    .update({ status: 'converted', converted_quote_id: quoteId, updated_at: new Date().toISOString() })
    .eq('id', leadId).select().single()
  if (error) throw error
  return data
}
