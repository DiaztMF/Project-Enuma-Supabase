import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import Messages from './Messages'

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ 
        data: [
          { id: 'user-2', username: 'alex_t' }
        ], 
        error: null 
      })
    }))
  }
}))

describe('Messages Page', () => {
  test('renders messages inbox list', async () => {
    render(<Messages user={{ id: '123' }} />)
    expect(await screen.findByText(/Obrolan/i)).toBeInTheDocument()
  })
})
