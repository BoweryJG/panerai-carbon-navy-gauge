-- Create the sales_metrics table for the Panerai Watch Dashboard
CREATE TABLE IF NOT EXISTS public.sales_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 12 O'Clock Metrics
    daily_sales DECIMAL(10, 2) DEFAULT 0,
    monthly_sales DECIMAL(10, 2) DEFAULT 0,
    leads_count INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5, 2) DEFAULT 0,
    active_deals INTEGER DEFAULT 0,
    
    -- 3 O'Clock Metrics
    daily_calls INTEGER DEFAULT 0,
    appointments_today INTEGER DEFAULT 0,
    follow_ups_pending INTEGER DEFAULT 0,
    revenue_today DECIMAL(10, 2) DEFAULT 0,
    
    -- 6 O'Clock Metrics
    team_rank INTEGER DEFAULT 1,
    quota_progress DECIMAL(10, 2) DEFAULT 0,
    avg_deal_size DECIMAL(10, 2) DEFAULT 0,
    close_rate DECIMAL(5, 2) DEFAULT 0,
    
    -- 9 O'Clock Gauge Metrics
    quota_percentage DECIMAL(5, 2) DEFAULT 0,
    monthly_progress DECIMAL(5, 2) DEFAULT 0,
    efficiency_score DECIMAL(5, 2) DEFAULT 0,
    satisfaction_rate DECIMAL(5, 2) DEFAULT 0
);

-- Create an index on created_at for faster queries
CREATE INDEX idx_sales_metrics_created_at ON public.sales_metrics(created_at DESC);

-- Create an index on user_id for user-specific queries
CREATE INDEX idx_sales_metrics_user_id ON public.sales_metrics(user_id);

-- Enable Row Level Security
ALTER TABLE public.sales_metrics ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to see their own metrics
CREATE POLICY "Users can view own metrics" ON public.sales_metrics
    FOR SELECT USING (auth.uid() = user_id);

-- Create a policy that allows users to insert their own metrics
CREATE POLICY "Users can insert own metrics" ON public.sales_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows users to update their own metrics
CREATE POLICY "Users can update own metrics" ON public.sales_metrics
    FOR UPDATE USING (auth.uid() = user_id);

-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales_metrics;

-- Insert sample data (optional - remove in production)
INSERT INTO public.sales_metrics (
    user_id,
    daily_sales, monthly_sales, leads_count, conversion_rate, active_deals,
    daily_calls, appointments_today, follow_ups_pending, revenue_today,
    team_rank, quota_progress, avg_deal_size, close_rate,
    quota_percentage, monthly_progress, efficiency_score, satisfaction_rate
) VALUES (
    NULL, -- Set to NULL for demo data, or use a specific user_id
    45000, 380000, 67, 23.5, 12,
    45, 8, 15, 18500,
    3, 285000, 35000, 28.5,
    75, 68, 82, 94
);