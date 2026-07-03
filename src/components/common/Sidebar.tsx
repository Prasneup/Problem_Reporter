import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useCivicStore } from '../../stores/civicStore';
import {
  LayoutDashboard, ClipboardList, AlertTriangle, Bell, Map,
  BarChart3, Users, User, HelpCircle, LogOut, CheckSquare
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { t } = useTranslation();
  const { currentUser, signOut } = useCivicStore();
  const role = currentUser.role;

  const getNavItems = () => {
    if (role === 'Citizen') {
      return [
        { id: 'citizen-dash', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'report-form', label: 'Report an Issue', icon: AlertTriangle },
        { id: 'my-reports', label: 'My Reports', icon: ClipboardList },
        { id: 'active-reports', label: 'Active Reports', icon: CheckSquare },
        { id: 'alerts', label: 'Alerts & Updates', icon: Bell },
        { id: 'map-view', label: 'Map View', icon: Map },
        { id: 'statistics', label: 'Statistics', icon: BarChart3 },
        { id: 'community', label: 'Community', icon: Users },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'help', label: 'Help & Support', icon: HelpCircle }
      ];
    }

    if (role === 'Admin') {
      return [
        { id: 'admin-dash', label: 'Admin Dashboard', icon: LayoutDashboard },
        { id: 'transparency', label: t('openData') + ' (Public)', icon: Map }
      ];
    }

    if (role === 'Department Officer') {
      return [
        { id: 'dept-dash', label: 'Mahashakha Dashboard', icon: LayoutDashboard },
        { id: 'transparency', label: t('openData') + ' (Public)', icon: Map }
      ];
    }

    return [{ id: 'transparency', label: t('openData') + ' (Public)', icon: Map }];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col h-screen fixed left-0 top-0 pt-16 pb-14 z-30 font-sans">
      <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${isActive
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100 select-none">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50/50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-550 text-rose-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
