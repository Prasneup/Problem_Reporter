import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import { Mail, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await authService.resetPassword(email);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'Failed to send password reset email. Please verify your address.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4 relative">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-blue-500/10 rounded-xl text-blue-400 mb-3 border border-blue-500/20">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Reset Password</h2>
          <p className="text-slate-400 text-xs mt-1">We will send a reset link to your registered email</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-xs flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-green-400 text-xs flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Reset Link Sent</p>
                <p className="text-slate-400 mt-1">Please check your inbox. If the email doesn't arrive in a few minutes, check your spam folder.</p>
              </div>
            </div>
            <Link
              to="/login"
              className="block w-full text-center bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-lg text-xs transition-colors"
            >
              Return to Login
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2.5 rounded-lg text-xs transition-all shadow-glow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : 'Send Recovery Email'}
            </button>

            <div className="text-center mt-6 pt-4 border-t border-slate-800/60">
              <Link to="/login" className="text-xs text-blue-400 hover:underline">
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
