import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Feed from './Feed'

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

describe('Upload Modal Form', () => {
  test('renders drag and drop file field and caption textarea', () => {
    render(
      <MemoryRouter initialEntries={['/?create=true']}>
        <Feed user={{ id: '123', email: 'test@example.com' }} />
      </MemoryRouter>
    )
    expect(screen.getByText(/Tarik foto di sini/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Tulis cerita di balik foto ini/i)).toBeInTheDocument()
  })
})
