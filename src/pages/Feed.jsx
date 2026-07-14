import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Button } from '../components/ui/button'
import { Heart, MessageCircle, Send, Bookmark, X, UploadCloud, Loader2 } from 'lucide-react'

// Mock Data for Stories & Suggestions
const MOCK_STORIES = [
  { id: 1, username: 'natasyacptr', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
  { id: 2, username: 'ibra17al.t', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' },
  { id: 3, username: 'realst4r_s', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop' },
  { id: 4, username: 'linzzkunn', avatar: 'https://images.unsplash.com/photo-1527983359383-4758693f760c?w=100&h=100&fit=crop' },
  { id: 5, username: '4linns_', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop' }
]

const MOCK_SUGGESTIONS = [
  { id: 1, username: 'alld', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', desc: 'Diikuti oleh apinxyz + 1 lainnya' },
  { id: 2, username: 'Aisyah', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop', desc: 'Diikuti oleh npssazh + 9 lainnya' },
  { id: 3, username: 'SAMUDRA', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop', desc: 'Diikuti oleh giow_17 + 21 lainnya' }
]

export default function Feed({ user }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const isModalOpen = searchParams.get('create') === 'true' && !!user
  
  // Upload State
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

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
          likes (user_id)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
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

  return (
    <div className="w-full max-w-[935px] flex space-x-12 justify-center">
      {/* Feed Area */}
      <div className="flex-1 max-w-[630px] space-y-6">
        
        {/* Stories Bar */}
        <div className="border border-ig-border bg-ig-card rounded-lg p-4 flex space-x-4 overflow-x-auto scrollbar-none">
          {MOCK_STORIES.map(story => (
            <div key={story.id} className="flex flex-col items-center space-y-1.5 flex-shrink-0 cursor-pointer">
              <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600">
                <img src={story.avatar} alt={story.username} className="w-full h-full rounded-full object-cover border-2 border-black" />
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

                  {/* Post Image */}
                  <div className="w-full bg-black aspect-square flex items-center justify-center overflow-hidden">
                    <img src={post.image_url} alt={post.caption || 'Foto'} className="w-full h-full object-cover" />
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
                        <MessageCircle className="w-6 h-6 hover:text-zinc-400 cursor-pointer text-ig-text" />
                        <Send className="w-6 h-6 hover:text-zinc-400 cursor-pointer text-ig-text" />
                      </div>
                      <Bookmark className="w-6 h-6 hover:text-zinc-400 cursor-pointer text-ig-text" />
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

                    <div className="text-[10px] text-ig-muted uppercase tracking-wider">
                      {formattedDate}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {/* Right Suggestions Sidebar */}
      <div className="w-[320px] lg:block hidden space-y-6 pt-4 text-white">
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
            <button className="text-xs font-bold text-ig-blue hover:text-white cursor-pointer">Alihkan</button>
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
                <button className="text-xs font-bold text-ig-blue hover:text-white cursor-pointer">Ikuti</button>
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
          
          <div className="bg-[#262626] border border-zinc-800 rounded-xl overflow-hidden w-full max-w-[800px] h-[500px] flex flex-col relative z-50 text-white">
            {/* Modal Header */}
            <div className="h-11 border-b border-zinc-800 flex justify-between items-center px-4 bg-zinc-900/50">
              <span className="text-sm font-semibold mx-auto">Buat postingan baru</span>
              {file && (
                <button 
                  onClick={handleUpload} 
                  disabled={uploading}
                  className="text-sm font-bold text-ig-blue hover:text-white cursor-pointer disabled:opacity-50 absolute right-4"
                >
                  {uploading ? 'Mengunggah...' : 'Bagikan'}
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="flex-1 flex md:flex-row flex-col overflow-hidden bg-black">
              {/* Left Panel: Image Drop Area / Preview */}
              <div 
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`flex-1 flex flex-col items-center justify-center p-6 border-r border-zinc-800 relative ${dragActive ? 'bg-zinc-900/40' : ''}`}
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
              <div className="w-full md:w-[300px] bg-zinc-950 p-4 flex flex-col justify-between">
                <div className="space-y-4">
                  {user && (
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-[10px]">
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
    </div>
  )
}
