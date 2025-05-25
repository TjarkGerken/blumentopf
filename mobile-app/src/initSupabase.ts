import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://roufluqgmrwmdhrektcr.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvdWZsdXFnbXJ3bWRocmVrdGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3Njk4NjQsImV4cCI6MjA2MzM0NTg2NH0.l4zDwff-2QcyJlYXaSFp1SgU_NMCcjGYNiNuOyJyUd8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
