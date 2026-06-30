import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import storageService from '../services/storageService';
import { MUNICIPALITIES } from '../constants/municipalities';
import type { UserRole } from '../types';
import { UserPlus, AlertCircle, Loader, Upload, Check } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '', password: '', name: '', phone: '',
    role: 'Citizen' as UserRole,
    muniId: 'ghorahi', ward: 1,
    idNum: '',
  });
  const [idFile, setIdFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedDocUrl, setUploadedDocUrl] = useState<string | undefined>(undefined);

  const selectedMuni = MUNICIPALITIES.find(m => m.id === formData.muniId) || MUNICIPALITIES[0];

  const handleMuniChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, muniId: e.target.value, ward: 1 });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setIdFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let docUrl = uploadedDocUrl;
      if (idFile) {
        docUrl = await storageService.uploadVerificationDoc(idFile);
        setUploadedDocUrl(docUrl);
      }

      await authService.signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.phone,
        formData.role,
        formData.muniId,
        formData.ward,
        formData.idNum || undefined,
        docUrl
      );

      navigate('/login');
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'Registration failed. Please check your details.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 flex items-center justify-center bg-slate-950 text-slate-100 px-4 relative">
      <div className="w-full max-w-lg bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-blue-500/10 rounded-xl text-blue-400 mb-2 border border-blue-500/20">
            <UserPlus className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">Create Citizen Account</h2>
          <p className="text-slate-400 text-xs mt-1">Smart City Problem Reporter Platform</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-xs flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Full Name</label>
              <input type="text" required placeholder="Ram Bahadur Thapa" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Phone Number</label>
              <input type="tel" required placeholder="98XXXXXXXX" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Email Address</label>
              <input type="email" required placeholder="ram@dang.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Password</label>
              <input type="password" required placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Municipality</label>
              <select value={formData.muniId} onChange={handleMuniChange} className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none">
                {MUNICIPALITIES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Ward Number</label>
              <select value={formData.ward} onChange={(e) => setFormData({ ...formData, ward: parseInt(e.target.value) })} className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none">
                {Array.from({ length: selectedMuni.wardCount }, (_, i) => i + 1).map(w => <option key={w} value={w}>Ward {w}</option>)}
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg space-y-2">
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Verification (Optional for Verifier Role)</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] uppercase text-slate-400">Citizenship/National ID #</label>
                <input type="text" placeholder="12-34-56-7890" value={formData.idNum} onChange={(e) => setFormData({ ...formData, idNum: e.target.value })} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-[9px] uppercase text-slate-400">Document Upload</label>
                <label className="mt-1 flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-800 border-dashed rounded-lg py-1.5 px-3 text-xs text-slate-400 hover:text-slate-200 cursor-pointer hover:border-blue-500/50 transition-colors">
                  {idFile ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Upload className="w-3.5 h-3.5 text-blue-400" />}
                  <span className="truncate">{idFile ? idFile.name : 'Select File'}</span>
                  <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer">
            {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : 'Register Account'}
          </button>
        </form>

        <div className="text-center mt-4 pt-4 border-t border-slate-800/60">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
