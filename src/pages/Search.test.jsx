import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Search from './Search'

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        ilike: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ 
            data: [
              {
                id: 'post-1',
                image_url: 'https://example.com/img.jpg',
                caption: 'Foto pemandangan alam indah',
                profiles: { username: 'alam_lover' },
                likes: []
              }
            ], 
            error: null 
          })
        }))
      }))
    }))
  }
}))

describe('Search Page', () => {
  test('renders search input and forms', () => {
    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    )
    expect(screen.getByPlaceholderText(/Cari postingan/i)).toBeInTheDocument()
  })
})
