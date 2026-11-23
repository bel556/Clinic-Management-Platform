import { useCallback, useEffect, useState } from 'react'

/**
 * Small data-loading helper for the promise-based services layer.
 * `loader` may be async; it re-runs whenever `deps` change or reload() is called.
 */
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    Promise.resolve()
      .then(() => {
        if (alive) setState((previous) => ({ ...previous, loading: true, error: null }))
        return loader()
      })
      .then((data) => {
        if (alive) setState({ data, loading: false, error: null })
      })
      .catch((error) => {
        if (alive) setState({ data: null, loading: false, error })
      })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  const reload = useCallback(() => setTick((value) => value + 1), [])

  return { ...state, reload }
}

export function useDebouncedValue(value, delay = 220) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

export function useDirty(initial) {
  const [dirty, setDirty] = useState(false)
  const mark = useCallback(() => setDirty(true), [])
  const reset = useCallback(() => setDirty(false), [])
  return { dirty: dirty || Boolean(initial), mark, reset }
}

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · CuraPulse` : 'CuraPulse'
  }, [title])
}
