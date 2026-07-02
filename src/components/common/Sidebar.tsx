import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useCivicStore } from '../../stores/civicStore';
import {
  LayoutDashboard, Database, ClipboardList,
  Settings, Users, BarChart3, AlertTriangle, Coins
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
    const common = [
      { id: 'transparency', label: t('openData') + ' (Public)', icon: Database },
    ];

    switch (role) {
      case 'Citizen':
        return [
          { id: 'citizen-dash', label: t('dashboard'), icon: LayoutDashboard },
          { id: 'report-form', label: 'Report New Issue', icon: AlertTriangle },
          { id: 'my-reports', label: 'My Reports', icon: ClipboardList },
          ...common
        ];
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
          { id: 'muni-budgets', label: 'Budget Tracker', icon: Coins },
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
          { id: 'super-audits', label: 'Audit Logs', icon: Settings },
          ...common
        ];
      default:
        return common;
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 pt-16 z-30">
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 px-3 mb-2">
          Navigation Portal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="flex justify-around text-[10px] text-blue-400">
          <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
          <span className="text-slate-700">•</span>
          <Link to="/contact" className="hover:underline">Contact Support</Link>
        </div>
        <button
          onClick={() => {
            // Trigger signout in background without blocking redirection
            signOut().catch((err) => console.error("Background signout error:", err));
            // Redirect immediately
            window.location.href = '/login';
          }}
          className="w-full text-center py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:border-red-900/50 text-red-400 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          Sign Out
        </button>
        <div className="text-[9px] text-slate-600 font-mono text-center">
          Dang District, Nepal v1.0.0
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
