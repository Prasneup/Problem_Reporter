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
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          const profile = await authService.getProfile(session.user.id);
          setCurrentUser(profile);
          loadInitialData();
        } catch (err) {
          console.error('Initial session profile load failed:', err);
        }
      }
    };
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [loadInitialData, setCurrentUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/" element={<AppLayout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
