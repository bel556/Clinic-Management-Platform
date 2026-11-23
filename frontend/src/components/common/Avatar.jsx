import { initials } from '../../utils/format'
import { cx } from './cx'
import s from './ui.module.css'

const SIZES = {
  sm: s.avatarSm,
  md: s.avatarMd,
  lg: s.avatarLg,
  xl: s.avatarXl,
}

export function Avatar({ name, size = 'md', className, style }) {
  return (
    <span
      className={cx(s.avatar, SIZES[size], className)}
      style={style}
      aria-hidden="true"
      title={name}
    >
      {initials(name)}
    </span>
  )
}
