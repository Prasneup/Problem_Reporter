import { supabase } from '../lib/supabase';
import type { UserProfile, UserRole } from '../types';
import { MUNICIPALITIES } from '../constants/municipalities';

// Caches for DB mappings: name -> id
const municipalityIdCache: Record<string, string> = {};
const wardIdCache: Record<string, Record<number, string>> = {};

async function fetchDbMappings() {
  const { data: munis } = await supabase.from('municipalities').select('id, name');
  if (munis) {
    munis.forEach(m => {
      // Find constant key (e.g. "ghorahi" from "Ghorahi Sub-Metropolitan City")
      const matched = MUNICIPALITIES.find(item => item.name === m.name);
      if (matched) municipalityIdCache[matched.id] = m.id;
    });
  }

  const { data: wards } = await supabase.from('wards').select('id, municipality_id, ward_number');
  if (wards) {
    wards.forEach(w => {
      if (!wardIdCache[w.municipality_id]) {
        wardIdCache[w.municipality_id] = {};
      }
      wardIdCache[w.municipality_id][w.ward_number] = w.id;
    });
  }
}

export const authService = {
  async ensureMappings() {
    if (Object.keys(municipalityIdCache).length === 0) {
      await fetchDbMappings();
    }
  },

  getDbMuniId(localMuniId: string): string | undefined {
    return municipalityIdCache[localMuniId];
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
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      throw authError || new Error('Authentication failed.');
    }

    return await this.getProfile(authData.user.id);
  },

  async getProfile(userId: string): Promise<UserProfile> {
    await this.ensureMappings();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, municipalities(name), wards(ward_number)')
      .eq('id', userId)
      .single();

    if (error || !profile) {
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
    await supabase.auth.signOut();
  }
};

export default authService;
