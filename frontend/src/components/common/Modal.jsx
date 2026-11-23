import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'
import { cx } from './cx'
import s from './ui.module.css'

export function Modal({
  open,
  onClose,
  eyebrow,
  title,
  description,
  icon: Icon,
  tone = 'default',
  wide = false,
  children,
  footer,
  closeOnBackdrop = true,
}) {
  useEffect(() => {
    if (!open) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className={s.backdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose?.()
      }}
    >
      <div
        className={cx(s.modal, wide && s.modalWide)}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {Icon ? (
          <span className={cx(s.modalIcon, tone === 'danger' && s.modalIconDanger)}>
            <Icon size={16} strokeWidth={2.1} />
          </span>
        ) : null}
        {eyebrow ? (
          <p className={cx(s.modalEyebrow, tone === 'danger' && s.modalEyebrowDanger)}>{eyebrow}</p>
        ) : null}
        <h2 className={s.modalTitle}>{title}</h2>
        {description ? <p className={s.modalText}>{description}</p> : null}
        {children ? <div className={s.modalBody}>{children}</div> : null}
        {footer ? <div className={s.modalFooter}>{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  eyebrow,
  title,
  description,
  icon,
  tone = 'default',
  summary,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant,
  busy = false,
  confirmDisabled = false,
  children,
}) {
  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onClose}
      eyebrow={eyebrow}
      title={title}
      description={description}
      icon={icon}
      tone={tone}
      closeOnBackdrop={!busy}
    >
      {summary ? <div className={s.modalSummary}>{summary}</div> : null}
      {children}
      <div className={s.modalFooter}>
        <Button variant="secondary" size="sm" onClick={onClose} disabled={busy}>
          {cancelLabel}
        </Button>
        <Button
          variant={confirmVariant ?? (tone === 'danger' ? 'danger' : 'primary')}
          size="sm"
          onClick={onConfirm}
          disabled={busy || confirmDisabled}
        >
          {busy ? 'Working…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
