// Supabase Connection Manager
class SupabaseManager {
    constructor(configManager) {
        this.configManager = configManager;
        this.client = null;
        this.subscription = null;
        this.connectionStatus = 'disconnected';
        this.callbacks = {
            onData: null,
            onStatusChange: null
        };
        this.reconnectTimer = null;
        this.reconnectAttempts = 0;
    }

    async connect() {
        const config = this.configManager.getSupabaseConfig();
        
        if (!config.url || !config.key) {
            console.error('Supabase credentials not configured');
            this.updateStatus('error');
            return false;
        }

        try {
            // Initialize Supabase client
            this.client = window.supabase.createClient(config.url, config.key);
            
            // Test connection with a simple query
            const { data, error } = await this.client
                .from(config.table)
                .select('*')
                .limit(1);
            
            if (error) {
                console.error('Supabase connection error:', error);
                this.updateStatus('error');
                return false;
            }
            
            this.updateStatus('connected');
            this.reconnectAttempts = 0;
            
            // Set up real-time subscription
            this.setupRealtimeSubscription();
            
            return true;
        } catch (error) {
            console.error('Failed to connect to Supabase:', error);
            this.updateStatus('error');
            this.scheduleReconnect();
            return false;
        }
    }

    setupRealtimeSubscription() {
        if (!this.client) return;
        
        const config = this.configManager.getSupabaseConfig();
        
        // Subscribe to changes in the sales_metrics table
        this.subscription = this.client
            .channel('sales-metrics-changes')
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: config.table 
                }, 
                (payload) => {
                    console.log('Real-time update:', payload);
                    this.handleRealtimeUpdate(payload);
                }
            )
            .subscribe((status) => {
                console.log('Subscription status:', status);
                if (status === 'SUBSCRIBED') {
                    this.updateStatus('connected');
                }
            });
    }

    async fetchMetrics(userId = null) {
        if (!this.client) {
            await this.connect();
            if (!this.client) return null;
        }
        
        const config = this.configManager.getSupabaseConfig();
        
        try {
            let query = this.client.from(config.table).select('*');
            
            // If userId is provided, filter by user
            if (userId) {
                query = query.eq('user_id', userId);
            }
            
            // Get the most recent metrics
            query = query.order('created_at', { ascending: false }).limit(1);
            
            const { data, error } = await query;
            
            if (error) {
                console.error('Error fetching metrics:', error);
                return null;
            }
            
            return data && data.length > 0 ? data[0] : null;
        } catch (error) {
            console.error('Failed to fetch metrics:', error);
            return null;
        }
    }

    handleRealtimeUpdate(payload) {
        if (this.callbacks.onData) {
            this.callbacks.onData(payload.new || payload.old);
        }
    }

    updateStatus(status) {
        this.connectionStatus = status;
        if (this.callbacks.onStatusChange) {
            this.callbacks.onStatusChange(status);
        }
    }

    scheduleReconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        
        this.reconnectAttempts++;
        const delay = Math.min(5000 * this.reconnectAttempts, 30000); // Max 30 seconds
        
        console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
        
        this.reconnectTimer = setTimeout(() => {
            this.connect();
        }, delay);
    }

    disconnect() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
        
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        
        this.client = null;
        this.updateStatus('disconnected');
    }

    onData(callback) {
        this.callbacks.onData = callback;
    }

    onStatusChange(callback) {
        this.callbacks.onStatusChange = callback;
    }

    // Mock data generator for testing without Supabase
    generateMockData() {
        const quota_target = 500000;
        const quota_achieved = Math.floor(Math.random() * quota_target * 1.2);
        const opportunities_total = Math.floor(Math.random() * 100) + 20;
        const opportunities_won = Math.floor(opportunities_total * (Math.random() * 0.4 + 0.1));
        const opportunities_lost = Math.floor((opportunities_total - opportunities_won) * 0.7);
        
        return {
            quota_target: quota_target,
            quota_achieved: quota_achieved,
            quota_percentage: (quota_achieved / quota_target) * 100,
            pipeline_value: Math.floor(Math.random() * 2000000) + 500000,
            pipeline_count: Math.floor(Math.random() * 50) + 10,
            pipeline_velocity: Math.random() * 100,
            pipeline_coverage: Math.random() * 5 + 1,
            opportunities_total: opportunities_total,
            opportunities_won: opportunities_won,
            opportunities_lost: opportunities_lost,
            win_rate: (opportunities_won / opportunities_total) * 100,
            revenue_closed: Math.floor(Math.random() * 1000000) + 100000,
            revenue_recurring: Math.floor(Math.random() * 200000) + 50000,
            average_deal_size: Math.floor(Math.random() * 50000) + 10000
        };
    }
}

// Export for use in other modules
window.SupabaseManager = SupabaseManager;