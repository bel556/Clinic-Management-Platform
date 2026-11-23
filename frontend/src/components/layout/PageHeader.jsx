import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import s from './layout.module.css'

export function Breadcrumb({ items = [] }) {
  if (!items.length) return null
  return (
    <nav className={s.breadcrumb} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 ? <span>/</span> : null}
            {item.to && !isLast ? (
              <Link to={item.to}>{item.label}</Link>
            ) : (
              <span className={isLast ? s.crumbCurrent : undefined}>{item.label}</span>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  backTo,
  backLabel = 'Back',
  actions,
  eyebrow,
}) {
  return (
    <div>
      {backTo ? (
        <Link to={backTo} className={s.backLink}>
          <ArrowLeft size={12} />
          {backLabel}
        </Link>
      ) : null}
      <Breadcrumb items={breadcrumb} />
      <div className={s.pageHead}>
        <div className={s.pageHeadMain}>
          {eyebrow ? <p className="u-upper" style={{ marginBottom: 4 }}>{eyebrow}</p> : null}
          <h1 className={s.pageTitle}>{title}</h1>
          {description ? <p className={s.pageDesc}>{description}</p> : null}
        </div>
        {actions ? <div className={s.pageActions}>{actions}</div> : null}
      </div>
    </div>
  )
}
