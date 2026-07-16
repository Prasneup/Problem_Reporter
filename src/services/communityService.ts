import { supabase } from '../lib/supabase';

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  upvotes: number;
  author: string;
  authorId?: string;
  date: string;
  liked: boolean;
  comments: string[];
}

export interface LeaderboardUser {
  name: string;
  resolvedCount: number;
  reputation: number;
  avatar: string;
  isMe?: boolean;
}

// Local mock storage fallback
const LOCAL_STORAGE_KEY = 'dang-smart-city-suggestions';
const LIKED_KEY_PREFIX = 'dang-smart-city-liked-';

const MOCK_SUGGESTIONS: Suggestion[] = [
  { id: '1', title: 'Install Community Trash Bin', description: 'Request to install a communal waste bin near the main square of Ward 15 to prevent roadside garbage dumping.', category: 'Sanitation', upvotes: 18, author: 'Sunita Bista', date: 'Jul 8, 2026', liked: false, comments: ['Great idea, need this urgently!', 'Let ward office coordinate this.'] },
  { id: '2', title: 'Street Light Timing Adjustment', description: 'Adjust the automated timing for street lights in Ward 10. They turn on too late during the summer season.', category: 'Electricity', upvotes: 12, author: 'Hari Poudel', date: 'Jul 9, 2026', liked: false, comments: [] },
  { id: '3', title: 'Clean Water Station in Ghorahi Park', description: 'Introduce a solar-powered public drinking water station in the central municipality park.', category: 'Water Supply', upvotes: 24, author: 'Maya Shrestha', date: 'Jul 10, 2026', liked: false, comments: ['This would benefit so many visitors.'] }
];

function getLocalSuggestions(): Suggestion[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(MOCK_SUGGESTIONS));
    return MOCK_SUGGESTIONS;
  }
  return JSON.parse(stored);
}

function saveLocalSuggestions(list: Suggestion[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
}

export const communityService = {
  async fetchSuggestions(userId?: string): Promise<Suggestion[]> {
    try {
      // 1. Fetch suggestions from Supabase
      const { data: dbSuggestions, error } = await supabase
        .from('community_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!dbSuggestions || dbSuggestions.length === 0) {
        return getLocalSuggestions();
      }

      // 2. Fetch upvotes for current user to set liked status
      let likedIds: string[] = [];
      if (userId) {
        const { data: votes } = await supabase
          .from('community_upvotes')
          .select('suggestion_id')
          .eq('user_id', userId);
        if (votes) {
          likedIds = votes.map(v => v.suggestion_id);
        }
      }

      return dbSuggestions.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description,
        category: s.category,
        upvotes: s.upvotes,
        author: s.author_name,
        authorId: s.author_id,
        date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        liked: likedIds.includes(s.id),
        comments: []
      }));
    } catch (err) {
      console.warn("communityService.fetchSuggestions falling back to local storage:", err);
      const localList = getLocalSuggestions();
      if (userId) {
        // Read liked states from localStorage
        return localList.map(s => {
          const likedLocal = localStorage.getItem(`${LIKED_KEY_PREFIX}${userId}-${s.id}`) === 'true';
          return { ...s, liked: likedLocal };
        });
      }
      return localList;
    }
  },

  async createSuggestion(
    title: string,
    description: string,
    category: string,
    authorName: string,
    authorId: string
  ): Promise<Suggestion> {
    try {
      const { data, error } = await supabase
        .from('community_suggestions')
        .insert({
          title,
          description,
          category,
          author_name: authorName,
          author_id: authorId,
          upvotes: 1
        })
        .select()
        .single();

      if (error) throw error;

      // Automatically add an upvote for the author
      await supabase.from('community_upvotes').insert({
        suggestion_id: data.id,
        user_id: authorId
      });

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        upvotes: 1,
        author: data.author_name,
        authorId: data.author_id,
        date: 'Just Now',
        liked: true,
        comments: []
      };
    } catch (err) {
      console.warn("communityService.createSuggestion falling back to local storage:", err);
      const localList = getLocalSuggestions();
      const newSuggest: Suggestion = {
        id: Date.now().toString(),
        title,
        description,
        category,
        upvotes: 1,
        author: authorName,
        authorId,
        date: 'Just Now',
        liked: true,
        comments: []
      };
      saveLocalSuggestions([newSuggest, ...localList]);
      if (authorId) {
        localStorage.setItem(`${LIKED_KEY_PREFIX}${authorId}-${newSuggest.id}`, 'true');
      }
      return newSuggest;
    }
  },

  async toggleUpvote(suggestionId: string, userId: string, hasLiked: boolean): Promise<{ upvotes: number; liked: boolean }> {
    try {
      if (hasLiked) {
        // Remove upvote
        const { error: deleteVoteError } = await supabase
          .from('community_upvotes')
          .delete()
          .match({ suggestion_id: suggestionId, user_id: userId });

        if (deleteVoteError) throw deleteVoteError;

        // Fetch current upvotes
        const { data: suggestion } = await supabase
          .from('community_suggestions')
          .select('upvotes')
          .eq('id', suggestionId)
          .single();

        const newCount = Math.max(0, (suggestion?.upvotes || 1) - 1);
        await supabase
          .from('community_suggestions')
          .update({ upvotes: newCount })
          .eq('id', suggestionId);

        return { upvotes: newCount, liked: false };
      } else {
        // Add upvote
        const { error: insertVoteError } = await supabase
          .from('community_upvotes')
          .insert({ suggestion_id: suggestionId, user_id: userId });

        if (insertVoteError) throw insertVoteError;

        // Fetch current upvotes
        const { data: suggestion } = await supabase
          .from('community_suggestions')
          .select('upvotes')
          .eq('id', suggestionId)
          .single();

        const newCount = (suggestion?.upvotes || 0) + 1;
        await supabase
          .from('community_suggestions')
          .update({ upvotes: newCount })
          .eq('id', suggestionId);

        return { upvotes: newCount, liked: true };
      }
    } catch (err) {
      console.warn("communityService.toggleUpvote falling back to local storage:", err);
      const localList = getLocalSuggestions();
      let newCount = 0;
      const updatedList = localList.map(s => {
        if (s.id === suggestionId) {
          const nextLiked = !hasLiked;
          const diff = nextLiked ? 1 : -1;
          newCount = Math.max(0, s.upvotes + diff);
          localStorage.setItem(`${LIKED_KEY_PREFIX}${userId}-${suggestionId}`, nextLiked ? 'true' : 'false');
          return { ...s, upvotes: newCount, liked: nextLiked };
        }
        return s;
      });
      saveLocalSuggestions(updatedList);
      return { upvotes: newCount, liked: !hasLiked };
    }
  },

  async fetchLeaderboard(currentUserName: string, resolvedCount: number): Promise<LeaderboardUser[]> {
    try {
      // 1. Fetch citizen profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('role', 'Citizen');

      if (profileError) throw profileError;

      // 2. Fetch all resolved reports
      const { data: reports, error: reportError } = await supabase
        .from('reports')
        .select('reporter_id')
        .eq('status', 'Resolved');

      if (reportError) throw reportError;

      // 3. Count resolved reports per citizen
      const resolutionCounts: Record<string, number> = {};
      if (reports) {
        reports.forEach(r => {
          if (r.reporter_id) {
            resolutionCounts[r.reporter_id] = (resolutionCounts[r.reporter_id] || 0) + 1;
          }
        });
      }

      // 4. Map profiles to leaderboard records
      const users: LeaderboardUser[] = (profiles || []).map(p => {
        const count = resolutionCounts[p.id] || 0;
        const initials = p.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        return {
          name: p.name,
          resolvedCount: count,
          reputation: count * 20, // 20 points per resolved issue
          avatar: initials || 'C'
        };
      });

      // Insert/Ensure our current user is in the list with calculated points
      const hasMe = users.some(u => u.name.toLowerCase() === currentUserName.toLowerCase());
      if (!hasMe) {
        const meInitials = currentUserName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        users.push({
          name: currentUserName,
          resolvedCount: resolvedCount,
          reputation: resolvedCount * 20,
          avatar: meInitials || 'YP',
          isMe: true
        });
      } else {
        users.forEach(u => {
          if (u.name.toLowerCase() === currentUserName.toLowerCase()) {
            u.isMe = true;
            u.resolvedCount = resolvedCount;
            u.reputation = resolvedCount * 20;
          }
        });
      }

      // Sort and pick top 5
      return users
        .sort((a, b) => b.reputation - a.reputation)
        .slice(0, 5);
    } catch (err) {
      console.warn("communityService.fetchLeaderboard falling back to mock:", err);
      
      const initials = currentUserName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
      
      const mockList: LeaderboardUser[] = [
        { name: 'Ramesh Dahal', resolvedCount: 14, reputation: 280, avatar: 'RD' },
        { name: 'Sunita Bista', resolvedCount: 11, reputation: 220, avatar: 'SB' },
        { name: currentUserName, resolvedCount: resolvedCount, reputation: resolvedCount * 20, avatar: initials || 'YP', isMe: true },
        { name: 'Hari Poudel', resolvedCount: 4, reputation: 80, avatar: 'HP' },
        { name: 'Maya Shrestha', resolvedCount: 2, reputation: 40, avatar: 'MS' }
      ];

      return mockList
        .sort((a, b) => b.reputation - a.reputation)
        .slice(0, 5);
    }
  }
};
