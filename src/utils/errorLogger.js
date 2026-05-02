// Global error logging for denick admin portal
// Catches unhandled errors and promise rejections

window.addEventListener('error', (event) => {
  console.error('[Denick Error]', {
    message: event.message,
    source: event.filename,
    line: event.lineno,
    col: event.colno,
    timestamp: new Date().toISOString(),
  })
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Denick Unhandled Promise]', {
    reason: event.reason?.message || event.reason,
    timestamp: new Date().toISOString(),
  })
})

export function logError(context, error) {
  console.error(`[Denick ${context}]`, error?.message || error, new Date().toISOString())
}
