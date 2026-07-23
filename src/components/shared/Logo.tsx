interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  textClass?: string
}

const SIZES = { sm: 28, md: 36, lg: 48 }

export function Logo({ size = 'md', showText = true, textClass = '' }: LogoProps) {
  const px = SIZES[size]

  return (
    <div className="flex items-center gap-2.5 select-none">
      <img
        src="/logo.svg"
        alt="Auralith AI"
        width={px}
        height={px}
        className="rounded-lg object-cover"
        style={{ width: px, height: px }}
      />

      {showText && (
        <div className="leading-none">
          <div className={`font-semibold tracking-tight ${textClass || 'text-white text-[15px]'}`}>
            Aura<span className="text-brand-400">lith</span> AI
          </div>
          {size !== 'sm' && (
            <div className="text-[10px] text-stone-500 mt-0.5 tracking-wide font-medium">AI</div>
          )}
        </div>
      )}
    </div>
  )
}
