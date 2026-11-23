import { Search, X } from 'lucide-react'
import s from './ui.module.css'

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className,
  onClear,
  ...rest
}) {
  return (
    <div className={`${s.search} ${className ?? ''}`.trim()}>
      <Search className={s.searchIcon} size={14} />
      <input
        type="search"
        className={s.searchInput}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        {...rest}
      />
      {value ? (
        <button
          type="button"
          className={s.searchClear}
          aria-label="Clear search"
          onClick={() => {
            onChange?.('')
            onClear?.()
          }}
        >
          <X size={12} />
        </button>
      ) : null}
    </div>
  )
}
