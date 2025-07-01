-- Check if the sales_metrics table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'sales_metrics'
ORDER BY 
    ordinal_position;

-- If the table doesn't exist, this will return no rows
-- If it exists with different columns, we'll see what columns it has