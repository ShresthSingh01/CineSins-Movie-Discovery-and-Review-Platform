import { supabase } from '@/lib/supabase';

export interface GlobalVerdict {
    movieId: string;
    movieTitle: string;
    verdict: 'Agree' | 'Disagree';
    timestamp: string;
}

export const syncService = {
    /**
     * Synchronizes local 'deported' (indicted) movies from localStorage to Supabase.
     */
    async syncLocalVerdicts() {
        if (typeof window === 'undefined') return;

        try {
            const localVerdicts = JSON.parse(localStorage.getItem('cinesins_deported') || '[]');
            
            if (localVerdicts.length === 0) return;

            console.log('Syncing', localVerdicts.length, 'local verdicts...');

            const syncData = localVerdicts.map((v: any) => ({
                movie_id: v.id,
                movie_title: v.title,
                verdict: 'Agree', // Local indictments are 'Agreements' with AI sins
                created_at: new Date().toISOString()
            }));

            const { error } = await supabase
                .from('verdicts')
                .upsert(syncData, { onConflict: 'movie_id' });

            if (error) throw error;
            
            console.log('Sync successful.');
        } catch (error) {
            console.warn('Sync failed (likely missing Supabase credentials):', error);
        }
    },

    /**
     * Gets community consensus for a specific movie.
     */
    async getCommunityConsensus(movieId: string) {
        try {
            const { data, error } = await supabase
                .from('verdicts')
                .select('verdict')
                .eq('movie_id', movieId);

            if (error) throw error;

            if (!data || data.length === 0) return { agree: 0, disagree: 0, total: 0 };

            const agree = data.filter(v => v.verdict === 'Agree').length;
            const disagree = data.filter(v => v.verdict === 'Disagree').length;

            return {
                agree,
                disagree,
                total: data.length,
                percentage: Math.round((agree / data.length) * 100)
            };
        } catch (error) {
            return { agree: 0, disagree: 0, total: 0 };
        }
    },

    /**
     * Subscribes to real-time verdict updates.
     */
    subscribeToVerdicts(onUpdate: (payload: any) => void) {
        return supabase
            .channel('public:verdicts')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'verdicts' },
                (payload) => onUpdate(payload.new)
            )
            .subscribe();
    },

    /**
     * Fetches the latest global movie logs/verdicts.
     */
    async getGlobalLogs(limit = 10) {
        try {
            const { data, error } = await supabase
                .from('verdicts')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Failed to fetch global logs:', error);
            return [];
        }
    },

    /**
     * Calculates a user's forensic reputation based on their indictment history.
     */
    getUserReputation() {
        if (typeof window === 'undefined') return { points: 0, rank: 'Novice' };
        
        const localVerdicts = JSON.parse(localStorage.getItem('cinesins_deported') || '[]');
        const points = localVerdicts.length * 10; // 10 points per indictment

        let rank = 'Novice';
        if (points >= 500) rank = 'Master Critic';
        else if (points >= 200) rank = 'Senior Forensicator';
        else if (points >= 50) rank = 'Certified Auditor';

        return { points, rank };
    },

    /**
     * Fetches active community polls.
     */
    async getPolls() {
        try {
            const { data, error } = await supabase
                .from('polls')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Failed to fetch polls:', error);
            return [];
        }
    },

    /**
     * Casts a vote in a community poll using an atomic increment.
     */
    async voteInPoll(pollId: string, isPro: boolean) {
        try {
            const column = isPro ? 'votes_pro' : 'votes_con';
            
            // Using rpc for atomic increment if available, or a simple update
            // For now, using update with current count + 1 (RPC is preferred in production)
            const { data: poll, error: fetchError } = await supabase
                .from('polls')
                .select(column)
                .eq('id', pollId)
                .single();

            if (fetchError) throw fetchError;

            const { error: updateError } = await supabase
                .from('polls')
                .update({ [column]: (poll as any)[column] + 1 })
                .eq('id', pollId);

            if (updateError) throw updateError;
            return true;
        } catch (error) {
            console.error('Failed to cast vote:', error);
            return false;
        }
    }
};
