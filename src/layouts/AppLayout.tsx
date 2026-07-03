import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import DevPanel from '../components/common/DevPanel';
import { useCivicStore } from '../stores/civicStore';

// Main Sub-portals/Views
import CitizenPortal from '../pages/CitizenPortal';
import AdminPortal from '../pages/AdminPortal';
import DepartmentPortal from '../pages/DepartmentPortal';
import OpenDataPortal from '../features/transparency/OpenDataPortal';

export const AppLayout: React.FC = () => {
  const { currentUser } = useCivicStore();
  const role = currentUser.role;
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
    };
    checkAuth();
  }, [currentUser, navigate]);

  const getInitialTab = (userRole: string) => {
    switch (userRole) {
      case 'Citizen': return 'citizen-dash';
      case 'Admin': return 'admin-dash';
      case 'Department Officer': return 'dept-dash';
      default: return 'transparency';
    }
  };

  const [prevRole, setPrevRole] = useState(role);
  const [currentTab, setCurrentTab] = useState(() => getInitialTab(role));

  if (role !== prevRole) {
    setPrevRole(role);
    setCurrentTab(getInitialTab(role));
  }

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'citizen-dash':
      case 'report-form':
      case 'my-reports':
      case 'active-reports':
      case 'alerts':
      case 'map-view':
      case 'statistics':
      case 'community':
      case 'profile':
      case 'help':
        return <CitizenPortal activeView={currentTab} setCurrentTab={setCurrentTab} />;
      case 'admin-dash':
        return <AdminPortal />;
      case 'dept-dash':
        return <DepartmentPortal />;
      case 'transparency':
      default:
        return <OpenDataPortal />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600/30">
      <Navbar />
      <div className="flex flex-1 pt-16">
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
        <main className="flex-1 ml-64 p-6 pb-24 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderActiveTab()}
          </div>
        </main>
      </div>
      <DevPanel />
    </div>
  );
};

export default AppLayout;
