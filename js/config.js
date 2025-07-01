// Configuration Management
class ConfigManager {
    constructor() {
        this.config = this.loadConfig();
        this.defaults = {
            metrics: {
                '12': { metric: 'daily_sales', color: '#00ff00' },
                '3': { metric: 'daily_calls', color: '#00ff00' },
                '6': { metric: 'team_rank', color: '#00ff00' },
                '9': { metric: 'quota_percentage', color: '#00ff00' }
            },
            supabase: {
                url: 'https://cbopynuvhcymbumjnvay.supabase.co',
                key: '',
                table: 'sales_metrics'
            },
            updateInterval: 5000, // 5 seconds
            animations: true
        };
    }

    loadConfig() {
        const saved = localStorage.getItem('panerai-watch-config');
        return saved ? JSON.parse(saved) : null;
    }

    saveConfig(config) {
        localStorage.setItem('panerai-watch-config', JSON.stringify(config));
        this.config = config;
        return true;
    }

    getConfig() {
        return this.config || this.defaults;
    }

    getMetricConfig(position) {
        const config = this.getConfig();
        return config.metrics[position] || this.defaults.metrics[position];
    }

    updateMetricConfig(position, metric, color) {
        const config = this.getConfig();
        if (!config.metrics) config.metrics = {};
        config.metrics[position] = { metric, color };
        this.saveConfig(config);
    }

    getSupabaseConfig() {
        const config = this.getConfig();
        return config.supabase || this.defaults.supabase;
    }

    updateSupabaseConfig(url, key, table) {
        const config = this.getConfig();
        config.supabase = { url, key, table };
        this.saveConfig(config);
    }
}

// Metric Definitions - Updated for your actual Supabase schema
const METRIC_DEFINITIONS = {
    // 12 O'Clock Metrics (Main KPIs)
    revenue_closed: {
        name: 'Revenue Closed',
        format: 'currency',
        query: 'revenue_closed'
    },
    quota_achieved: {
        name: 'Quota Achieved',
        format: 'currency',
        query: 'quota_achieved'
    },
    pipeline_value: {
        name: 'Pipeline Value',
        format: 'currency',
        query: 'pipeline_value'
    },
    revenue_recurring: {
        name: 'Recurring Revenue',
        format: 'currency',
        query: 'revenue_recurring'
    },
    quota_target: {
        name: 'Quota Target',
        format: 'currency',
        query: 'quota_target'
    },
    
    // 3 O'Clock Metrics (Activity)
    pipeline_count: {
        name: 'Pipeline Count',
        format: 'number',
        query: 'pipeline_count'
    },
    opportunities_total: {
        name: 'Total Opportunities',
        format: 'number',
        query: 'opportunities_total'
    },
    opportunities_won: {
        name: 'Opportunities Won',
        format: 'number',
        query: 'opportunities_won'
    },
    opportunities_lost: {
        name: 'Opportunities Lost',
        format: 'number',
        query: 'opportunities_lost'
    },
    
    // 6 O'Clock Metrics (Performance)
    average_deal_size: {
        name: 'Avg Deal Size',
        format: 'currency',
        query: 'average_deal_size'
    },
    win_rate: {
        name: 'Win Rate %',
        format: 'percentage',
        query: 'win_rate'
    },
    pipeline_velocity: {
        name: 'Pipeline Velocity',
        format: 'number',
        query: 'pipeline_velocity'
    },
    pipeline_coverage: {
        name: 'Pipeline Coverage',
        format: 'number',
        query: 'pipeline_coverage'
    },
    
    // 9 O'Clock Gauge Metrics
    quota_percentage: {
        name: 'Quota %',
        format: 'gauge',
        query: 'quota_percentage'
    },
    win_rate_gauge: {
        name: 'Win Rate',
        format: 'gauge',
        query: 'win_rate'
    },
    pipeline_coverage_gauge: {
        name: 'Pipeline Coverage',
        format: 'gauge',
        query: 'pipeline_coverage'
    },
    velocity_score: {
        name: 'Velocity Score',
        format: 'gauge',
        query: 'pipeline_velocity'
    }
};

// Value Formatters
const formatValue = (value, format) => {
    if (value === null || value === undefined) return '----';
    
    switch (format) {
        case 'currency':
            if (value >= 1000000) {
                return `${(value / 1000000).toFixed(1)}M`;
            } else if (value >= 1000) {
                return `${(value / 1000).toFixed(1)}K`;
            }
            return `$${Math.round(value)}`;
            
        case 'number':
            if (value >= 1000) {
                return `${(value / 1000).toFixed(1)}K`;
            }
            return value.toString().padStart(4, '0');
            
        case 'percentage':
            return `${Math.round(value)}%`;
            
        case 'rank':
            return `#${value}`;
            
        case 'gauge':
            return Math.min(100, Math.max(0, Math.round(value)));
            
        default:
            return value.toString().substring(0, 4);
    }
};

// Export for use in other modules
window.ConfigManager = ConfigManager;
window.METRIC_DEFINITIONS = METRIC_DEFINITIONS;
window.formatValue = formatValue;