interface LoadingScreenProps {
  title?: string
  subtitle?: string
  variant?: 'page' | 'overlay'
}

function LoadingScreen({ title = 'Loading', subtitle, variant = 'page' }: LoadingScreenProps) {
  const wrapperClass =
    variant === 'overlay'
      ? 'absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/85 px-6 text-center'
      : 'flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center'

  return (
    <div className={wrapperClass}>
      <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-arcade-cyan sm:text-sm">
        {title}
        <span className="animate-pulse">_</span>
      </p>
      {subtitle && <p className="text-[11px] text-white/50 sm:text-xs">{subtitle}</p>}
      <div className="loading-bar" aria-hidden="true">
        <div className="loading-bar-fill" />
      </div>
    </div>
  )
}

export default LoadingScreen