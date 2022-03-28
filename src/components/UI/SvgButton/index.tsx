import './index.css'

import React, { MouseEvent } from 'react'

interface Props {
  onClick: (e: MouseEvent) => void
  children: JSX.Element
  className?: string
  disabled?: boolean
  title?: string
  tabIndex?: number
}

export default function SvgButton({
  onClick,
  children,
  className = '',
  disabled = false,
  title = undefined,
  tabIndex = undefined
}: Props) {
  return (
    <button
      title={title}
      disabled={disabled}
      className={`svg-button ${className}`}
      onClick={onClick}
      tabIndex={tabIndex}
      aria-hidden="true"
      role="presentation"
    >
      {children}
    </button>
  )
}
