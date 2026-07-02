import React from 'react';
import { Link } from 'react-router-dom';
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
    // Standard dashboard links based on Bhoju Chaudhary (Citizen) user experience shown in screenshot
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

    // Nav items fallback for other administrative roles
    const common = [{ id: 'transparency', label: t('openData') + ' (Public)', icon: Map }];
    switch (role) {
      case 'Community Verifier':
        return [
          { id: 'verifier-dash', label: 'Verifier Dashboard', icon: LayoutDashboard },
          { id: 'verifier-queue', label: 'Verification Queue', icon: ClipboardList },
          ...common
        ];
      case 'Field Inspector':
        return [
          { id: 'inspector-dash', label: 'Inspector Dashboard', icon: LayoutDashboard },
          { id: 'inspector-jobs', label: 'My Assignments', icon: ClipboardList },
          ...common
        ];
      case 'Ward Officer':
        return [
          { id: 'ward-dash', label: 'Ward Dashboard', icon: LayoutDashboard },
          { id: 'ward-inbox', label: 'Reports Queue', icon: ClipboardList },
          ...common
        ];
      case 'Municipality Officer':
        return [
          { id: 'muni-dash', label: 'Muni Dashboard', icon: LayoutDashboard },
          { id: 'muni-budgets', label: 'Budget Tracker', icon: BarChart3 },
          ...common
        ];
      case 'District Administrator':
        return [
          { id: 'district-dash', label: 'District Overview', icon: LayoutDashboard },
          { id: 'district-analytics', label: t('analytics'), icon: BarChart3 },
          ...common
        ];
      case 'Super Admin':
        return [
          { id: 'super-dash', label: 'Admin Dashboard', icon: LayoutDashboard },
          { id: 'super-users', label: 'Manage Users', icon: Users },
          ...common
        ];
      default:
        return common;
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col h-screen fixed left-0 top-0 pt-16 z-30 font-sans">
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

      <div className="p-4 border-t border-slate-100 space-y-2">
        <div className="flex justify-around text-[10px] font-semibold text-blue-500">
          <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
          <span className="text-slate-300">•</span>
          <Link to="/contact" className="hover:underline">Contact Support</Link>
        </div>
        <button
          onClick={() => {
            signOut().catch((err) => console.error("Background signout error:", err));
            window.location.href = '/login';
          }}
          className="w-full text-center py-2 bg-rose-50 hover:bg-rose-100/80 border border-rose-100 text-rose-600 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
        <div className="text-[9px] text-slate-400 font-mono text-center font-semibold">
          Ghorahi, Dang District, Nepal
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
