import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import DevPanel from '../components/common/DevPanel';
import { useCivicStore } from '../stores/civicStore';

// Main Sub-portals/Views
import CitizenPortal from '../pages/CitizenPortal';
import VerifierPortal from '../pages/VerifierPortal';
import InspectorPortal from '../pages/InspectorPortal';
import WardOfficerPortal from '../pages/WardOfficerPortal';
import MunicipalityPortal from '../pages/MunicipalityPortal';
import DistrictAdminPortal from '../pages/DistrictAdminPortal';
import SuperAdminPortal from '../pages/SuperAdminPortal';
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
      case 'Community Verifier': return 'verifier-dash';
      case 'Field Inspector': return 'inspector-dash';
      case 'Ward Officer': return 'ward-dash';
      case 'Municipality Officer': return 'muni-dash';
      case 'District Administrator': return 'district-dash';
      case 'Super Admin': return 'super-dash';
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
        return <CitizenPortal activeView={currentTab} />;
      case 'verifier-dash':
      case 'verifier-queue':
        return <VerifierPortal activeView={currentTab} />;
      case 'inspector-dash':
      case 'inspector-jobs':
        return <InspectorPortal activeView={currentTab} />;
      case 'ward-dash':
      case 'ward-inbox':
        return <WardOfficerPortal activeView={currentTab} />;
      case 'muni-dash':
      case 'muni-budgets':
        return <MunicipalityPortal activeView={currentTab} />;
      case 'district-dash':
      case 'district-analytics':
        return <DistrictAdminPortal activeView={currentTab} />;
      case 'super-dash':
      case 'super-users':
      case 'super-audits':
        return <SuperAdminPortal activeView={currentTab} />;
      case 'transparency':
      default:
        return <OpenDataPortal />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-blue-600/30">
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
