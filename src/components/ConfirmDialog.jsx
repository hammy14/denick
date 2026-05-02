import { useEffect, useRef } from 'react'

export default function ConfirmDialog({ open, title = 'Confirm', message, confirmLabel = 'Delete', cancelLabel = 'Cancel', danger = true, onConfirm, onCancel }) {
  const btnRef = useRef()
  useEffect(() => { if (open) btnRef.current?.focus() }, [open])

  if (!open) return null
  return (
    <div className="panel-overlay" onClick={e => e.target === e.currentTarget && onCancel?.()}>
      <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" style={{ maxWidth: 400 }}>
        <h3 id="confirm-title" style={{ marginBottom: 'var(--sp-3)' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 'var(--sp-4)' }}>{message}</p>
        <div style={{ display: 'flex', gap: 'var(--sp-2)', justifyContent: 'flex-end' }}>
          <button className="btn-cancel" ref={btnRef} onClick={onCancel}>{cancelLabel}</button>
          <button className={danger ? 'btn-danger' : 'btn-save'} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
