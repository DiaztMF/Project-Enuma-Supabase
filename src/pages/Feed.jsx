import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Button } from '../components/ui/button'
import { Heart, UploadCloud, Loader2 } from 'lucide-react'

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  
  // Upload State
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [file, setFile] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      setLoading(true)
      // Fetch posts with author profile and likes count
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
      
      // 1. Upload to Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error: uploadError, data } = await supabase.storage
        .from('uploads')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 2. Get Public URL
      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName)

      // 3. Insert Post
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
      fetchPosts() // Refresh
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

  return (
    <div className="space-y-8 pb-10">
      {/* Upload Form - Only if logged in */}
      {user && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Buat Postingan Baru</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 border p-2 rounded-md"
                required
              />
            </div>
            <div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Apa caption untuk foto ini?"
                className="w-full border rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-slate-950"
                rows="2"
              />
            </div>
            <Button type="submit" disabled={uploading || !file}>
              {uploading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengunggah...</>
              ) : (
                <><UploadCloud className="w-4 h-4 mr-2" /> Posting</>
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Feed List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-10">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
            <p className="text-slate-500 mt-2">Memuat postingan...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 bg-white border rounded-xl shadow-sm">
            <p className="text-slate-500">Belum ada postingan. Jadilah yang pertama!</p>
          </div>
        ) : (
          posts.map(post => {
            const hasLiked = user && post.likes.some(like => like.user_id === user.id)
            const likeCount = post.likes.length

            return (
              <div key={post.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-slate-50/50">
                  <p className="font-semibold text-slate-800">
                    @{post.profiles?.username || 'unknown'}
                  </p>
                </div>
                
                <img src={post.image_url} alt={post.caption} className="w-full h-auto object-cover max-h-[600px]" />
                
                <div className="p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => toggleLike(post.id, hasLiked)}
                      className="transition-transform active:scale-95"
                    >
                      <Heart className={`w-6 h-6 ${hasLiked ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
                    </button>
                    <span className="text-sm font-medium text-slate-700">{likeCount} Suka</span>
                  </div>
                  
                  {post.caption && (
                    <p className="text-sm text-slate-800">
                      <span className="font-semibold mr-2">{post.profiles?.username || 'unknown'}</span>
                      {post.caption}
                    </p>
                  )}
                  
                  <p className="text-xs text-slate-400 uppercase tracking-wide">
                    {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
