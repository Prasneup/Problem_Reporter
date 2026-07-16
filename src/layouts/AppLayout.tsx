import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import DevPanel from '../components/common/DevPanel';
import { useCivicStore } from '../stores/civicStore';
import { MOCK_PROFILES } from '../stores/mockData';

// Main Sub-portals/Views
import CitizenPortal from '../pages/CitizenPortal';
import AdminPortal from '../pages/AdminPortal';
import OpenDataPortal from '../features/transparency/OpenDataPortal';

// Department Portals
import SanitationOfficerPortal from '../pages/SanitationOfficerPortal';
import RoadsOfficerPortal from '../pages/RoadsOfficerPortal';
import WaterOfficerPortal from '../pages/WaterOfficerPortal';
import DrainageOfficerPortal from '../pages/DrainageOfficerPortal';
import ElectricalOfficerPortal from '../pages/ElectricalOfficerPortal';
import TrafficPolicePortal from '../pages/TrafficPolicePortal';
import NepalPolicePortal from '../pages/NepalPolicePortal';
import FireOfficerPortal from '../pages/FireOfficerPortal';

export const AppLayout: React.FC = () => {
  const { currentUser, setCurrentUser } = useCivicStore();
  const role = currentUser.role;
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Check if there is an active mock session in sessionStorage
      const mockEmail = sessionStorage.getItem('mock_session_email');
      if (mockEmail) {
        const matchedProfile = Object.values(MOCK_PROFILES).find(
          (profile) => profile.email.toLowerCase() === mockEmail.toLowerCase()
        );
        if (matchedProfile) {
          if (currentUser.email.toLowerCase() !== matchedProfile.email.toLowerCase()) {
            setCurrentUser(matchedProfile);
          }
          return; // Skip supabase session check
        }
      }

      // 2. Or, if current user is not default citizen but is a mock user, persist to sessionStorage
      const isCurrentMockUser = Object.values(MOCK_PROFILES).some(
        (profile) => profile.email.toLowerCase() === currentUser.email.toLowerCase()
      );
      if (isCurrentMockUser && currentUser.email !== MOCK_PROFILES.citizen.email) {
        sessionStorage.setItem('mock_session_email', currentUser.email);
        return;
      }

      // 3. Otherwise, check Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
    };
    checkAuth();
  }, [currentUser, navigate, setCurrentUser]);

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
        switch (currentUser.department) {
          case 'Sanitation / Waste Management Mahashakha':
            return <SanitationOfficerPortal />;
          case 'Road & Infrastructure Division':
            return <RoadsOfficerPortal />;
          case 'Water Supply Department':
            return <WaterOfficerPortal />;
          case 'Drainage Department':
            return <DrainageOfficerPortal />;
          case 'Electrical Department':
            return <ElectricalOfficerPortal />;
          case 'Nepal Police / Traffic Police':
            return <TrafficPolicePortal />;
          case 'Nepal Police':
            return <NepalPolicePortal />;
          case 'Fire Response Department':
            return <FireOfficerPortal />;
          default:
            return <SanitationOfficerPortal />;
        }
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
