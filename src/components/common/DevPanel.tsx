import React from 'react';
import { useCivicStore } from '../../stores/civicStore';
import { MOCK_PROFILES } from '../../stores/mockData';
import { Wifi, WifiOff, UserCheck, RotateCcw, Shield } from 'lucide-react';

export const DevPanel: React.FC = () => {
  const { currentUser, setCurrentUser, isOnline, setOnlineStatus } = useCivicStore();

  const mockUsers = [
    { key: 'citizen', label: `Citizen (${currentUser.role === 'Citizen' ? currentUser.name : 'Yogesh Pulami'})` },
    { key: 'admin', label: `Admin (${currentUser.role === 'Admin' ? currentUser.name : 'Ghorahi Admin'})` },
    { key: 'sanitation_officer', label: `Sanitation Officer (${currentUser.department === 'Sanitation / Waste Management Mahashakha' ? currentUser.name : 'Ramesh Chaudhary'})` },
    { key: 'roads_officer', label: `Roads Officer (${currentUser.department === 'Road & Infrastructure Division' ? currentUser.name : 'Binod Bhandari'})` },
    { key: 'water_officer', label: `Water Officer (${currentUser.department === 'Water Supply Department' ? currentUser.name : 'Krishna Raj Oli'})` },
    { key: 'drainage_officer', label: `Drainage Officer (${currentUser.department === 'Drainage Department' ? currentUser.name : 'Sita Dahal'})` },
    { key: 'electrical_officer', label: `Electrical Officer (${currentUser.department === 'Electrical Department' ? currentUser.name : 'Madan Shrestha'})` },
    { key: 'police_officer', label: `Traffic Police Officer (${currentUser.department === 'Nepal Police / Traffic Police' ? currentUser.name : 'Inspector Thapa'})` },
    { key: 'safety_officer', label: `Nepal Police Officer (${currentUser.department === 'Nepal Police' ? currentUser.name : 'DSP KC'})` },
    { key: 'fire_officer', label: `Fire Officer (${currentUser.department === 'Fire Response Department' ? currentUser.name : 'Fire Chief Basnet'})` }
  ];

  const handleReset = () => {
    localStorage.removeItem('dang-smart-city-store');
    localStorage.removeItem('dang-smart-city-suggestions');
    window.location.reload();
  };

  const getActiveUserKey = () => {
    const found = Object.keys(MOCK_PROFILES).find(
      key => MOCK_PROFILES[key].email === currentUser.email
    );
    return found || 'citizen';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-slate-200 text-slate-700 px-4 py-2 flex flex-wrap items-center justify-between gap-4 shadow-lg font-sans">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-blue-600 animate-pulse" />
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Dev Sandbox:</span>
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2 py-1 select-none font-bold text-slate-800">
          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[10px] truncate max-w-[180px]">
            {currentUser.name} ({currentUser.role})
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Quick Switch Account:</span>
        <select
          value={getActiveUserKey()}
          onChange={(e) => {
            const profile = MOCK_PROFILES[e.target.value];
            if (profile) {
              sessionStorage.setItem('mock_session_email', profile.email);
              setCurrentUser(profile);
            }
          }}
          className="bg-slate-50 border border-slate-200 text-[10px] rounded px-2.5 py-1 text-slate-700 font-bold focus:outline-none focus:border-blue-500 transition-colors"
        >
          {mockUsers.map((u) => (
            <option key={u.key} value={u.key}>
              {u.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => setOnlineStatus(!isOnline)}
          className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded transition-all duration-200 cursor-pointer ${isOnline
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-600'
              : 'bg-rose-50 border border-rose-200 text-rose-600'
            }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span>Online Mode</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 animate-bounce" />
              <span>Offline Mode</span>
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          title="Reset local changes"
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-[10px] font-bold rounded px-2.5 py-1.5 transition-colors text-slate-600 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Db</span>
        </button>
      </div>
    </div>
  );
};
export default DevPanel;
