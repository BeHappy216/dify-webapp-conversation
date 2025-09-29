'use client'
import classNames from 'classnames'
import type { FC } from 'react'
import React from 'react'
import dynamic from 'next/dynamic'
import 'react-tooltip/dist/react-tooltip.css'

const ReactTooltip = dynamic(() => import('react-tooltip').then(m => m.Tooltip), {
  ssr: false,
})

type TooltipProps = {
  selector: string
  content?: string
  htmlContent?: React.ReactNode
  className?: string // This should use !impornant to override the default styles eg: '!bg-white'
  position?: 'top' | 'right' | 'bottom' | 'left'
  clickable?: boolean
  children: React.ReactNode
}

const Tooltip: FC<TooltipProps> = ({
  selector,
  content,
  position = 'top',
  children,
  htmlContent,
  className,
  clickable,
}) => {
  return (
    <div className='tooltip-container' data-tooltip-id={selector}>
      {children}
      <ReactTooltip
        id={selector}
        content={content}
        className={classNames('!bg-white !text-xs !font-normal !text-gray-700 !shadow-lg !opacity-100', className)}
        place={position}
        clickable={clickable}
      >
        {htmlContent && htmlContent}
      </ReactTooltip>
    </div>
  )
}

export default Tooltip
