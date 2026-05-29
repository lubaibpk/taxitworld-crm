import { createRoot } from 'react-dom/client'
import Preview from './Preview.jsx'

let printRoot = null

function getPrintRoot() {
  let el = document.getElementById('print-area')
  if (!el) {
    el = document.createElement('div')
    el.id = 'print-area'
    document.body.appendChild(el)
  }
  return el
}

export function printQuote(q, qNum) {
  const el = getPrintRoot()

  if (!printRoot) {
    printRoot = createRoot(el)
  }

  return new Promise((resolve) => {
    printRoot.render(
      <div style={{
        width: '210mm',
        minHeight: '297mm',
        margin: '0',
        padding: '0',
        background: '#fff',
        fontFamily: "'Segoe UI', Arial, sans-serif",
        boxSizing: 'border-box',
      }}>
        <Preview q={q} qNum={qNum} forPrint={true}/>
      </div>
    )

    // Give React enough time to fully render + fonts to load
    setTimeout(() => {
      window.print()
      resolve()
    }, 800)
  })
}
