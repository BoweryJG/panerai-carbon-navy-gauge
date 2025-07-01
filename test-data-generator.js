// Test Data Generator for Supabase
// Run this with Node.js to insert test data into your sales_metrics table

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cbopynuvhcymbumjnvay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib3B5bnV2aGN5bWJ1bWpudmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5OTUxNzMsImV4cCI6MjA1OTU3MTE3M30.UZElMkoHugIt984RtYWyfrRuv2rB67opQdCrFVPCfzU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Generate random data within realistic ranges
function generateSalesData() {
    return {
        // 12 O'Clock Metrics
        daily_sales: Math.floor(Math.random() * 50000) + 10000,
        monthly_sales: Math.floor(Math.random() * 500000) + 100000,
        leads_count: Math.floor(Math.random() * 100) + 20,
        conversion_rate: Math.round((Math.random() * 30 + 10) * 10) / 10,
        active_deals: Math.floor(Math.random() * 50) + 5,
        
        // 3 O'Clock Metrics
        daily_calls: Math.floor(Math.random() * 100) + 20,
        appointments_today: Math.floor(Math.random() * 20) + 1,
        follow_ups_pending: Math.floor(Math.random() * 30) + 5,
        revenue_today: Math.floor(Math.random() * 20000) + 5000,
        
        // 6 O'Clock Metrics
        team_rank: Math.floor(Math.random() * 20) + 1,
        quota_progress: Math.floor(Math.random() * 200000) + 50000,
        avg_deal_size: Math.floor(Math.random() * 50000) + 10000,
        close_rate: Math.round((Math.random() * 40 + 10) * 10) / 10,
        
        // 9 O'Clock Gauge Metrics
        quota_percentage: Math.round(Math.random() * 120),
        monthly_progress: Math.round(Math.random() * 100),
        efficiency_score: Math.round(Math.random() * 100),
        satisfaction_rate: Math.round(Math.random() * 100)
    };
}

// Insert initial data
async function insertInitialData() {
    const { data, error } = await supabase
        .from('sales_metrics')
        .insert([generateSalesData()]);
    
    if (error) {
        console.error('Error inserting data:', error);
    } else {
        console.log('Initial data inserted successfully');
    }
}

// Update data every 5 seconds
async function startRealtimeUpdates() {
    setInterval(async () => {
        const newData = generateSalesData();
        
        // Simulate gradual changes instead of random jumps
        const { data: lastData } = await supabase
            .from('sales_metrics')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        
        if (lastData) {
            // Make smaller incremental changes
            newData.daily_sales = lastData.daily_sales + (Math.random() - 0.5) * 5000;
            newData.daily_calls = lastData.daily_calls + Math.floor(Math.random() * 5);
            newData.leads_count = lastData.leads_count + Math.floor(Math.random() * 3);
            newData.quota_percentage = Math.min(100, Math.max(0, 
                lastData.quota_percentage + (Math.random() - 0.5) * 5
            ));
        }
        
        const { error } = await supabase
            .from('sales_metrics')
            .insert([newData]);
        
        if (error) {
            console.error('Error updating data:', error);
        } else {
            console.log('Data updated at', new Date().toISOString());
        }
    }, 5000);
}

// Run the generator
console.log('Starting sales data generator...');
console.log('URL:', supabaseUrl);
console.log('Press Ctrl+C to stop');

insertInitialData().then(() => {
    startRealtimeUpdates();
});