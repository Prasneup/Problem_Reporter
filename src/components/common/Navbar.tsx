import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useCivicStore } from '../../stores/civicStore';
import { Bell, Globe, Trophy, Award } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const { currentUser, notifications, dismissNotification } = useCivicStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const activeNotifications = notifications.filter(n => !n.isRead);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ne' : 'en');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-50 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-glow">
          D
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-100 leading-tight">
            {t('appName')}
          </h1>
          <p className="text-[10px] text-slate-400">Government of Nepal • Dang District</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {['Citizen', 'Community Verifier'].includes(currentUser.role) && (
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-inner">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <div className="text-left">
              <div className="text-[9px] text-slate-400 leading-none">Reputation Points</div>
              <div className="text-xs font-bold text-slate-200">{currentUser.reputationPoints} pts</div>
            </div>
            {currentUser.badgeIds.length > 0 && (
              <div className="flex items-center gap-0.5 border-l border-slate-700 pl-2 ml-1">
                <Award className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] font-semibold text-slate-300">
                  {currentUser.badgeIds.length} Badges
                </span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors font-medium text-slate-300"
        >
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span>{language === 'en' ? 'ENGLISH' : 'नेपाली'}</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {activeNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                {activeNotifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-slate-200">Alerts & Logs</h4>
                <span className="text-[9px] text-slate-500">{activeNotifications.length} unread</span>
              </div>
              <div className="space-y-2.5">
                {notifications.length === 0 ? (
                  <p className="text-[11px] text-slate-500 text-center py-4">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg border text-xs transition-colors ${
                        n.isRead 
                          ? 'bg-slate-950/30 border-slate-900/50 opacity-60' 
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-semibold ${n.type === 'success' ? 'text-emerald-400' : n.type === 'warning' ? 'text-amber-400' : 'text-blue-400'}`}>
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <button
                            onClick={() => dismissNotification(n.id)}
                            className="text-[9px] text-slate-400 hover:text-white"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                      <p className="text-slate-400 text-[10px] mt-1">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
