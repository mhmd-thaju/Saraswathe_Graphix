import { useState } from 'react'
import { Lock, Printer } from 'lucide-react'

interface Props {
  onLogin: (pass: string) => boolean
}

export default function LoginPage({ onLogin }: Props) {
  const [pass, setPass] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onLogin(pass)) {
      setError(false)
    } else {
      setError(true)
      setPass('')
    }
  }

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Printer className="text-brand-400" size={32} />
          </div>
          <h1 className="text-2xl font-outfit font-800 text-text-primary">PrintFlow ERP</h1>
          <p className="text-text-muted text-sm mt-2">Please enter shop password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-faint" size={18} />
            <input
              type="password"
              placeholder="Enter Password"
              className={`w-full bg-bg-elevated border-2 ${error ? 'border-danger' : 'border-bg-border'} rounded-xl py-3 pl-12 pr-4 text-text-primary focus:border-brand-500 outline-none transition-all`}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoFocus
            />
          </div>
          
          {error && (
            <p className="text-danger text-xs text-center">Incorrect password. Please try again.</p>
          )}

          <button type="submit" className="btn-primary w-full py-3 text-base">
            Unlock System
          </button>
        </form>

        <p className="text-center text-text-faint text-[10px] mt-8 uppercase tracking-widest">
          Secure Terminal &copy; 2026 PrintFlow
        </p>
      </div>
    </div>
  )
}
