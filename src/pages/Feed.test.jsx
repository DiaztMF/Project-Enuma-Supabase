import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Feed from './Feed'

// Mock supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      }))
    }))
  }
}))

describe('Feed Page', () => {
  test('renders upload drawer when route matches query parameter', () => {
    render(
      <MemoryRouter initialEntries={['/?create=true']}>
        <Feed user={{ id: '123' }} />
      </MemoryRouter>
    )
    expect(screen.getByText(/Unggah Foto Baru/i)).toBeInTheDocument()
  })
})
