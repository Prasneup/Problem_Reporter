import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Contact from './pages/Contact';
import { useCivicStore } from './stores/civicStore';
import { supabase } from './lib/supabase';
import authService from './services/authService';
import { MOCK_PROFILES } from './stores/mockData';

function App() {
  const { loadInitialData, setCurrentUser } = useCivicStore();

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setTimeout(async () => {
            try {
              const profile = await authService.getProfile(session.user.id);
              // Align sandbox profile ID with real Supabase UUID to prevent filtering mismatches
              MOCK_PROFILES.citizen.id = session.user.id;
              MOCK_PROFILES.citizen.name = profile.name;
              MOCK_PROFILES.citizen.email = profile.email;
              MOCK_PROFILES.citizen.phone = profile.phone;

              setCurrentUser(profile);
              loadInitialData();
            } catch (err) {
              console.error('Failed to load user profile on auth change:', err);
            }
          }, 0);
        }
      }
    );

    // Initial check
    const checkSession = async () => {
      try {
        const getSessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) =>
          setTimeout(() => resolve({ data: { session: null } }), 4000)
        );
        const { data: { session } } = await Promise.race([getSessionPromise, timeoutPromise]);

        if (session?.user) {
          try {
            const profile = await authService.getProfile(session.user.id);
            // Align sandbox profile ID with real Supabase UUID to prevent filtering mismatches
            MOCK_PROFILES.citizen.id = session.user.id;
            MOCK_PROFILES.citizen.name = profile.name;
            MOCK_PROFILES.citizen.email = profile.email;
            MOCK_PROFILES.citizen.phone = profile.phone;

            setCurrentUser(profile);
            loadInitialData();
          } catch (err) {
            console.error('Initial session profile load failed:', err);
          }
        }
      } catch (err) {
        console.error('Initial checkSession failed:', err);
      }
    };
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [loadInitialData, setCurrentUser]);

  // Real-time polling to fetch updates from database (optimized to 45 seconds to prevent page lag)
  useEffect(() => {
    const pollInterval = setInterval(() => {
      loadInitialData();
    }, 45000);

    return () => clearInterval(pollInterval);
  }, [loadInitialData]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/app/*" element={<AppLayout />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
