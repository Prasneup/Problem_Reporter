import { supabase } from '../lib/supabase';
import type { UserProfile, UserRole } from '../types';
import { MUNICIPALITIES } from '../constants/municipalities';
import { MOCK_PROFILES } from '../stores/mockData';

// Caches for DB mappings: name -> id
const municipalityIdCache: Record<string, string> = {};
const wardIdCache: Record<string, Record<number, string>> = {};
let mappingPromise: Promise<void> | null = null;

async function fetchDbMappings() {
  console.log("DEBUG: fetchDbMappings started");
  
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Database mapping request timed out')), 4000)
  );

  const fetchPromise = (async () => {
    const { data: munis, error: muniError } = await supabase.from('municipalities').select('id, name');
    if (muniError) {
      console.error("DEBUG: fetchDbMappings municipalities query error:", muniError);
    }
    if (munis) {
      munis.forEach(m => {
        // Find constant key (e.g. "ghorahi" from "Ghorahi Sub-Metropolitan City")
        const matched = MUNICIPALITIES.find(item => item.name === m.name);
        if (matched) municipalityIdCache[matched.id] = m.id;
      });
    }

    const { data: wards, error: wardError } = await supabase.from('wards').select('id, municipality_id, ward_number');
    if (wardError) {
      console.error("DEBUG: fetchDbMappings wards query error:", wardError);
    }
    if (wards) {
      wards.forEach(w => {
        if (!wardIdCache[w.municipality_id]) {
          wardIdCache[w.municipality_id] = {};
        }
        wardIdCache[w.municipality_id][w.ward_number] = w.id;
      });
    }
  })();

  try {
    await Promise.race([fetchPromise, timeoutPromise]);
    console.log("DEBUG: fetchDbMappings completed successfully");
  } catch (err) {
    console.warn("DEBUG: fetchDbMappings failed or timed out. Falling back to local mock mappings:", err);
    // Populate with mock mappings so the app doesn't break
    MUNICIPALITIES.forEach(m => {
      municipalityIdCache[m.id] = `mock-muni-uuid-${m.id}`;
    });
    MUNICIPALITIES.forEach(m => {
      const muniUuid = `mock-muni-uuid-${m.id}`;
      wardIdCache[muniUuid] = {};
      for (let i = 1; i <= 19; i++) {
        wardIdCache[muniUuid][i] = `mock-ward-uuid-${m.id}-${i}`;
      }
    });
  }
}

export const authService = {
  async ensureMappings() {
    if (Object.keys(municipalityIdCache).length > 0) return;

    if (mappingPromise) {
      console.log("DEBUG: ensureMappings waiting on existing in-flight mappingPromise");
      return mappingPromise;
    }

    console.log("DEBUG: ensureMappings starting new mappingPromise");
    mappingPromise = fetchDbMappings().catch(err => {
      console.error("DEBUG: fetchDbMappings failed:", err);
      mappingPromise = null;
      throw err;
    });

    return mappingPromise;
  },

  getDbMuniId(localMuniId: string): string | undefined {
    return municipalityIdCache[localMuniId.toLowerCase()];
  },

  getDbWardId(dbMuniId: string, wardNumber: number): string | undefined {
    return wardIdCache[dbMuniId]?.[wardNumber];
  },

  getLocalMuniId(dbMuniId: string): string | undefined {
    return Object.keys(municipalityIdCache).find(key => municipalityIdCache[key] === dbMuniId);
  },

  getLocalWardNumber(dbMuniId: string, dbWardId: string): number | undefined {
    const wardMap = wardIdCache[dbMuniId];
    if (!wardMap) return undefined;
    const foundKey = Object.keys(wardMap).find(key => wardMap[Number(key)] === dbWardId);
    return foundKey ? Number(foundKey) : undefined;
  },

  getLocalWardDetails(dbWardId: string): { localMuniId: string; wardNumber: number } | undefined {
    for (const dbMuniId of Object.keys(wardIdCache)) {
      const wardMap = wardIdCache[dbMuniId];
      const foundKey = Object.keys(wardMap).find(key => wardMap[Number(key)] === dbWardId);
      if (foundKey) {
        const localMuniId = this.getLocalMuniId(dbMuniId);
        if (localMuniId) {
          return {
            localMuniId,
            wardNumber: Number(foundKey)
          };
        }
      }
    }
    return undefined;
  },

  async checkEmailExists(email: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error('Email check failed:', error);
      return false;
    }
    return !!data;
  },

  async signUp(
    email: string,
    password: string,
    name: string,
    phone: string,
    role: UserRole,
    localMuniId: string,
    wardNumber: number,
    citizenshipNumber?: string,
    citizenshipUrl?: string
  ): Promise<UserProfile> {
    await this.ensureMappings();

    // Check duplicate email first
    const exists = await this.checkEmailExists(email);
    if (exists) {
      throw new Error('Email address is already registered.');
    }

    const dbMuniId = this.getDbMuniId(localMuniId);
    const dbWardId = dbMuniId ? this.getDbWardId(dbMuniId, wardNumber) : undefined;

    // Sign up via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          role,
          citizenship_number: citizenshipNumber,
          citizenship_url: citizenshipUrl
        }
      }
    });

    console.log("AUTH DATA FULL:", JSON.stringify(authData, null, 2));
    console.log("AUTH ERROR:", authError);

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error("No user returned from Supabase");
    }

    // Explicitly create user profile row since database trigger might not be set
    const profileRow = {
      id: authData.user.id,
      name,
      email: email.toLowerCase(),
      phone,
      role,
      municipality_id: dbMuniId || null,
      ward_id: dbWardId || null,
      reputation_points: 0,
      badge_ids: []
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert(profileRow);

    if (profileError) {
      console.error('Error inserting user profile:', profileError);
    }

    return {
      id: authData.user.id,
      name,
      email,
      phone,
      role,
      municipalityId: localMuniId,
      wardId: wardNumber,
      reputationPoints: 0,
      badgeIds: [],
      createdAt: new Date().toISOString()
    };
  },

  async signIn(email: string, password: string): Promise<UserProfile> {
    console.log("DEBUG: signIn started for:", email);

    // Check if it's a mock user for sandbox/offline bypass
    const mockKey = Object.keys(MOCK_PROFILES).find(
      (key) => MOCK_PROFILES[key].email.toLowerCase() === email.toLowerCase()
    );
    if (mockKey) {
      console.log("DEBUG: Mock user bypass triggered for:", email);
      sessionStorage.setItem('mock_session_email', email);
      // Wait 500ms to simulate API latency
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_PROFILES[mockKey];
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    console.log("DEBUG: signInWithPassword resolved:", JSON.stringify({ authData, authError }, null, 2));

    if (authError || !authData.user) {
      throw authError || new Error('Authentication failed.');
    }

    console.log("DEBUG: calling getProfile for user:", authData.user.id);
    return await this.getProfile(authData.user.id);
  },

  async getProfile(userId: string): Promise<UserProfile> {
    console.log("DEBUG: getProfile started for user ID:", userId);
    await this.ensureMappings();
    console.log("DEBUG: ensureMappings completed inside getProfile");

    console.log("DEBUG: fetching profiles row from database for user ID:", userId);
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, municipalities(name), wards(ward_number)')
      .eq('id', userId)
      .single();
    console.log("DEBUG: profiles query returned:", JSON.stringify({ profile, error }, null, 2));

    if (error || !profile) {
      if (error && (error.code === 'PGRST116' || error.message?.includes('0 rows'))) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const fallbackProfile = {
              id: userId,
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'Citizen',
              email: user.email || '',
              phone: user.user_metadata?.phone || '',
              role: user.user_metadata?.role || 'Citizen',
              municipality_id: null,
              ward_id: null,
              reputation_points: 0,
              badge_ids: []
            };

            const { error: insertErr } = await supabase.from('profiles').insert(fallbackProfile);
            if (!insertErr) {
              return {
                id: userId,
                name: fallbackProfile.name,
                email: fallbackProfile.email,
                phone: fallbackProfile.phone,
                role: fallbackProfile.role as UserRole,
                municipalityId: undefined,
                wardId: undefined,
                reputationPoints: 0,
                badgeIds: [],
                createdAt: new Date().toISOString()
              };
            } else {
              console.error('Insert fallback profile error:', insertErr);
            }
          }
        } catch (createErr) {
          console.error('Failed to auto-create fallback profile:', createErr);
        }
      }
      throw error || new Error('Profile not found.');
    }

    const localMuniId = profile.municipality_id ? this.getLocalMuniId(profile.municipality_id) : undefined;
    const wardNumber = profile.wards?.ward_number || undefined;

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      role: profile.role as UserRole,
      municipalityId: localMuniId,
      wardId: wardNumber,
      reputationPoints: profile.reputation_points || 0,
      badgeIds: profile.badge_ids || [],
      createdAt: profile.created_at
    };
  },

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
  },

  async signOut(): Promise<void> {
    sessionStorage.removeItem('mock_session_email');
    await supabase.auth.signOut();
  }
};

export default authService;
