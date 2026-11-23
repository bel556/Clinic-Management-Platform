import { cx } from './cx'
import s from './ui.module.css'

export function Card({
  title,
  icon: Icon,
  action,
  children,
  footer,
  padded = true,
  className,
  bodyClassName,
  id,
}) {
  return (
    <section className={cx(s.card, className)} id={id}>
      {title || action ? (
        <header className={s.cardHead}>
          {Icon ? (
            <span className={s.cardHeadIcon}>
              <Icon size={14} strokeWidth={2.1} />
            </span>
          ) : null}
          {title ? <h3 className={s.cardTitle}>{title}</h3> : null}
          {action ? <div className={s.cardAction}>{action}</div> : null}
        </header>
      ) : null}
      <div className={cx(padded ? s.cardBody : s.cardBodyTight, bodyClassName)}>{children}</div>
      {footer ? <footer className={s.cardFooter}>{footer}</footer> : null}
    </section>
  )
}
