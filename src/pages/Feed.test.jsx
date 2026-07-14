import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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
              caption: 'Foto Test 1',
              created_at: new Date().toISOString(),
              profiles: { username: 'testuser1' },
              likes: []
            },
            {
              id: 'post-2',
              image_url: 'https://example.com/img2.jpg',
              caption: 'Foto Test 2',
              created_at: new Date().toISOString(),
              profiles: { username: 'testuser2' },
              likes: []
            }
          ], 
          error: null 
        })
      }))
    }))
  }
}))

describe('Feed Page Stories and Suggestions', () => {
  test('renders stories bar and suggestions list', async () => {
    render(
      <MemoryRouter>
        <Feed user={{ id: '123', email: 'test@example.com' }} />
      </MemoryRouter>
    )
    expect(await screen.findByText(/Saran Untuk Anda/i)).toBeInTheDocument()
    const storyAvatars = await screen.findAllByText(/testuser1/i)
    expect(storyAvatars[0]).toBeInTheDocument()
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

describe('Dynamic Story Viewer', () => {
  test('renders dynamic story and displays viewer on avatar click', async () => {
    render(
      <MemoryRouter>
        <Feed user={{ id: '123', email: 'test@example.com' }} />
      </MemoryRouter>
    )
    
    // Find the avatar text
    const storyAvatars = await screen.findAllByText(/testuser1/i)
    expect(storyAvatars[0]).toBeInTheDocument()
    
    // Click it to open viewer
    fireEvent.click(storyAvatars[0])

    // Assert story viewer opens and renders image
    expect(await screen.findByText(/Menatap Story/i)).toBeInTheDocument()
  })
})
