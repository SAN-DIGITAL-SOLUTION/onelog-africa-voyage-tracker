import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://fhiegxnqgjlgpbywujzo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoaWVneG5xZ2psZ3BieXd1anpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTM4OTgsImV4cCI6MjA2NTQ2OTg5OH0.zBjwrD5r1zDLHcjQKd0gpU8IVLxfKHuHDeNi7XYkNK0";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testTableExists() {
  try {
    console.log('Testing table_exists RPC function...');
    
    const { data, error } = await supabase
      .rpc('table_exists', { p_table_name: 'user_roles' });
    
    if (error) {
      console.error('Error calling table_exists:', error);
      return;
    }
    
    console.log('table_exists response:', data);
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testTableExists();
