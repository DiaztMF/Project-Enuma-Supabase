import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import Notifications from './Notifications'

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ 
          data: [
            { id: 'post-1', image_url: 'https://example.com/p1.jpg' }
          ], 
          error: null 
        }),
        // For likes mock
        in: vi.fn().mockResolvedValue({
          data: [
            {
              post_id: 'post-1',
              user_id: 'user-2',
              profiles: { username: 'alex_t' }
            }
          ],
          error: null
        })
      }))
    }))
  }
}))

describe('Notifications Page', () => {
  test('renders notifications activity lists', async () => {
    render(<Notifications user={{ id: '123' }} />)
    expect(await screen.findByText(/Notifikasi Aktivitas/i)).toBeInTheDocument()
  })
})
