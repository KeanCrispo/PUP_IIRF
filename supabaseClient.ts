import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yxomyajzievfcugishos.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4b215YWp6aWV2ZmN1Z2lzaG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MDE3ODYsImV4cCI6MjA5Mjk3Nzc4Nn0.L9a6QG_66T119oKlWM76OI-626efwiThkTTsc_-rOkA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
