import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Send, MessageCircle } from 'lucide-react'

export default function Messages({ user }) {
  const [profiles, setProfiles] = useState([])
  const [activeProfile, setActiveProfile] = useState(null)
  const [message, setMessage] = useState('')
  const [chats, setChats] = useState([])

  useEffect(() => {
    if (user) {
      fetchProfiles()
    }
  }, [user])

  async function fetchProfiles() {
    const { data } = await supabase.from('profiles').select('*')
    setProfiles(data?.filter(p => p.id !== user?.id) || [])
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setChats([...chats, { sender: 'me', text: message }])
    setMessage('')
  }

  return (
    <div className="w-full max-w-[935px] border border-ig-border rounded-lg h-[600px] flex bg-ig-card text-white overflow-hidden">
      {/* Inbox List */}
      <div className="w-[300px] border-r border-ig-border flex flex-col">
        <div className="p-4 border-b border-ig-border">
          <h2 className="text-base font-bold text-left">Obrolan</h2>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-ig-border/50">
          {profiles.map(p => (
            <div 
              key={p.id} 
              onClick={() => setActiveProfile(p)}
              className={`p-4 flex items-center space-x-4 cursor-pointer hover:bg-zinc-900 transition-colors ${activeProfile?.id === p.id ? 'bg-zinc-900' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-sm">
                {p.username[0].toUpperCase()}
              </div>
              <span className="text-sm font-semibold">@{p.username}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col justify-between bg-black">
        {activeProfile ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-ig-border flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs">
                {activeProfile.username[0].toUpperCase()}
              </div>
              <span className="text-sm font-semibold">@{activeProfile.username}</span>
            </div>
            
            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chats.map((c, i) => (
                <div key={i} className={`flex ${c.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl text-sm max-w-xs ${c.sender === 'me' ? 'bg-ig-blue text-white' : 'bg-zinc-800 text-zinc-200'}`}>
                    {c.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Footer */}
            <form onSubmit={sendMessage} className="p-4 border-t border-ig-border flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ketik pesan..."
                className="flex-1 bg-[#1c1c1e] border border-ig-border rounded-full py-2 px-4 text-sm focus:outline-none focus:border-zinc-700"
              />
              <button type="submit" className="p-2 bg-ig-blue rounded-full hover:bg-blue-600 cursor-pointer">
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
            <MessageCircle className="w-16 h-16 mb-2" />
            <p className="text-sm">Pilih pengguna untuk mulai mengirim pesan.</p>
          </div>
        )}
      </div>
    </div>
  )
}
