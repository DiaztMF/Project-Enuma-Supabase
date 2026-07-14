import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Button } from '../components/ui/button'
import { Heart, MessageCircle, Send, Bookmark, X, UploadCloud, Loader2 } from 'lucide-react'

// Mock Data for Suggestions (kept as mock or can be fallback)
const MOCK_SUGGESTIONS = [
  { id: 1, username: 'alld', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', desc: 'Diikuti oleh apinxyz + 1 lainnya' },
  { id: 2, username: 'Aisyah', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop', desc: 'Diikuti oleh npssazh + 9 lainnya' },
  { id: 3, username: 'SAMUDRA', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop', desc: 'Diikuti oleh giow_17 + 21 lainnya' }
]

export default function Feed({ user }) {
  const [posts, setPosts] = useState([])
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const isModalOpen = searchParams.get('create') === 'true' && !!user
  
  // Upload State
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  // Story Viewer State
  const [activeStoryIndex, setActiveStoryIndex] = useState(null)
  const [progress, setProgress] = useState(0)

  // Comments State
  const [commentInputs, setCommentInputs] = useState({})
  const [expandedComments, setExpandedComments] = useState({})

  // Double Click Animation State
  const [animateHeartPostId, setAnimateHeartPostId] = useState(null)

  // Share Toast State
  const [shareToastText, setShareToastText] = useState('')

  // Bookmarks State
  const [savedPostIds, setSavedPostIds] = useState([])

  useEffect(() => {
    fetchPosts()
  }, [])

  // Timer Effect for Stories Progress
  useEffect(() => {
    if (activeStoryIndex === null) return
    setProgress(0)

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          // Advance to next story or close
          if (activeStoryIndex < stories.length - 1) {
            setActiveStoryIndex(activeStoryIndex + 1)
          } else {
            setActiveStoryIndex(null)
          }
          return 100
        }
        return prev + 5 // 5% every 150ms = 100% in 3000ms
      })
    }, 150)

    return () => clearInterval(interval)
  }, [activeStoryIndex, stories.length])

  async function fetchPosts() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          image_url,
          caption,
          created_at,
          profiles!posts_user_id_fkey (username),
          likes (user_id),
          comments (
            id,
            text,
            profiles (username)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])

      // Deduplicate posts to generate dynamic stories (1 latest post per user)
      const uniqueUsers = {}
      const dynamicStories = []
      data?.forEach(post => {
        const username = post.profiles?.username || 'user'
        if (!uniqueUsers[username]) {
          uniqueUsers[username] = true
          dynamicStories.push({
            id: post.id,
            username: username,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
            post_image: post.image_url,
            caption: post.caption,
            created_at: post.created_at
          })
        }
      })
      setStories(dynamicStories)

    } catch (error) {
      console.error('Error fetching posts:', error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!file || !user) return

    try {
      setUploading(true)
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName)

      const { error: dbError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          image_url: urlData.publicUrl,
          caption: caption
        })

      if (dbError) throw dbError

      setFile(null)
      setCaption('')
      closeModal()
      fetchPosts()
    } catch (error) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  async function toggleLike(postId, hasLiked) {
    if (!user) return alert("Silakan login untuk menyukai postingan.")

    try {
      if (hasLiked) {
        await supabase.from('likes').delete().match({ post_id: postId, user_id: user.id })
      } else {
        await supabase.from('likes').insert({ post_id: postId, user_id: user.id })
      }
      fetchPosts()
    } catch (error) {
      console.error(error.message)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  function closeModal() {
    navigate('/')
  }

  // Interactive functions
  const handleDoubleClick = (postId, hasLiked) => {
    setAnimateHeartPostId(postId)
    setTimeout(() => setAnimateHeartPostId(null), 800)
    if (!hasLiked) {
      toggleLike(postId, false)
    }
  }

  const focusCommentInput = (postId) => {
    document.getElementById(`comment-input-${postId}`)?.focus()
  }

  const handleShare = (postId) => {
    const url = `${window.location.origin}/post/${postId}`
    navigator.clipboard.writeText(url)
    setShareToastText('Tautan disalin ke papan klip!')
    setTimeout(() => setShareToastText(''), 2000)
  }

  const toggleBookmark = (postId) => {
    setSavedPostIds(prev => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    )
  }

  const toggleExpandComments = (postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }))
  }

  const getPostComments = (post) => {
    return post.comments || []
  }

  const renderComments = (post) => {
    const postComments = getPostComments(post)
    if (expandedComments[post.id]) {
      return postComments
    }
    return postComments.slice(-2) // Show last 2 comments
  }

  const handleAddComment = async (postId) => {
    if (!user) return alert("Silakan login untuk memberikan komentar.")
    const text = commentInputs[postId] || ''
    if (!text.trim()) return

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          text: text
        })
      
      if (error) throw error

      setCommentInputs(prev => ({ ...prev, [postId]: '' }))
      fetchPosts()
    } catch (error) {
      console.error('Error adding comment:', error.message)
    }
  }

  return (
    <div className="w-full max-w-[935px] flex space-x-12 justify-center">
      {/* Feed Area */}
      <div className="flex-1 max-w-[630px] space-y-6">
        
        {/* Stories Bar */}
        <div className="border border-ig-border bg-ig-card rounded-lg p-4 flex space-x-4 overflow-x-auto scrollbar-none">
          {stories.map((story, index) => (
            <div 
              key={story.id} 
              onClick={() => setActiveStoryIndex(index)}
              className="flex flex-col items-center space-y-1.5 flex-shrink-0 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600">
                <img src={story.avatar} alt={story.username} className="w-full h-full rounded-full object-cover border-2 border-white" />
              </div>
              <span className="text-[11px] text-ig-muted truncate w-14 text-center">
                {story.username}
              </span>
            </div>
          ))}
        </div>

        {/* Feed Posts */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-zinc-600" />
            <p className="text-ig-muted text-sm mt-3">Memuat feed...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 border border-ig-border rounded-lg bg-ig-card">
            <p className="text-ig-muted">Belum ada kiriman dari komunitas.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => {
              const hasLiked = user && post.likes?.some(like => like.user_id === user.id)
              const likeCount = post.likes ? post.likes.length : 0
              const username = post.profiles?.username || 'user'
              const formattedDate = new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

              return (
                <article key={post.id} className="border border-ig-border bg-ig-card rounded-lg overflow-hidden">
                  {/* Post Header */}
                  <div className="p-3.5 flex justify-between items-center border-b border-ig-border">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-xs">
                        {username[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold hover:text-zinc-300 cursor-pointer">
                        {username}
                      </span>
                    </div>
                  </div>

                  {/* Post Image (with double click to like) */}
                  <div 
                    onDoubleClick={() => handleDoubleClick(post.id, hasLiked)}
                    className="w-full bg-zinc-50 aspect-square flex items-center justify-center overflow-hidden relative cursor-pointer select-none"
                  >
                    <img src={post.image_url} alt={post.caption || 'Foto'} className="w-full h-full object-cover" />
                    {animateHeartPostId === post.id && (
                      <div data-testid="animated-heart" className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-black/10">
                        <Heart className="w-20 h-20 text-white fill-white animate-ping" />
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="p-3.5 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={() => toggleLike(post.id, hasLiked)}
                          className="hover:text-zinc-400 active:scale-90 transition-transform cursor-pointer text-ig-text"
                        >
                          <Heart className={`w-6 h-6 ${hasLiked ? 'fill-ig-heart text-ig-heart' : 'text-ig-text'}`} />
                        </button>
                        <button 
                          onClick={() => focusCommentInput(post.id)}
                          className="hover:text-zinc-400 cursor-pointer text-ig-text"
                        >
                          <MessageCircle className="w-6 h-6" />
                        </button>
                        <button 
                          data-testid="share-btn"
                          onClick={() => handleShare(post.id)}
                          className="hover:text-zinc-400 cursor-pointer text-ig-text"
                        >
                          <Send className="w-6 h-6" />
                        </button>
                      </div>
                      <button 
                        data-testid="bookmark-btn"
                        onClick={() => toggleBookmark(post.id)}
                        className="hover:text-zinc-400 cursor-pointer text-ig-text"
                      >
                        <Bookmark className={`w-6 h-6 ${savedPostIds.includes(post.id) ? 'fill-ig-text text-ig-text' : 'text-ig-text'}`} />
                      </button>
                    </div>

                    <div className="text-sm font-semibold">
                      {likeCount} Suka
                    </div>

                    {post.caption && (
                      <div className="text-sm leading-relaxed">
                        <span className="font-semibold mr-2">{username}</span>
                        {post.caption}
                      </div>
                    )}

                    {/* Comments List */}
                    <div className="space-y-1 mt-2 pt-2 border-t border-ig-border/30">
                      {/* View all comments toggle */}
                      {getPostComments(post).length > 2 && !expandedComments[post.id] && (
                        <button 
                          onClick={() => toggleExpandComments(post.id)}
                          className="text-xs text-ig-muted hover:text-ig-text font-medium cursor-pointer"
                        >
                          Lihat semua {getPostComments(post).length} komentar
                        </button>
                      )}
                      
                      <div className="space-y-1">
                        {renderComments(post).map(cmt => {
                          const commenterName = cmt.profiles?.username || 'user'
                          return (
                            <div key={cmt.id} className="text-xs">
                              <span className="font-semibold mr-1.5">{commenterName}</span>
                              <span>{cmt.text}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="text-[10px] text-ig-muted uppercase tracking-wider">
                      {formattedDate}
                    </div>

                    {/* Add Comment Input Field */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleAddComment(post.id)
                      }}
                      className="flex items-center justify-between border-t border-ig-border pt-3 mt-3 text-sm text-ig-text"
                    >
                      <input 
                        id={`comment-input-${post.id}`}
                        type="text"
                        placeholder="Tambahkan komentar..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        className="w-full bg-transparent focus:outline-none placeholder-zinc-400 text-xs pr-4"
                      />
                      <button 
                        type="submit" 
                        disabled={!(commentInputs[post.id] || '').trim()}
                        className="text-xs font-semibold text-ig-blue hover:text-blue-600 disabled:opacity-30 cursor-pointer"
                      >
                        Kirim
                      </button>
                    </form>

                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {/* Right Suggestions Sidebar */}
      <div className="w-[320px] lg:block hidden space-y-6 pt-4 text-ig-text">
        {/* Current user info */}
        {user && (
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-11 h-11 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-sm">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold">@{user.email?.split('@')[0] || 'user'}</p>
                <p className="text-xs text-ig-muted">Pengguna Aktif</p>
              </div>
            </div>
            <button className="text-xs font-bold text-ig-blue hover:text-ig-text cursor-pointer">Alihkan</button>
          </div>
        )}

        {/* Suggestions list */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-ig-muted">Saran Untuk Anda</span>
            <button className="text-xs font-bold text-ig-text hover:text-ig-muted cursor-pointer">Lihat Semua</button>
          </div>
          
          <div className="space-y-3.5">
            {MOCK_SUGGESTIONS.map(sug => (
              <div key={sug.id} className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <img src={sug.avatar} alt={sug.username} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold">{sug.username}</p>
                    <p className="text-[10px] text-ig-muted truncate w-40">{sug.desc}</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-ig-blue hover:text-ig-text cursor-pointer">Ikuti</button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Meta */}
        <div className="text-[11px] text-ig-muted leading-loose">
          Tentang · Bantuan · Pers · API · Pekerjaan · Privasi · Ketentuan · Lokasi
          <p className="mt-4">© 2026 COMMUNITY BOARD FROM META</p>
        </div>
      </div>

      {/* Upload Modal (Split-panel) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <button 
            onClick={closeModal} 
            className="absolute top-4 right-4 text-white hover:text-zinc-300 cursor-pointer z-50"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="bg-white border border-ig-border rounded-xl overflow-hidden w-full max-w-[800px] h-[500px] flex flex-col relative z-50 text-ig-text">
            {/* Modal Header */}
            <div className="h-11 border-b border-ig-border flex justify-between items-center px-4 bg-zinc-50">
              <span className="text-sm font-semibold mx-auto">Buat postingan baru</span>
              {file && (
                <button 
                  onClick={handleUpload} 
                  disabled={uploading}
                  className="text-sm font-bold text-ig-blue hover:text-ig-text cursor-pointer disabled:opacity-50 absolute right-4"
                >
                  {uploading ? 'Mengunggah...' : 'Bagikan'}
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="flex-1 flex md:flex-row flex-col overflow-hidden bg-zinc-50">
              {/* Left Panel: Image Drop Area / Preview */}
              <div 
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`flex-1 flex flex-col items-center justify-center p-6 border-r border-ig-border relative ${dragActive ? 'bg-zinc-100' : ''}`}
              >
                {file ? (
                  <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center space-y-4">
                    <UploadCloud className="w-16 h-16 mx-auto text-zinc-500" />
                    <p className="text-sm font-medium">Tarik foto di sini</p>
                    <label className="inline-block bg-ig-blue text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-600 cursor-pointer active:scale-95 transition-transform">
                      Pilih dari komputer
                      <input 
                        type="file" 
                        accept="image/jpeg,image/png"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="hidden" 
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Right Panel: Caption Textarea */}
              <div className="w-full md:w-[300px] bg-white p-4 flex flex-col justify-between">
                <div className="space-y-4">
                  {user && (
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-[10px]">
                        {user.email[0].toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold">@{user.email.split('@')[0]}</span>
                    </div>
                  )}

                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Tulis cerita di balik foto ini..."
                    className="w-full bg-transparent text-sm resize-none focus:outline-none placeholder-zinc-500 h-40"
                    maxLength="2200"
                  />
                </div>

                <div className="text-right text-[10px] text-zinc-600">
                  {caption.length} / 2200
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Story Viewer Overlay */}
      {activeStoryIndex !== null && stories[activeStoryIndex] && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center">
          {/* Header Progress Bar */}
          <div className="absolute top-4 left-4 right-4 z-50 space-y-2">
            <div className="flex space-x-1.5 w-full">
              {stories.map((_, idx) => (
                <div key={idx} className="flex-1 h-0.5 bg-zinc-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-150 ease-linear"
                    style={{ 
                      width: idx === activeStoryIndex ? `${progress}%` : idx < activeStoryIndex ? '100%' : '0%' 
                    }}
                  />
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center text-white">
              <div className="flex items-center space-x-3 text-left">
                <img src={stories[activeStoryIndex].avatar} alt={stories[activeStoryIndex].username} className="w-8 h-8 rounded-full object-cover border border-white" />
                <span className="text-sm font-semibold">@{stories[activeStoryIndex].username}</span>
              </div>
              <button 
                onClick={() => setActiveStoryIndex(null)}
                className="text-white hover:text-zinc-300 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Left Arrow */}
          {activeStoryIndex > 0 && (
            <button 
              onClick={() => setActiveStoryIndex(activeStoryIndex - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-zinc-300 cursor-pointer p-2 bg-zinc-900/40 rounded-full z-50"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Story Content */}
          <div className="relative max-w-lg w-full px-4 text-center space-y-4">
            <div className="text-white text-xs mb-2 uppercase tracking-widest text-zinc-400">Menatap Story</div>
            <div className="aspect-square bg-zinc-950 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-800">
              <img src={stories[activeStoryIndex].post_image} alt="Story" className="w-full h-full object-contain" />
            </div>
            {stories[activeStoryIndex].caption && (
              <p className="text-white text-sm bg-black/40 p-3 rounded-lg backdrop-blur-sm mt-2">{stories[activeStoryIndex].caption}</p>
            )}
          </div>

          {/* Right Arrow */}
          {activeStoryIndex < stories.length - 1 && (
            <button 
              onClick={() => setActiveStoryIndex(activeStoryIndex + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-zinc-300 cursor-pointer p-2 bg-zinc-900/40 rounded-full z-50"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Toast Notification */}
      {shareToastText && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-xs px-4 py-2.5 rounded-lg z-[110] shadow-lg transition-opacity flex items-center space-x-2">
          <span>{shareToastText}</span>
        </div>
      )}
    </div>
  )
}
