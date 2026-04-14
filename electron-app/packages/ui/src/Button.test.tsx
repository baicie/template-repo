import { describe, it, expect } from 'vitest'
import { Button } from './Button'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

describe('Button', () => {
  it('should render with default props', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('should apply primary variant by default', () => {
    render(<Button>Primary</Button>)
    const btn = screen.getByRole('button', { name: 'Primary' })
    expect(btn).toHaveClass('bg-blue-600')
  })

  it('should apply secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const btn = screen.getByRole('button', { name: 'Secondary' })
    expect(btn).toHaveClass('bg-gray-200')
  })

  it('should apply danger variant', () => {
    render(<Button variant="danger">Danger</Button>)
    const btn = screen.getByRole('button', { name: 'Danger' })
    expect(btn).toHaveClass('bg-red-600')
  })

  it('should apply ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const btn = screen.getByRole('button', { name: 'Ghost' })
    expect(btn).toHaveClass('bg-transparent')
  })

  it('should apply sm size', () => {
    render(<Button size="sm">Small</Button>)
    const btn = screen.getByRole('button', { name: 'Small' })
    expect(btn).toHaveClass('px-3', 'py-1.5', 'text-sm')
  })

  it('should apply md size by default', () => {
    render(<Button>Medium</Button>)
    const btn = screen.getByRole('button', { name: 'Medium' })
    expect(btn).toHaveClass('px-4', 'py-2', 'text-base')
  })

  it('should apply lg size', () => {
    render(<Button size="lg">Large</Button>)
    const btn = screen.getByRole('button', { name: 'Large' })
    expect(btn).toHaveClass('px-6', 'py-3', 'text-lg')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled()
  })

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole('button', { name: 'Click me' }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should not call onClick when disabled', () => {
    const handleClick = vi.fn()
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Disabled' }))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should merge custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const btn = screen.getByRole('button', { name: 'Custom' })
    expect(btn.className).toContain('custom-class')
  })
})
