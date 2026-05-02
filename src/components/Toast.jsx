import { useState, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext(null);

function ToastItem({ id, message, type, duration, action, onDismiss }) {
  return (
    <div
      className={`toast toast-${type}`}
      style={{ '--toast-duration': `${duration}ms` }}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div className="toast-top">
        <span>{message}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {action && (
            <button
              onClick={() => { action.onClick(); onDismiss(id) }}
              aria-label={action.label}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: 5,
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '0.15rem 0.55rem',
                letterSpacing: '0.02em',
              }}
            >
              {action.label}
            </button>
          )}
          <button
            className="toast-dismiss"
            onClick={() => onDismiss(id)}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="toast-progress" aria-hidden="true" />
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback(id => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  // showToast(message, type?, duration?, action?)
  // action = { label: string, onClick: fn }
  const addToast = useCallback((message, type = 'info', duration = 3500, action = null) => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type, duration, action }]);
    setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div
        className="toast-container"
        aria-label="Notifications"
      >
        {toasts.map(t => (
          <ToastItem key={t.id} {...t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
