import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://cwcsjlitwpxxohbzlxpf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3Y3NqbGl0d3B4eG9oYnpseHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg2ODYzNTUsImV4cCI6MjAxNDI2MjM1NX0.ijLs5E5Z1BPIRtt5dQWVkoyG9A8QIpsTbxVst3e7V9c"
);
