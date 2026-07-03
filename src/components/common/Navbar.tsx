import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useCivicStore } from '../../stores/civicStore';
import { Bell, Globe, ChevronDown, Search } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const { currentUser, notifications, dismissNotification, signOut } = useCivicStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const activeNotifications = notifications.filter(n => !n.isRead);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ne' : 'en');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 z-50 shadow-sm font-sans">
      {/* Brand & Emblems */}
      <div className="flex items-center gap-3">
        {/* Nepal Flag SVG */}
        <svg viewBox="0 0 24 30" className="w-5 h-6.5 flex-shrink-0 select-none">
          <path d="M0,0 L0,30 L3,30 L3,27.3 L21,16.5 L7.5,13.5 L24,4.5 Z" fill="#DC2626" stroke="#1E3A8A" strokeWidth="1.5" />
          <circle cx="6" cy="8" r="2" fill="#FFFFFF" />
          <circle cx="6" cy="20" r="3.2" fill="#FFFFFF" />
        </svg>

        {/* Nepal Government Emblem SVG */}
        <svg viewBox="0 0 40 40" className="w-8 h-8 flex-shrink-0 select-none">
          <circle cx="20" cy="20" r="18" fill="#1E3A8A" />
          <circle cx="20" cy="20" r="16" fill="#FFFFFF" />
          <circle cx="20" cy="20" r="15" fill="#DC2626" />
          <path d="M10,24 Q20,12 30,24" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
          <circle cx="20" cy="18" r="3.5" fill="#FFFFFF" />
          <path d="M14,28 L26,28 Q20,32 14,28" fill="#FFFFFF" />
        </svg>

        <div className="hidden sm:block">
          <h1 className="text-sm font-bold text-slate-800 leading-tight">
            {t('appName')}
          </h1>
          <p className="text-[10px] text-slate-500 font-bold tracking-wide">{t('subhead')}</p>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="flex-1 max-w-md mx-8 relative hidden md:block">
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="w-3.5 h-3.5 text-slate-400" />
        </span>
        <input
          type="text"
          placeholder="Search issues, reports, locations..."
          className="w-full bg-slate-100/70 border border-slate-200 rounded-lg py-1.5 pl-9 pr-3.5 text-[11px] text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Language switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'नेपाली' : 'English'}</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg text-slate-600 transition-colors relative cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            {activeNotifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                {activeNotifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-[-12px] sm:right-0 mt-3 w-[calc(100vw-2.5rem)] sm:w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-50 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Alerts & Logs</h4>
                <span className="text-[9px] text-slate-400 font-semibold">{activeNotifications.length} unread</span>
              </div>
              <div className="space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-[10px] text-slate-400 text-center py-4">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg border text-[10px] transition-colors leading-relaxed ${n.isRead
                          ? 'bg-slate-50/50 border-slate-100 text-slate-400'
                          : 'bg-blue-50/20 border-blue-100 text-slate-700 hover:bg-blue-50/40'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-bold ${n.type === 'success' ? 'text-emerald-600' : n.type === 'warning' ? 'text-amber-600' : 'text-blue-600'}`}>
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <button
                            onClick={() => dismissNotification(n.id)}
                            className="text-[8px] text-slate-400 hover:text-slate-600 underline font-semibold"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                      <p className="text-slate-500 mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 border-l border-slate-200 pl-3 focus:outline-none cursor-pointer group"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60"
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 group-hover:border-blue-500 transition-colors"
            />
            <div className="text-left hidden lg:block select-none">
              <div className="text-xs font-bold text-slate-700 leading-tight group-hover:text-blue-600 transition-colors">{currentUser.name}</div>
              <div className="text-[9px] text-slate-450 leading-none font-bold mt-0.5">{currentUser.role}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block group-hover:text-slate-650 transition-colors" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 font-bold text-xs text-slate-650">
              <div className="px-3 py-2 border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider select-none">
                Logged in Account
              </div>
              <div className="px-3 py-2 text-slate-800 truncate">
                {currentUser.name}
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  signOut();
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50/50 transition-colors cursor-pointer mt-1"
              >
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
