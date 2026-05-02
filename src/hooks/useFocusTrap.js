import { useEffect, useRef } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'details > summary',
].join(', ')

/**
 * Traps keyboard focus inside a container element while active.
 * Returns a ref to attach to the container.
 *
 * Usage:
 *   const trapRef = useFocusTrap(isOpen)
 *   <div ref={trapRef} role="dialog" aria-modal="true">...</div>
 */
export default function useFocusTrap(active) {
  const ref = useRef(null)

  useEffect(() => {
    if (!active || !ref.current) return

    const el = ref.current
    const focusable = () => Array.from(el.querySelectorAll(FOCUSABLE)).filter(
      n => !n.closest('[hidden]') && getComputedStyle(n).display !== 'none'
    )

    // Focus the first focusable element (or the container itself)
    const first = focusable()[0]
    if (first) first.focus()
    else el.focus()

    function handleKeyDown(e) {
      if (e.key !== 'Tab') return
      const items = focusable()
      if (!items.length) { e.preventDefault(); return }
      const firstItem = items[0]
      const lastItem  = items[items.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === firstItem) { e.preventDefault(); lastItem.focus() }
      } else {
        if (document.activeElement === lastItem) { e.preventDefault(); firstItem.focus() }
      }
    }

    el.addEventListener('keydown', handleKeyDown)
    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [active])

  return ref
}
