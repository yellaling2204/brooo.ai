import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  const email = 'user@brooo.ai';
  const password = 'Password123!';

  // Attempt signup or login
  let { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: 'Test Brooo' } },
  });

  if (error && error.message.includes('already registered')) {
    const signInRes = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    data = signInRes.data;
    error = signInRes.error;
  }

  if (error) {
    console.error('Failed to create/login test user:', error.message);
    process.exit(1);
  }

  console.log('SUCCESS:');
  console.log('USER_ID:', data.user?.id);
  console.log('TOKEN:', data.session?.access_token);
}

main();

