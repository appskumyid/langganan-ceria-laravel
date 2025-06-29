
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://fdpvsxkrenuypunrfknn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkcHZzeGtyZW51eXB1bnJma25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE3NzMsImV4cCI6MjA2NTQ2Nzc3M30.UIpCRUr-VCWgtLaWtLGK9ZqK7QhoU7ywYdRO9LOL70w';

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("Supabase URL and Anon Key must be provided.");
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
