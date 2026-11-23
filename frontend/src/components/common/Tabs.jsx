import { cx } from './cx'
import s from './ui.module.css'

export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div className={cx(s.tabs, className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          className={cx(s.tab, value === tab.id && s.tabActive)}
          onClick={() => onChange?.(tab.id)}
        >
          {tab.label}
          {tab.count !== undefined ? <span className={s.tabCount}>{tab.count}</span> : null}
        </button>
      ))}
    </div>
  )
}

export function UnderlineTabs({ tabs, value, onChange }) {
  return (
    <div className={s.underlineTabs} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          className={cx(s.underlineTab, value === tab.id && s.underlineTabActive)}
          onClick={() => onChange?.(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
