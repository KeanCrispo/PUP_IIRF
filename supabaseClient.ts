import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://npyyaoddrquxwvkliupl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5weXlhb2RkcnF1eHd2a2xpdXBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTQyOTYsImV4cCI6MjA2NTI3MDI5Nn0.aBXknpBk6wq0YgFjVYfSZm2GqUacieZNq8-rny__Et0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);