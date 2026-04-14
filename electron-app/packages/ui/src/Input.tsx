import { clsx } from 'clsx'
import * as React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-') ?? undefined

    return (
      <div className="w-full">
        {label !== undefined && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full px-3 py-2 border rounded-lg transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            error !== undefined ? 'border-red-500' : 'border-gray-300',
            className,
          )}
          {...props}
        />
        {error !== undefined && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
