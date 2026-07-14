import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Login from './Login'

describe('Login Page Redesign', () => {
  test('renders login buttons and premium content', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    
    // Check main title
    expect(screen.getByText(/Welcome to Community/i)).toBeInTheDocument()
    
    // Check Google Login button
    expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument()

    // Check Explore as guest link
    expect(screen.getByText(/Explore as guest/i)).toBeInTheDocument()
  })
})
