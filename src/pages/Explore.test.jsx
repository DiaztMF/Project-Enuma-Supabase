import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import Explore from './Explore'

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({ 
          data: [
            {
              id: 'post-1',
              image_url: 'https://example.com/explore.jpg',
              caption: 'Jelajah Alam',
              likes: []
            }
          ], 
          error: null 
        })
      }))
    }))
  }
}))

describe('Explore Page', () => {
  test('renders explore heading', async () => {
    render(<Explore />)
    expect(await screen.findByText(/Jelajahi Komunitas/i)).toBeInTheDocument()
  })
})
