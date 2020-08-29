import React from 'react'
import './Snack.css'
import classnames from 'classnames'

export const Snack: React.FC<{
  message: string
  actions: [
    {
      callback: () => void
      className?: string
      text: string
    }
  ]
  className?: string
}> = ({ message, actions, className }) => {
  return (
    <div className={classnames('snack', className)}>
      <div>{message}</div>
      <div>
        {actions.map((action) => (
          <button
            key={action.text}
            className={classnames('snack-button', action.className)}
            onClick={action.callback}
          >
            {action.text}
          </button>
        ))}
      </div>
    </div>
  )
}
