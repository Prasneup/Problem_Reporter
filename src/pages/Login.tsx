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
      navigate('/app');
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'Invalid email or password. Please try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 px-4 relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl pointer-events-none opacity-40" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-100 rounded-full blur-3xl pointer-events-none opacity-40" />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-50 rounded-xl text-blue-600 mb-3 border border-blue-100">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 font-sans">Ghorahi Sub-Metropolitan Portal</h2>
          <p className="text-slate-450 text-xs mt-1 font-bold">Smart City Problem Reporter Platform</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-red-650 text-xs flex items-center gap-2 mb-6 animate-pulse font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@ghorahimun.gov.np"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Password</label>
              <Link to="/forgot-password" className="text-[10px] text-blue-600 hover:underline font-bold">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : 'Sign In to Portal'}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            First time reporting?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-bold">Create citizen account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
