import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Profile from './Profile'

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ 
            data: { id: '123', username: 'testuser' }, 
            error: null 
          }),
          // For posts select mock
          eq: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'post-1',
                image_url: 'https://example.com/image.jpg',
                caption: 'Caption Test',
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

describe('Profile Page', () => {
  test('renders user profile details and grids', async () => {
    render(
      <MemoryRouter initialEntries={['/profile/testuser']}>
        <Routes>
          <Route path="/profile/:username" element={<Profile user={{ id: '123' }} />} />
        </Routes>
      </MemoryRouter>
    )
    expect(await screen.findByText(/suka diterima/i)).toBeInTheDocument()
  })
})
