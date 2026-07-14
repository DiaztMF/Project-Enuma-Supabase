import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, test, expect, vi } from 'vitest'
import App from './App'

vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn((cb) => {
        cb('SIGNED_IN', { user: { id: '123', email: 'test@example.com' } })
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      }),
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } } }),
      signOut: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      }))
    }))
  }
}))

describe('App Sidebar Navigation', () => {
  test('renders sidebar navigation items', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(await screen.findByText(/Beranda/i)).toBeInTheDocument()
    expect(screen.getByText(/Pesan/i)).toBeInTheDocument()
    expect(screen.getByText(/Buat/i)).toBeInTheDocument()
  })
})
