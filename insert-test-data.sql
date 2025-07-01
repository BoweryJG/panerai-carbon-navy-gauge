-- Insert test data into your existing sales_metrics table
-- This matches your actual table structure

INSERT INTO public.sales_metrics (
    user_id,
    period,
    period_start,
    period_end,
    quota_target,
    quota_achieved,
    quota_percentage,
    pipeline_value,
    pipeline_count,
    pipeline_velocity,
    pipeline_coverage,
    opportunities_total,
    opportunities_won,
    opportunities_lost,
    win_rate,
    revenue_closed,
    revenue_recurring,
    average_deal_size
) VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479', -- Replace with actual user_id or use NULL
    'monthly', -- Assuming this is the period type
    '2025-01-01', -- period_start
    '2025-01-31', -- period_end
    500000.00, -- quota_target
    375000.00, -- quota_achieved
    75.00, -- quota_percentage
    1250000.00, -- pipeline_value
    35, -- pipeline_count
    4.5, -- pipeline_velocity (days)
    3.33, -- pipeline_coverage
    48, -- opportunities_total
    15, -- opportunities_won
    20, -- opportunities_lost
    31.25, -- win_rate
    425000.00, -- revenue_closed
    85000.00, -- revenue_recurring
    28333.33 -- average_deal_size
);

-- You can also insert multiple rows with different values
INSERT INTO public.sales_metrics (
    user_id,
    period,
    period_start,
    period_end,
    quota_target,
    quota_achieved,
    quota_percentage,
    pipeline_value,
    pipeline_count,
    pipeline_velocity,
    pipeline_coverage,
    opportunities_total,
    opportunities_won,
    opportunities_lost,
    win_rate,
    revenue_closed,
    revenue_recurring,
    average_deal_size
) VALUES 
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'monthly',
    '2025-01-01',
    '2025-01-31',
    500000.00,
    412000.00,
    82.40,
    1450000.00,
    42,
    5.2,
    3.52,
    55,
    18,
    25,
    32.73,
    480000.00,
    92000.00,
    26667.00
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'monthly',
    '2025-01-01',
    '2025-01-31',
    500000.00,
    525000.00,
    105.00,
    1800000.00,
    38,
    3.8,
    3.43,
    60,
    22,
    28,
    36.67,
    620000.00,
    105000.00,
    28182.00
);