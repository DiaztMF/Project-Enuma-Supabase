import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Button } from '../components/ui/button'
import { Heart, UploadCloud, Loader2, X } from 'lucide-react'

export default function Feed({ user }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  // Drawer visibility is controlled by ?create=true query param
  const isDrawerOpen = searchParams.get('create') === 'true' && !!user

  // Upload State
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [file, setFile] = useState(null)

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
      closeDrawer()
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

  function closeDrawer() {
    navigate('/')
  }

  return (
    <div className="relative">
      {/* Upload Drawer (Slide-over) */}
      {isDrawerOpen && (
        <>
          {/* Overlay background */}
          <div 
            onClick={closeDrawer} 
            className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40 transition-opacity"
          />
          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 border-l border-zinc-200/80 p-6 flex flex-col justify-between transform transition-transform duration-300 ease-out">
            <div>
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-bold font-serif text-editorial-text">Unggah Foto Baru</h2>
                <button 
                  onClick={closeDrawer}
                  className="p-1 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">File Gambar</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-zinc-200 file:text-xs file:font-semibold file:bg-zinc-50 file:text-zinc-700 hover:file:bg-zinc-100 border p-2 rounded-md cursor-pointer"
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Keterangan / Caption</label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Tulis cerita di balik foto ini..."
                    className="w-full border border-zinc-200 rounded-md p-3 text-sm focus:outline-none focus:border-editorial-accent/80 transition-colors"
                    rows="4"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={uploading || !file}
                  className="w-full bg-editorial-accent text-white py-2.5 rounded-md font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center cursor-pointer font-sans"
                >
                  {uploading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengunggah...</>
                  ) : (
                    <><UploadCloud className="w-4 h-4 mr-2" /> Posting</>
                  )}
                </Button>
              </form>
            </div>

            <button 
              onClick={closeDrawer}
              className="w-full py-2 border border-zinc-200 text-zinc-500 rounded-md hover:bg-zinc-50 active:scale-[0.98] transition-all text-sm font-semibold cursor-pointer font-sans"
            >
              Batal
            </button>
          </div>
        </>
      )}

      {/* Main Feed Photos Grid */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-zinc-400" />
          <p className="text-zinc-500 text-sm mt-3 font-serif">Memuat foto komunitas...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-white border border-zinc-200/50 rounded-xl max-w-xl mx-auto shadow-sm">
          <p className="text-zinc-500 font-serif">Belum ada karya foto yang dibagikan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => {
            const hasLiked = user && post.likes?.some(like => like.user_id === user.id)
            const likeCount = post.likes ? post.likes.length : 0
            const username = post.profiles?.username || 'kreator'

            return (
              <div key={post.id} className="group flex flex-col space-y-3">
                {/* Photo container */}
                <div className="overflow-hidden rounded-lg bg-zinc-100 aspect-[4/5] border border-zinc-200/40 relative shadow-sm">
                  <img 
                    src={post.image_url} 
                    alt={post.caption || 'Foto Komunitas'} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                </div>
                
                {/* Footer details */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="font-serif font-bold text-base text-editorial-text">
                      @{username}
                    </p>
                    <button 
                      onClick={() => toggleLike(post.id, hasLiked)}
                      className="flex items-center space-x-1.5 text-sm font-medium text-zinc-500 hover:text-editorial-text transition-colors cursor-pointer group/btn"
                    >
                      <Heart 
                        className={`w-4 h-4 transition-transform group-active/btn:scale-90 ${hasLiked ? 'fill-editorial-likes text-editorial-likes' : 'text-zinc-400 hover:text-zinc-600'}`} 
                      />
                      <span>{likeCount}</span>
                    </button>
                  </div>
                  
                  {post.caption && (
                    <p className="text-sm text-zinc-600 leading-relaxed font-sans">
                      {post.caption}
                    </p>
                  )}
                  
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold pt-1">
                    {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
