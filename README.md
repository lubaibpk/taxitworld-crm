# TaxitWorld CRM & Quotation System

## Infrastructure (Already Provisioned ✅)

| Service | Status | Details |
|---------|--------|---------|
| **Supabase DB** | ✅ LIVE | `taxitworld-crm` project, Singapore region |
| **Supabase URL** | ✅ LIVE | `https://iwcemrkrsptvwkpcmwqh.supabase.co` |
| **Database Table** | ✅ LIVE | `crm_quotes` with full schema, RLS, indexes |
| **Vercel Project** | ⏳ 1 step | Run `./deploy.sh` once |

## One-Command Deploy

```bash
cd taxitworld-crm
npm install
./deploy.sh
```

That's it. Your app will be live at:
`https://taxitworld-crm.vercel.app`

## Environment Variables (Pre-configured)
```
VITE_SUPABASE_URL=https://iwcemrkrsptvwkpcmwqh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Features
- MISA / Company Setup quotes (matching your Commercial Proposal format)
- Accounts Work & HR Works templates
- Generic line-item builder
- Live PDF preview + print
- CRM pipeline (Draft → Sent → Won → In Progress → Finished)
- Overdue follow-up alerts
- Job checklists with progress bars
- 100% cloud storage in Supabase
