import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xzxyxuzdgavlvkhxmxvx.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eHl4dXpkZ2F2bHZraHhteHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNDUyNTksImV4cCI6MjA3NTcyMTI1OX0.ggewVz01P0CZ8UuZ0BWaZ0AYDxETbwCesNJuNoOr9Kg'; 

export const supabase = createClient(supabaseUrl, supabaseKey);