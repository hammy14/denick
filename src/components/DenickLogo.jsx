/**
 * Denick Logo Component
 * Emblem (left) + Wordmark (right)
 * Blue (#3b82f6) + Silver (#94a3b8) palette
 */

export default function DenickLogo({ size = 36, showText = true, variant = 'horizontal' }) {
  const scale = size / 36

  const emblem = (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Silver outer trim */}
      <path
        d="M18 2L5 7.5v9c0 8.5 5.5 16 13 18 7.5-2 13-9.5 13-18v-9L18 2z"
        fill="url(#silver-grad)"
      />
      {/* Shield shape */}
      <path
        d="M18 4L7 9v8c0 7.5 4.8 14 11 16 6.2-2 11-8.5 11-16V9L18 4z"
        fill="url(#shield-grad)"
      />
      {/* Inner shield highlight */}
      <path
        d="M18 6L9 10.5v6.5c0 6.5 4 12 9 14 5-2 9-7.5 9-14v-6.5L18 6z"
        fill="url(#inner-grad)"
      />
      {/* Letter D */}
      <text
        x="18" y="23"
        textAnchor="middle"
        fontFamily="'Inter', 'SF Pro Display', -apple-system, sans-serif"
        fontWeight="800"
        fontSize="18"
        fill="white"
        letterSpacing="-0.5"
      >D</text>
      <defs>
        <linearGradient id="silver-grad" x1="18" y1="2" x2="18" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#cbd5e1" />
          <stop offset="0.5" stopColor="#e2e8f0" />
          <stop offset="1" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id="shield-grad" x1="18" y1="4" x2="18" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1e40af" />
        </linearGradient>
        <linearGradient id="inner-grad" x1="18" y1="6" x2="18" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#60a5fa" opacity="0.3" />
          <stop offset="1" stopColor="#1e3a8a" opacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  )

  if (!showText) return emblem

  const wordmark = (
    <span style={{
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
      fontWeight: 700,
      fontSize: size * 0.6,
      letterSpacing: '-0.02em',
      lineHeight: 1,
      display: 'flex',
      alignItems: 'center',
    }}>
      <span style={{ color: '#3b82f6' }}>Den</span>
      <span style={{ color: '#94a3b8' }}>ick</span>
    </span>
  )

  if (variant === 'stacked') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.15 }}>
        {emblem}
        {wordmark}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.25 }}>
      {emblem}
      {wordmark}
    </div>
  )
}

/**
 * Small icon-only version for favicons, app icons, etc.
 */
export function DenickIcon({ size = 24 }) {
  return <DenickLogo size={size} showText={false} />
}
