import type { CSSProperties } from 'react'
import React from 'react'
import classNames from 'classnames'

enum ActionButtonState {
  Destructive = 'destructive',
  Active = 'active',
  Disabled = 'disabled',
  Default = '',
  Hover = 'hover',
}

const actionButtonVariants = (className?: string, size?: 'xs' | 's' | 'm' | 'l' | 'xl') => {
  const sizeClass = {
    xs: 'h-5 w-5 p-0.5',
    m: 'h-6 w-6 p-1',
    l: 'h-7 w-7 p-1.5',
    xl: 'h-8 w-8 p-2',
  }[size || 'm']

  return classNames(
    'inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-700 focus:outline-none',
    sizeClass,
    className
  )
}

export type ActionButtonProps = {
  size?: 'xs' | 's' | 'm' | 'l' | 'xl'
  state?: ActionButtonState
  styleCss?: CSSProperties
} & React.ButtonHTMLAttributes<HTMLButtonElement>

function getActionButtonState(state: ActionButtonState) {
  switch (state) {
    case ActionButtonState.Destructive:
      return 'text-red-600 bg-red-100 hover:bg-red-200'
    case ActionButtonState.Active:
      return 'text-primary-600 bg-primary-100 hover:bg-primary-200'
    case ActionButtonState.Disabled:
      return 'text-gray-300 bg-gray-100 cursor-not-allowed'
    case ActionButtonState.Hover:
      return 'bg-gray-100'
    default:
      return ''
  }
}

const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ className, size, state = ActionButtonState.Default, styleCss, children, ...props }, ref) => {
    return (
      <button
        type='button'
        className={classNames(
          actionButtonVariants(className, size),
          getActionButtonState(state),
        )}
        ref={ref}
        style={styleCss}
        {...props}
      >
        {children}
      </button>
    )
  },
)
ActionButton.displayName = 'ActionButton'

export default ActionButton
export { ActionButton, ActionButtonState }