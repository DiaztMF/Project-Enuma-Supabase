import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Grid, Heart } from 'lucide-react'

export default function Profile({ user }) {
  const { username } = useParams()
  const [profilePosts, setProfilePosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [profileUser, setProfileUser] = useState(null)

  useEffect(() => {
    fetchProfileData()
  }, [username])

  async function fetchProfileData() {
    try {
      setLoading(true)
      // Get profile info
      const { data: profs, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (profError) throw profError
      setProfileUser(profs)

      if (profs) {
        // Get posts of this profile
        const { data: posts, error: postError } = await supabase
          .from('posts')
          .select(`
            id,
            image_url,
            caption,
            likes (user_id)
          `)
          .eq('user_id', profs.id)

        if (postError) throw postError
        setProfilePosts(posts || [])
      }
    } catch (e) {
      console.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-zinc-500 font-sans">Memuat profil...</div>
  }

  if (!profileUser) {
    return <div className="text-center py-20 text-zinc-500 font-sans">Profil tidak ditemukan.</div>
  }

  return (
    <div className="w-full max-w-[935px] space-y-12 text-white">
      {/* Profile Header */}
      <div className="flex md:flex-row flex-col items-center md:space-x-20 space-y-6 md:space-y-0 border-b border-ig-border pb-12">
        <div className="w-32 h-32 rounded-full bg-zinc-800 flex items-center justify-center font-serif font-bold text-4xl text-white">
          {username[0].toUpperCase()}
        </div>
        <div className="space-y-4 text-left">
          <h2 className="text-2xl font-light">@{username}</h2>
          <div className="flex space-x-8 text-sm">
            <span><strong className="text-white">{profilePosts.length}</strong> kiriman</span>
            <span><strong className="text-white">{profilePosts.reduce((acc, p) => acc + (p.likes ? p.likes.length : 0), 0)}</strong> suka diterima</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-300">Bio pengguna @{username}</p>
          </div>
        </div>
      </div>

      {/* Grid Tab */}
      <div className="space-y-4">
        <div className="flex justify-center border-t border-white/20 -mt-12 py-3 text-xs tracking-wider uppercase font-semibold text-white space-x-1.5 items-center">
          <Grid className="w-4 h-4" />
          <span>KIRIMAN</span>
        </div>

        {profilePosts.length === 0 ? (
          <div className="text-center py-20 text-ig-muted">Belum ada postingan foto.</div>
        ) : (
          <div className="grid grid-cols-3 gap-1 md:gap-7">
            {profilePosts.map(post => (
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
    </div>
  )
}
