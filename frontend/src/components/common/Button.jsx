import s from './ui.module.css'
import { cx } from './cx'

const VARIANTS = {
  primary: s.btnPrimary,
  secondary: s.btnSecondary,
  ghost: s.btnGhost,
  danger: s.btnDanger,
  dangerGhost: s.btnDangerGhost,
}

const SIZES = {
  sm: s.btnSm,
  md: '',
  lg: s.btnLg,
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  trailingIcon: TrailingIcon,
  block = false,
  className,
  type = 'button',
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={cx(s.btn, VARIANTS[variant], SIZES[size], block && s.btnBlock, className)}
      {...rest}
    >
      {Icon ? <Icon size={13} strokeWidth={2.2} /> : null}
      {children}
      {TrailingIcon ? <TrailingIcon size={13} strokeWidth={2.2} /> : null}
    </button>
  )
}

export function IconButton({
  icon: Icon,
  label,
  size = 15,
  tone = 'default',
  boxed = false,
  className,
  ...rest
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(s.iconBtn, tone === 'danger' && s.iconBtnDanger, boxed && s.iconBtnBoxed, className)}
      {...rest}
    >
      <Icon size={size} />
    </button>
  )
}
