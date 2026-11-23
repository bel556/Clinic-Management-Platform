import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cx } from './cx'
import s from './ui.module.css'

export function DataTable({
  columns,
  rows,
  rowKey = (row) => row.id,
  onRowClick,
  selectedKey,
  empty,
  foot,
  className,
  bare = false,
}) {
  if (!rows?.length && empty) {
    return <div className={bare ? undefined : s.card}>{empty}</div>
  }

  return (
    <div className={cx(!bare && s.card, className)}>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} style={column.width ? { width: column.width } : undefined}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const key = rowKey(row)
              const clickable = Boolean(onRowClick)
              return (
                <tr
                  key={key}
                  className={cx(
                    clickable && s.rowHover,
                    selectedKey === key && s.rowSelected,
                  )}
                  onClick={clickable ? () => onRowClick(row) : undefined}
                >
                  {columns.map((column) => (
                    <td key={column.key} style={column.align ? { textAlign: column.align } : undefined}>
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {foot ? <div className={s.tableFoot}>{foot}</div> : null}
    </div>
  )
}

export function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1)

  return (
    <div className={s.pagination}>
      <button
        type="button"
        className={s.pageBtn}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={13} />
      </button>
      {pages.map((number) => (
        <button
          key={number}
          type="button"
          className={cx(s.pageBtn, number === page && s.pageBtnActive)}
          onClick={() => onChange(number)}
        >
          {number}
        </button>
      ))}
      <button
        type="button"
        className={s.pageBtn}
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
      >
        <ChevronRight size={13} />
      </button>
    </div>
  )
}
