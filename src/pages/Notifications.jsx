import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Notifications({ user }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  async function fetchNotifications() {
    try {
      setLoading(true)
      // 1. Get user posts IDs
      const { data: posts } = await supabase.from('posts').select('id, image_url').eq('user_id', user.id)
      
      if (posts && posts.length > 0) {
        const postIds = posts.map(p => p.id)
        
        // 2. Fetch likes on those posts
        const { data: likes, error } = await supabase
          .from('likes')
          .select(`
            post_id,
            user_id,
            profiles!likes_user_id_fkey (username)
          `)
          .in('post_id', postIds)

        if (error) throw error
        
        // Match image url to likes
        const notificationsData = likes?.map(like => {
          const matchedPost = posts.find(p => p.id === like.post_id)
          return {
            ...like,
            post_image: matchedPost?.image_url
          }
        }).filter(like => like.user_id !== user.id) || [] // exclude self likes

        setNotifications(notificationsData)
      }
    } catch (e) {
      console.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[600px] space-y-6 text-left text-ig-text">
      <h2 className="text-xl font-bold font-serif">Notifikasi Aktivitas</h2>
      {loading ? (
        <div className="text-center py-10 text-zinc-500">Memuat notifikasi...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-10 text-zinc-500">Belum ada aktivitas baru.</div>
      ) : (
        <div className="divide-y divide-ig-border">
          {notifications.map((notif, index) => (
            <div key={index} className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-xs">
                  {notif.profiles?.username ? notif.profiles.username[0].toUpperCase() : 'U'}
                </div>
                <p className="text-sm text-ig-text">
                  <span className="font-semibold">@{notif.profiles?.username || 'user'}</span> menyukai postingan Anda.
                </p>
              </div>
              {notif.post_image && (
                <img src={notif.post_image} alt="Post liked" className="w-10 h-10 object-cover rounded-md border border-ig-border" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
