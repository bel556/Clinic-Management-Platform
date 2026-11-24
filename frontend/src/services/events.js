/**
 * Cross-cutting error reporting. Services are plain modules, so they cannot
 * reach React context directly; they emit a DOM event that ToastProvider
 * listens for.
 */
export const ERROR_EVENT = 'cmp:error'

export function reportError(error) {
  if (typeof window === 'undefined') return
  const message =
    (typeof error === 'string' && error) ||
    error?.message ||
    'Something went wrong while contacting the clinic API.'
  window.dispatchEvent(new CustomEvent(ERROR_EVENT, { detail: { message } }))
}

export function onError(handler) {
  if (typeof window === 'undefined') return () => {}
  const listener = (event) => handler(event.detail?.message ?? 'Unexpected error')
  window.addEventListener(ERROR_EVENT, listener)
  return () => window.removeEventListener(ERROR_EVENT, listener)
}
