import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Search as SearchIcon, Heart } from 'lucide-react'

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    try {
      setSearching(true)
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
        .ilike('caption', `%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error
      setResults(data || [])
    } catch (e) {
      console.error(e.message)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="w-full max-w-[600px] space-y-6 text-ig-text">
      <h2 className="text-xl font-bold font-serif text-left">Cari Postingan</h2>
      <form onSubmit={handleSearch} className="flex space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Cari postingan..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-zinc-100 border border-ig-border rounded-lg py-2 px-10 text-sm focus:outline-none focus:border-zinc-700 placeholder-zinc-500"
          />
          <SearchIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
        </div>
        <button type="submit" className="bg-ig-blue px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 cursor-pointer transition-colors active:scale-95">
          Cari
        </button>
      </form>

      {searching ? (
        <div className="text-center py-10 text-zinc-500">Mencari...</div>
      ) : results.length === 0 ? (
        <div className="text-center py-10 text-zinc-500">Tidak ada hasil ditemukan.</div>
      ) : (
        <div className="space-y-4 text-left">
          {results.map(post => (
            <div key={post.id} className="flex space-x-4 p-3 border border-ig-border rounded-lg bg-ig-card">
              <img src={post.image_url} alt={post.caption} className="w-16 h-16 rounded-md object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">@{post.profiles?.username || 'user'}</p>
                <p className="text-xs text-zinc-400 truncate">{post.caption}</p>
                <div className="flex items-center space-x-1 text-xs text-zinc-500 mt-1">
                  <Heart className="w-3.5 h-3.5 fill-ig-heart text-ig-heart" />
                  <span>{post.likes ? post.likes.length : 0} Suka</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
