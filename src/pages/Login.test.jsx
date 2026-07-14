import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Login from './Login'

describe('Login', () => {
  test('renders login buttons', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    expect(screen.getByText(/Login with Google/i)).toBeInTheDocument()
  })
})
