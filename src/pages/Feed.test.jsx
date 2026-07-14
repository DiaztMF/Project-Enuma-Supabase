import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import Feed from './Feed'

describe('Feed', () => {
  test('renders loading state initially', () => {
    render(<Feed />)
    expect(screen.getByText(/Memuat/i)).toBeInTheDocument()
  })
})
