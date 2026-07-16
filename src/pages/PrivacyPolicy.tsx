import React from 'react';
import { Shield, MapPin, Eye, Lock, FileText } from 'lucide-react';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-10 space-y-8">
        <div className="text-center pb-6 border-b border-slate-800/80">
          <div className="inline-flex p-3 bg-blue-500/10 rounded-xl text-blue-400 mb-3 border border-blue-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Privacy Policy</h1>
          <p className="text-slate-400 text-xs mt-1">Dang District Smart City Problem Reporter Portal</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            1. GPS Coordinates & Location Tracking
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed pl-6">
            To report local infrastructure problems accurately, our platform utilizes GPS coordinates. Location tracking is active only when you choose to use your current location or mark a spot on the interactive Leaflet map. Location data is stored alongside your report details to help ward officers and inspectors find and resolve the issue.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            2. Citizens' Personal Data & Identity Uploads
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed pl-6">
            For roles requiring civic trust (such as Community Verifiers), we collect optional National ID or Citizenship numbers and images of the document. These documents are stored securely in protected storage folders. They are used exclusively by District Administrators to confirm citizen identities and prevent fraudulent submissions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            3. Data Sharing & Municipality Officers
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed pl-6">
            Reports submitted on the platform are visible to the general public, including the title, description, category, and address. However, your email address, phone number, and verification documents are hidden and restricted under Row Level Security (RLS) to municipal officers, ward administrators, and inspectors.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            4. Audit Logging & Verification Logs
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed pl-6">
            All reports, status updates, comments, and inspection assignments are logged for compliance and security. Whenever a municipality or ward officer edits report statuses or allocates budget, an entry is added to verification logs and audit logs to ensure total transparency.
          </p>
        </section>

        <div className="text-center pt-6 border-t border-slate-800/80 text-[10px] text-slate-500">
          Last updated: June 6, 2026. For questions, please contact our support team.
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
