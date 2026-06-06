import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Loader } from 'lucide-react';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 relative">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        <div className="md:col-span-1 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Get in Touch</h1>
            <p className="text-slate-400 text-xs mt-1">Have queries? Reach out to our municipal support desk.</p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-blue-400 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Email Address</div>
                <div className="text-xs text-slate-200 mt-0.5">support@dang.gov.np</div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-blue-400 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Phone Support</div>
                <div className="text-xs text-slate-200 mt-0.5">+977-082-560123</div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-blue-400 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">District Office</div>
                <div className="text-xs text-slate-200 mt-0.5">District Administration Office, Ghorahi, Dang, Nepal</div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <CheckCircle className="w-10 h-10 text-green-400" />
              <h3 className="text-base font-bold text-white">Message Transmitted Successfully</h3>
              <p className="text-slate-400 text-xs max-w-sm">Thank you. Your inquiry has been registered in our admin logs. We will get back to you shortly.</p>
              <button onClick={() => setSubmitted(false)} className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-1.5 px-4 rounded-lg text-xs mt-2 transition-colors">Submit Another Query</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Your Name</label>
                  <input type="text" required placeholder="Ram Bahadur Thapa" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Email Address</label>
                  <input type="email" required placeholder="ram@dang.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Subject</label>
                <input type="text" required placeholder="E.g. Support for Citizen Portal Login" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Message / Inquiry Details</label>
                <textarea required placeholder="Write your message here..." rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none" />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-glow cursor-pointer">
                {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Send Message</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
