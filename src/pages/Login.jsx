import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Button } from '../components/ui/button'

export default function Login() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
  }

  return (
    <div className="md:h-[100dvh] min-h-[100dvh] p-5 w-full flex md:flex-row flex-col gap-5 overflow-hidden bg-zinc-50 font-sans text-zinc-900">
      
      {/* Left Column: Visual Bento Gallery */}
      <div className="hidden md:flex md:w-[55%] h-full bg-zinc-950 p-12 flex-col justify-between overflow-hidden relative rounded-2xl select-none">
        
        {/* Subtle grid mesh background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
        

        {/* Bento Grid */}
        <div className="z-10 grid grid-cols-3 grid-rows-3 gap-4 my-auto max-w-[580px] w-full aspect-square">
          {/* Box 1 (Big Cover) */}
          <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden border border-zinc-800/40 shadow-xl relative group">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500 z-10" />
            <img 
              src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80" 
              alt="Aesthetic camera" 
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>

          {/* Box 2 */}
          <div className="col-span-1 row-span-1 rounded-2xl overflow-hidden border border-zinc-800/40 shadow-xl relative group">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500 z-10" />
            <img 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=80" 
              alt="Modern architecture" 
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>

          {/* Box 3 */}
          <div className="col-span-1 row-span-2 rounded-2xl overflow-hidden border border-zinc-800/40 shadow-xl relative group">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500 z-10" />
            <img 
              src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&auto=format&fit=crop&q=80" 
              alt="Vast landscape" 
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>

          {/* Box 4 */}
          <div className="col-span-2 row-span-1 rounded-2xl overflow-hidden border border-zinc-800/40 shadow-xl relative group">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500 z-10" />
            <img 
              src="https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&auto=format&fit=crop&q=80" 
              alt="Curated forest path" 
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
        </div>

        {/* Gallery Footer Tag */}
        <div className="z-10 flex flex-col space-y-1">
          <h2 className="text-3xl font-bold text-white tracking-tight leading-none">
            Connect with visual minds
          </h2>
          <p className="text-xs text-zinc-500 tracking-wide font-medium">
            © 2026 ENUMA COMMUNITY BOARD
          </p>
        </div>

      </div>

      {/* Right Column: Premium Authentication Card */}
      <div className="w-full md:w-[45%] md:h-full min-h-[calc(100dvh-2.5rem)] bg-white flex flex-col items-center justify-center p-8 relative rounded-2xl border border-zinc-200/50 shadow-sm">
        
        {/* Auth form wrap */}
        <div className="w-full max-w-sm flex flex-col items-center text-center px-4">
          
          {/* Logo with rotating gradient ring */}
          <div className="relative w-16 h-16 mb-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 animate-[spin_8s_linear_infinite]" />
            <div className="absolute inset-[2.5px] rounded-full bg-white flex items-center justify-center font-bold text-xl text-zinc-950 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]">
              E
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-2">
            Welcome to Community
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed mb-8 max-w-[32ch]">
            Explore curated stories and share your perspective with the creator community.
          </p>

          {/* Premium Google Sign-In Button */}
          <Button 
            onClick={handleGoogleLogin} 
            className="w-full h-11 bg-white hover:bg-zinc-50 active:scale-[0.98] border border-zinc-200 hover:border-zinc-300 text-zinc-700 font-medium rounded-xl flex items-center justify-center shadow-sm transition-all duration-200 cursor-pointer"
          >
            {/* Google SVG Logo */}
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="w-full flex items-center my-6">
            <div className="flex-1 h-[1px] bg-zinc-100" />
            <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 px-3 select-none">or</span>
            <div className="flex-1 h-[1px] bg-zinc-100" />
          </div>

          {/* Guest Mode Link */}
          <Link 
            to="/" 
            className="text-xs font-semibold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-wider cursor-pointer"
          >
            Explore as guest
          </Link>

        </div>

      </div>

    </div>
  )
}
