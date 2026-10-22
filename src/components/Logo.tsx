import Link from 'next/link'

interface LogoProps {
  className?: string
  showTagline?: boolean
}

export default function Logo({ className = '', showTagline = false }: LogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 ${className}`} aria-label="LOMA — Página inicial">
      {/* SVG logo mark */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="flex-shrink-0"
      >
        <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.5" className="text-terracotta-600" />
        <path
          d="M10 20 C10 14, 16 10, 16 10 C16 10, 22 14, 22 20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          className="text-terracotta-600"
        />
        <path
          d="M13 20 L13 24 M19 20 L19 24 M10 24 L22 24"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="text-terracotta-600"
        />
        <circle cx="16" cy="13" r="1.5" fill="currentColor" className="text-terracotta-600" />
      </svg>
      <div className="flex flex-col">
        <span className="font-heading text-xl font-medium tracking-tight leading-none text-foreground">
          LOMA
        </span>
        {showTagline && (
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider leading-none mt-0.5">
            Cozinha e Padaria
          </span>
        )}
      </div>
    </Link>
  )
}
