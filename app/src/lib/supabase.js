import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://atcnmlksqaevjaqccbrr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0Y25tbGtzcWFldmphcWNjYnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0OTE5NjUsImV4cCI6MjA4OTA2Nzk2NX0.JGsyxpU7nALzGv2fzUGoIG-oul5NAy-imB5amSMQ3iY';

export const supabase = createClient(supabaseUrl, supabaseKey);
