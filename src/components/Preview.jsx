import { fmt, calcTotal, calcSubtotal, calcVAT, VAT_RATE } from '../lib.js'
import { LOGO_URI } from '../assets/logoBase64.js'

const BRAND  = '#1A2B6B'
const ACCENT = '#F5C518'

// ── Real logo from PNG ────────────────────────────────────────
function Logo({ height = 52 }) {
  return (
    <img
      src={LOGO_URI}
      alt="TaxitWorld"
      style={{ height, width: 'auto', objectFit: 'contain', display: 'block' }}
    />
  )
}

// ── Shared table styles ───────────────────────────────────────
const th = {
  background: BRAND, color: '#fff',
  padding: '8px 10px', fontSize: 11,
  textAlign: 'left', fontWeight: 700,
  borderBottom: `2px solid ${ACCENT}`,
}
const td = (i) => ({
  padding: '7px 10px', fontSize: 11,
  borderBottom: '1px solid #eef0f4',
  background: i % 2 === 0 ? '#fff' : '#f8fafc',
})

// ── VAT summary rows for tfoot ────────────────────────────────
function VATSummary({ q, subtotal, span = 2 }) {
  const vatAmt = calcVAT(q)
  const total  = subtotal + vatAmt
  const hasVAT = q?.vatEnabled !== false

  if (!hasVAT) {
    // No VAT — single total row
    return (
      <tr>
        <td colSpan={span} style={{
          background: BRAND, color: '#fff',
          padding: '10px 12px', fontWeight: 800, fontSize: 11, textAlign: 'center',
        }}>Total Fees (VAT Exempt)</td>
        <td style={{
          background: BRAND, color: ACCENT,
          padding: '10px 12px', fontWeight: 800, fontSize: 14, textAlign: 'center',
        }}>{fmt(subtotal)}</td>
      </tr>
    )
  }

  return (
    <>
      <tr>
        <td colSpan={span} style={{
          background: '#f1f5f9', color: '#374151',
          padding: '8px 12px', fontWeight: 600, fontSize: 11, textAlign: 'center',
          borderTop: `1px solid #e2e8f0`,
        }}>Subtotal</td>
        <td style={{
          background: '#f1f5f9', color: '#374151',
          padding: '8px 12px', fontWeight: 700, fontSize: 12, textAlign: 'center',
        }}>{fmt(subtotal)}</td>
      </tr>
      <tr>
        <td colSpan={span} style={{
          background: '#fef9ec', color: '#92400e',
          padding: '8px 12px', fontWeight: 600, fontSize: 11, textAlign: 'center',
        }}>VAT ({(VAT_RATE * 100).toFixed(0)}%) — ZATCA Compliant</td>
        <td style={{
          background: '#fef9ec', color: '#92400e',
          padding: '8px 12px', fontWeight: 700, fontSize: 12, textAlign: 'center',
        }}>{fmt(vatAmt)}</td>
      </tr>
      <tr>
        <td colSpan={span} style={{
          background: BRAND, color: '#fff',
          padding: '10px 12px', fontWeight: 800, fontSize: 11, textAlign: 'center',
        }}>Grand Total (incl. VAT)</td>
        <td style={{
          background: BRAND, color: ACCENT,
          padding: '10px 12px', fontWeight: 800, fontSize: 14, textAlign: 'center',
        }}>{fmt(total)}</td>
      </tr>
    </>
  )
}

// ── MISA tfoot (has words label) ─────────────────────────────
function MisaVATSummary({ q }) {
  const subtotal = calcSubtotal(q)
  const vatAmt   = calcVAT(q)
  const total    = subtotal + vatAmt
  const hasVAT   = q?.vatEnabled !== false

  if (!hasVAT) {
    return (
      <tr>
        <td colSpan={2} style={{
          background: BRAND, color: '#fff',
          padding: '10px 12px', fontWeight: 800, fontSize: 11, textAlign: 'center',
        }}>Total Fees — {q.misaTotalWords || '—'} (VAT Exempt)</td>
        <td style={{
          background: BRAND, color: ACCENT,
          padding: '10px 12px', fontWeight: 800, fontSize: 14, textAlign: 'center',
        }}>{fmt(subtotal)}</td>
      </tr>
    )
  }

  return (
    <>
      <tr>
        <td colSpan={2} style={{
          background: '#f1f5f9', color: '#374151',
          padding: '8px 12px', fontWeight: 600, fontSize: 11, textAlign: 'center',
          borderTop: '1px solid #e2e8f0',
        }}>Subtotal — {q.misaTotalWords || '—'}</td>
        <td style={{
          background: '#f1f5f9', color: '#374151',
          padding: '8px 12px', fontWeight: 700, fontSize: 12, textAlign: 'center',
        }}>{fmt(subtotal)}</td>
      </tr>
      <tr>
        <td colSpan={2} style={{
          background: '#fef9ec', color: '#92400e',
          padding: '8px 12px', fontWeight: 600, fontSize: 11, textAlign: 'center',
        }}>VAT ({(VAT_RATE * 100).toFixed(0)}%) — ZATCA Compliant</td>
        <td style={{
          background: '#fef9ec', color: '#92400e',
          padding: '8px 12px', fontWeight: 700, fontSize: 12, textAlign: 'center',
        }}>{fmt(vatAmt)}</td>
      </tr>
      <tr>
        <td colSpan={2} style={{
          background: BRAND, color: '#fff',
          padding: '10px 12px', fontWeight: 800, fontSize: 11, textAlign: 'center',
        }}>Grand Total (incl. VAT)</td>
        <td style={{
          background: BRAND, color: ACCENT,
          padding: '10px 12px', fontWeight: 800, fontSize: 14, textAlign: 'center',
        }}>{fmt(total)}</td>
      </tr>
    </>
  )
}

// ── Shared layout pieces ──────────────────────────────────────
function DocHeader({ q, qNum }) {
  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 28px 14px', borderBottom: `3px solid ${BRAND}`,
      }}>
        <Logo height={56} />
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.7 }}>
            <div style={{ fontWeight: 700, color: BRAND, fontSize: 11, marginBottom: 2 }}>TaxitWorld Business Consultancy</div>
            <div>www.taxitworld.com</div>
            <div>Al Khobar | Riyadh | Jeddah | Dammam</div>
            <div>Kingdom of Saudi Arabia</div>
          </div>
        </div>
      </div>

      <div style={{
        background: BRAND, color: '#fff',
        padding: '10px 28px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Commercial Proposal
        </div>
        <div style={{ fontSize: 10, textAlign: 'right', opacity: 0.85 }}>
          <div><b>{qNum}</b></div>
          {q.date && <div>Date: {q.date}</div>}
          {q.validUntil && <div>Valid Until: {q.validUntil}</div>}
        </div>
      </div>

      <div style={{
        background: '#f1f5f9', padding: '10px 28px',
        borderBottom: `1px solid #e2e8f0`,
        display: 'flex', justifyContent: 'space-between', fontSize: 10,
      }}>
        <div>
          <span style={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bill To: </span>
          <span style={{ fontWeight: 700, color: BRAND }}>{q.clientName}</span>
          {q.email && <span style={{ color: '#475569' }}> &nbsp;|&nbsp; {q.email}</span>}
          {q.phone && <span style={{ color: '#475569' }}> &nbsp;|&nbsp; {q.phone}</span>}
        </div>
        {q.vatEnabled !== false && (
          <div style={{ color: '#64748b', fontSize: 9 }}>
            VAT 15% Applied (ZATCA)
          </div>
        )}
      </div>
    </>
  )
}

function DocFooter({ q }) {
  return (
    <div style={{ padding: '16px 28px 20px', borderTop: `1px solid #e2e8f0`, marginTop: 16 }}>
      {q.paymentTerms && q.type !== 'hr' && (
        <div style={{ fontSize: 10, marginBottom: 6 }}>
          <b style={{ color: BRAND }}>Payment terms:</b>
          <span style={{ color: '#374151', marginLeft: 4 }}>{q.paymentTerms}</span>
        </div>
      )}
      {q.notes && (
        <div style={{ fontSize: 10, marginBottom: 10 }}>
          <b style={{ color: BRAND }}>Note:</b>
          <span style={{ color: '#374151', marginLeft: 4 }}>{q.notes}</span>
        </div>
      )}
      <div style={{
        borderTop: `2px solid ${BRAND}`, paddingTop: 10, marginTop: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Logo height={44} />
        <div style={{ fontSize: 9, color: '#94a3b8', textAlign: 'right' }}>
          <div>www.taxitworld.com</div>
          <div style={{ marginTop: 2 }}>This is a computer generated quotation</div>
        </div>
      </div>
    </div>
  )
}

// ── A4 wrapper ────────────────────────────────────────────────
function A4({ children }) {
  return (
    <div style={{
      width: '210mm', minHeight: '297mm',
      background: '#fff', fontFamily: "'Segoe UI', Arial, sans-serif",
      boxSizing: 'border-box', position: 'relative',
    }}>
      {children}
    </div>
  )
}

// ── Main exported Preview ─────────────────────────────────────
export default function Preview({ q, qNum, forPrint = false }) {
  if (!q?.clientName) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height: 220, color:'#94a3b8', fontSize: 13 }}>
      Fill in client details to see preview
    </div>
  )
  const content = <QuoteContent q={q} qNum={qNum}/>
  if (forPrint) return <A4>{content}</A4>
  return <div style={{ background:'#fff', fontFamily:"'Segoe UI',Arial,sans-serif" }}>{content}</div>
}

function QuoteContent({ q, qNum }) {
  const subtotal = calcSubtotal(q)

  /* ── MISA ── */
  if (q.type === 'misa') {
    const items = q.misaItems || []
    return (
      <>
        <DocHeader q={q} qNum={qNum}/>
        <div style={{ padding: '16px 28px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 4 }}>
            <thead>
              <tr>
                <th style={{ ...th, width: 36, textAlign: 'center' }}>No</th>
                <th style={th}>Service Includes</th>
                <th style={{ ...th, width: 80, textAlign: 'center' }}>By Taxit</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id}>
                  <td style={{ ...td(i), textAlign: 'center' }}>{i + 1}</td>
                  <td style={td(i)}>{item.service}</td>
                  <td style={{
                    ...td(i), textAlign: 'center', fontWeight: 700, fontSize: 13,
                    color: item.byTaxit ? '#059669' : '#dc2626',
                  }}>
                    {item.byTaxit ? '✓' : '✗'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot><MisaVATSummary q={q} /></tfoot>
          </table>
        </div>
        <DocFooter q={q}/>
      </>
    )
  }

  /* ── ACCOUNTS ── */
  if (q.type === 'accounts') {
    const packagePrice = +q.bookkeepingRate || 0
    const services     = q.accountsServices && q.accountsServices.length > 0
      ? q.accountsServices
      : null
    const packageName  = q.accountsPackageName || 'Accounting Services'
    const packageNote  = q.accountsPackageNote || ''
    return (
      <>
        <DocHeader q={q} qNum={qNum}/>
        <div style={{ padding: '16px 28px 0' }}>
          {/* Package header */}
          {q.accountsPackage && (
            <div style={{ marginBottom: 12, padding: '10px 14px', background: '#f0f7ff', borderRadius: 6, borderLeft: `3px solid ${BRAND}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: BRAND }}>{packageName}</div>
              {packageNote && <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{packageNote}</div>}
            </div>
          )}
          {/* Scope note */}
          {q.accountsScope && (
            <div style={{ fontSize: 10, color: '#475569', marginBottom: 12, padding: '8px 12px', background: '#f8fafc', borderRadius: 6, borderLeft: `3px solid ${BRAND}` }}>
              <b>Scope of Work:</b> {q.accountsScope}
            </div>
          )}
          {/* Services included */}
          {services && services.length > 0 && (
            <div style={{ marginBottom: 14, padding: '10px 14px', background: '#fafafa', borderRadius: 6, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#334155', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Services Included</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px' }}>
                {services.map((s, i) => (
                  <div key={i} style={{ fontSize: 10, color: '#475569', display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                    <span style={{ color: BRAND, fontWeight: 700, marginTop: 1 }}>•</span>
                    <span>{s.text || s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Price table */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={{ ...th, width: 36, textAlign: 'center' }}>No</th>
              <th style={th}>Description</th>
              <th style={{ ...th, width: 130, textAlign: 'right' }}>Amount (SAR)</th>
            </tr></thead>
            <tbody>
              <tr>
                <td style={{ ...td(0), textAlign: 'center' }}>1</td>
                <td style={td(0)}>{packageName} — Monthly Fee</td>
                <td style={{ ...td(0), textAlign: 'right', fontWeight: 600 }}>{fmt(packagePrice)}</td>
              </tr>
            </tbody>
            <tfoot><VATSummary q={q} subtotal={subtotal} span={2}/></tfoot>
          </table>
        </div>
        <DocFooter q={q}/>
      </>
    )
  }

  /* ── HR ── */
  if (q.type === 'hr') {
    const services     = (q.hrServices || []).filter(s => s.selected !== false)
    const pricingLabel = q.hrPricingLabel || 'HR works as described for the company of size upto 10 employee per month'
    const hrTotal      = +q.hrTotal || 0
    const vatAmt       = q.vatEnabled !== false ? hrTotal * 0.15 : 0
    const grandTotal   = hrTotal + vatAmt

    return (
      <>
        <DocHeader q={q} qNum={qNum}/>
        <div style={{ padding: '16px 28px 0' }}>
          {q.hrScope && (
            <div style={{ fontSize: 10, color: '#475569', marginBottom: 12, padding: '8px 12px', background: '#f8fafc', borderRadius: 6, borderLeft: `3px solid ${BRAND}` }}>
              <b>Scope of Work:</b> {q.hrScope}
            </div>
          )}

          {/* Services list — grouped with sub-headings */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
            <thead><tr>
              <th style={{ ...th, width: 36, textAlign: 'center' }}>No</th>
              <th style={th}>Service Description</th>
            </tr></thead>
            <tbody>
              {services.length === 0
                ? <tr><td colSpan={2} style={{ ...td(0), textAlign:'center', color:'#94a3b8' }}>No services selected.</td></tr>
                : (() => {
                    const rows = []
                    let counter = 0
                    const groups = ['General Government & Business Services','Qiwa Platform Services','Mudad Platform (Payroll & Compliance)','Muqeem Platform (Residency & Visas)','Municipal & Safety Services','HR Technology & Specialized Services','GOSI (Social Insurance) Services']
                    groups.forEach(grp => {
                      const grpServices = services.filter(s => s.group === grp)
                      if (!grpServices.length) return
                      rows.push(
                        <tr key={`grp-${grp}`}>
                          <td colSpan={2} style={{
                            background: '#1A2B6B', color: '#fff',
                            padding: '6px 10px', fontSize: 10,
                            fontWeight: 700, letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                          }}>{grp}</td>
                        </tr>
                      )
                      grpServices.forEach(s => {
                        counter++
                        const i = counter - 1
                        rows.push(
                          <tr key={s.name}>
                            <td style={{ ...td(i%2), textAlign: 'center' }}>{counter}</td>
                            <td style={td(i%2)}>{s.name}</td>
                          </tr>
                        )
                      })
                    })
                    return rows
                  })()
              }
            </tbody>
          </table>

          {/* Pricing — single line */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={th}>Description</th>
              <th style={{ ...th, width: 160, textAlign: 'right' }}>Amount (SAR)</th>
            </tr></thead>
            <tbody>
              <tr>
                <td style={td(0)}>{pricingLabel}</td>
                <td style={{ ...td(0), textAlign: 'right', fontWeight: 700 }}>{fmt(hrTotal)}</td>
              </tr>
            </tbody>
            <tfoot>
              {q.vatEnabled !== false ? (
                <>
                  <tr>
                    <td style={{ background:'#f1f5f9', color:'#374151', padding:'8px 12px', fontWeight:600, fontSize:11, textAlign:'center', borderTop:'1px solid #e2e8f0' }}>
                      Subtotal{q.hrTotalWords ? ` — ${q.hrTotalWords}` : ''}
                    </td>
                    <td style={{ background:'#f1f5f9', color:'#374151', padding:'8px 12px', fontWeight:700, fontSize:12, textAlign:'center' }}>{fmt(hrTotal)}</td>
                  </tr>
                  <tr>
                    <td style={{ background:'#fef9ec', color:'#92400e', padding:'8px 12px', fontWeight:600, fontSize:11, textAlign:'center' }}>VAT (15%) — ZATCA Compliant</td>
                    <td style={{ background:'#fef9ec', color:'#92400e', padding:'8px 12px', fontWeight:700, fontSize:12, textAlign:'center' }}>{fmt(vatAmt)}</td>
                  </tr>
                  <tr>
                    <td style={{ background:BRAND, color:'#fff', padding:'10px 12px', fontWeight:800, fontSize:11, textAlign:'center' }}>Grand Total (incl. VAT)</td>
                    <td style={{ background:BRAND, color:ACCENT, padding:'10px 12px', fontWeight:800, fontSize:14, textAlign:'center' }}>{fmt(grandTotal)}</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td style={{ background:BRAND, color:'#fff', padding:'10px 12px', fontWeight:800, fontSize:11, textAlign:'center' }}>
                    Total Fees{q.hrTotalWords ? ` — ${q.hrTotalWords}` : ''} (VAT Exempt)
                  </td>
                  <td style={{ background:BRAND, color:ACCENT, padding:'10px 12px', fontWeight:800, fontSize:14, textAlign:'center' }}>{fmt(hrTotal)}</td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
        <DocFooter q={q}/>
      </>
    )
  }

  /* ── GENERIC ── */
  const lines = q.lineItems || []
  return (
    <>
      <DocHeader q={q} qNum={qNum}/>
      <div style={{ padding: '16px 28px 0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={{ ...th, width: 36, textAlign: 'center' }}>No</th>
            <th style={th}>Description</th>
            <th style={{ ...th, width: 50, textAlign: 'center' }}>Qty</th>
            <th style={{ ...th, width: 110, textAlign: 'right' }}>Unit Price</th>
            <th style={{ ...th, width: 120, textAlign: 'right' }}>Total</th>
          </tr></thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={l.id}>
                <td style={{ ...td(i), textAlign: 'center' }}>{i + 1}</td>
                <td style={td(i)}>{l.desc}</td>
                <td style={{ ...td(i), textAlign: 'center' }}>{l.qty}</td>
                <td style={{ ...td(i), textAlign: 'right' }}>{fmt(l.price)}</td>
                <td style={{ ...td(i), textAlign: 'right', fontWeight: 600 }}>{fmt((+l.qty || 0) * (+l.price || 0))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><VATSummary q={q} subtotal={subtotal} span={4}/></tfoot>
        </table>
      </div>
      <DocFooter q={q}/>
    </>
  )
}
