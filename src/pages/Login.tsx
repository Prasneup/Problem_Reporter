import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { useCivicStore } from '../stores/civicStore';
import { LogIn, Mail, Lock, AlertCircle, Loader } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setCurrentUser } = useCivicStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userProfile = await authService.signIn(email, password);
      setCurrentUser(userProfile);
      navigate('/');
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'Invalid email or password. Please try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4 relative overflow-hidden">
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-500/10 rounded-xl text-blue-400 mb-3 border border-blue-500/20">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Dang District Portal</h2>
          <p className="text-slate-400 text-xs mt-1">Smart City Problem Reporter Platform</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-xs flex items-center gap-2 mb-6 animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@dang.gov.np"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Password</label>
              <Link to="/forgot-password" className="text-[10px] text-blue-400 hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2.5 rounded-lg text-xs transition-all shadow-glow hover:shadow-cyan-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : 'Sign In to Portal'}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-slate-800/60">
          <p className="text-xs text-slate-400">
            First time reporting?{' '}
            <Link to="/register" className="text-blue-400 hover:underline font-medium">Create citizen account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
