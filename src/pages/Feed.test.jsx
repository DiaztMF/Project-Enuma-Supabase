import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Feed from './Feed'

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({ 
          data: [
            {
              id: 'post-1',
              image_url: 'https://example.com/img.jpg',
              caption: 'Foto Test',
              created_at: new Date().toISOString(),
              profiles: { username: 'testuser' },
              likes: []
            }
          ], 
          error: null 
        })
      }))
    }))
  }
}))

describe('Feed Page', () => {
  test('renders stories bar and suggestions list', async () => {
    render(
      <MemoryRouter>
        <Feed user={{ id: '123', email: 'test@example.com' }} />
      </MemoryRouter>
    )
    expect(await screen.findByText(/Saran Untuk Anda/i)).toBeInTheDocument()
    expect(screen.getByText(/natasyacptr/i)).toBeInTheDocument()
  })
})
