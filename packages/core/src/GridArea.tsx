import React, { PropsWithChildren } from 'react'

interface Props {
  /**
   * Name of area the children should be in
   */
  area: string
  /**
   * Optional class names
   */
  className?: string
  /**
   * Optional style of grid area
   */
  style?: React.CSSProperties
}

/**
 * Helper component for using [grid-template-areas CSS property](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas)
 */
export function GridArea ({
  area,
  className,
  style,
  children
}: PropsWithChildren<Props>): JSX.Element {
  return (
    <div className={className} style={{ ...style, gridArea: area }}>
      {children}
    </div>
  )
}
