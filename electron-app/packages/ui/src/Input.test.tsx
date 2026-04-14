import { describe, it, expect } from 'vitest'
import { Input } from './Input'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

describe('Input', () => {
  it('should render an input element', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('should render with label', () => {
    render(<Input label="Username" />)
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
  })

  it('should generate id from label when not provided', () => {
    render(<Input label="Email Address" />)
    const input = screen.getByLabelText('Email Address')
    expect(input).toHaveAttribute('id', 'email-address')
  })

  it('should use provided id over label', () => {
    render(<Input label="Name" id="custom-id" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('id', 'custom-id')
  })

  it('should render error message when error prop is provided', () => {
    render(<Input error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('should apply error border class when error is present', () => {
    render(<Input error="Error" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-500')
  })

  it('should apply default border class when no error', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-gray-300')
  })

  it('should merge custom className', () => {
    render(<Input className="w-1/2" />)
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('w-1/2')
  })

  it('should pass through standard input props', () => {
    render(
      <Input
        type="email"
        placeholder="Enter email"
        defaultValue="test@example.com"
      />,
    )
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('placeholder', 'Enter email')
    expect(input).toHaveValue('test@example.com')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })
})
