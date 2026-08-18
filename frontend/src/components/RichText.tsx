import React from "react"

type ColorToken = "cyan" | "amber" | "magenta"

const COLOR_CLASS: Record<ColorToken, string> = {
  cyan: "text-arcade-cyan",
  amber: "text-arcade-amber",
  magenta: "text-arcade-magenta",
}

const INLINE_PATTERN =
  /(\*\*[^*]+\*\*|\{\{(?:cyan|amber|magenta)\}\}[\s\S]*?\{\{\/(?:cyan|amber|magenta)\}\})/g

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(INLINE_PATTERN)

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      )
    }

    const colorMatch = part.match(
      /^\{\{(cyan|amber|magenta)\}\}([\s\S]*)\{\{\/(?:cyan|amber|magenta)\}\}$/
    )
    if (colorMatch) {
      const [, color, content] = colorMatch
      return (
        <span key={i} className={COLOR_CLASS[color as ColorToken]}>
          {content}
        </span>
      )
    }

    return <React.Fragment key={i}>{part}</React.Fragment>
  })
}

export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = text.split("\n\n")

  return (
    <div className={className ? `space-y-3 ${className}` : "space-y-3"}>
      {blocks.map((block, i) => {
        const trimmedBlock = block.trim()
        const lines = block.split("\n").filter((line) => line.trim().length > 0)

        const isHeading = /^\*\*[^*]+\*\*$/.test(trimmedBlock)
        if (isHeading) {
          return (
            <h3
              key={i}
              className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-arcade-amber first:mt-0 sm:text-[11px]"
            >
              {trimmedBlock.slice(2, -2)}
            </h3>
          )
        }

        const isBulletList =
          lines.length > 0 && lines.every((line) => line.trim().startsWith("- "))
        if (isBulletList) {
          return (
            <ul key={i} className="ml-4 list-disc space-y-1 text-xs leading-relaxed text-white/70 sm:text-sm">
              {lines.map((line, j) => (
                <li key={j} className="marker:text-arcade-cyan">
                  {renderInline(line.trim().slice(2))}
                </li>
              ))}
            </ul>
          )
        }

        return (
          <p key={i} className="text-xs leading-relaxed text-white/70 sm:text-sm">
            {renderInline(block)}
          </p>
        )
      })}
    </div>
  )
}