import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Heart } from 'lucide-react'

export default function Explore() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          image_url,
          caption,
          likes (user_id)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (e) {
      console.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[935px] space-y-6 text-white">
      <h2 className="text-xl font-bold font-serif text-left">Jelajahi Komunitas</h2>
      {loading ? (
        <div className="text-center py-20 text-zinc-500">Memuat galeri...</div>
      ) : (
        <div className="grid grid-cols-3 gap-1 md:gap-7">
          {posts.map(post => (
            <div key={post.id} className="relative aspect-square bg-zinc-900 group overflow-hidden rounded-md cursor-pointer border border-ig-border">
              <img src={post.image_url} alt={post.caption} className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-6 text-white font-semibold">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 fill-white" />
                  <span>{post.likes ? post.likes.length : 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
