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
    <div className="flex flex-col items-center justify-center py-20">
      <div className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold mb-6">Welcome Back</h2>
        <Button onClick={handleGoogleLogin} className="w-full">
          Login with Google
        </Button>
      </div>
    </div>
  )
}
