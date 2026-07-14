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
              likes: [],
              comments: [
                { id: 'c-1', text: 'Komentar Mock 1', profiles: { username: 'testuser2' } }
              ]
            },
            {
              id: 'post-2',
              image_url: 'https://example.com/img2.jpg',
              caption: 'Foto Test 2',
              created_at: new Date().toISOString(),
              profiles: { username: 'testuser2' },
              likes: [],
              comments: []
            }
          ], 
          error: null 
        })
      })),
      insert: vi.fn().mockResolvedValue({ error: null })
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
    
    const storyAvatars = await screen.findAllByText(/testuser1/i)
    expect(storyAvatars[0]).toBeInTheDocument()
    fireEvent.click(storyAvatars[0])

    expect(await screen.findByText(/Menatap Story/i)).toBeInTheDocument()
  })
})

describe('Interactive Post Card Features', () => {
  test('allows adding a local comment', async () => {
    render(
      <MemoryRouter>
        <Feed user={{ id: '123', email: 'test@example.com' }} />
      </MemoryRouter>
    )
    
    // Check initial mock comment
    expect(await screen.findByText(/Komentar Mock 1/i)).toBeInTheDocument()

    // Type in comment input
    const commentInputs = await screen.findAllByPlaceholderText(/Tambahkan komentar.../i)
    fireEvent.change(commentInputs[0], { target: { value: 'Komentar test baru' } })
    
    // Click submit
    const submitButtons = screen.getAllByRole('button', { name: /Kirim/i })
    fireEvent.click(submitButtons[0])
    
    // Wait for the input to be cleared (since insert is async)
    await waitFor(() => {
      expect(commentInputs[0].value).toBe('')
    })
  })

  test('double clicking image displays heart pop up', async () => {
    render(
      <MemoryRouter>
        <Feed user={{ id: '123', email: 'test@example.com' }} />
      </MemoryRouter>
    )
    
    const postImages = await screen.findAllByAltText(/Foto Test 1/i)
    fireEvent.doubleClick(postImages[0])
    
    // Should render animated heart indicator
    expect(screen.getByTestId('animated-heart')).toBeInTheDocument()
  })

  test('clicking share icon copies link and displays toast', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText
      }
    })

    render(
      <MemoryRouter>
        <Feed user={{ id: '123', email: 'test@example.com' }} />
      </MemoryRouter>
    )
    
    const shareButtons = await screen.findAllByTestId('share-btn')
    fireEvent.click(shareButtons[0])
    
    expect(mockWriteText).toHaveBeenCalled()
    expect(await screen.findByText(/Tautan disalin ke papan klip!/i)).toBeInTheDocument()
  })

  test('toggling bookmark changes its visually saved state', async () => {
    render(
      <MemoryRouter>
        <Feed user={{ id: '123', email: 'test@example.com' }} />
      </MemoryRouter>
    )
    
    const bookmarkButtons = await screen.findAllByTestId('bookmark-btn')
    
    // Check initial unfilled state
    const unfilledSvg = bookmarkButtons[0].querySelector('svg')
    expect(unfilledSvg).not.toHaveClass('fill-ig-text')
    
    // Click to save
    fireEvent.click(bookmarkButtons[0])
    
    // Check filled state
    expect(bookmarkButtons[0].querySelector('svg')).toHaveClass('fill-ig-text')
  })
})
