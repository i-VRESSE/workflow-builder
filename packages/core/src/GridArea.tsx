import React, { PropsWithChildren } from 'react'

export function GridArea ({
  area,
  className,
  children
}: PropsWithChildren<{ area: string, className?: string }>): JSX.Element {
  return (
    <div className={className} style={{ gridArea: area }}>
      {children}
    </div>
  )
}
