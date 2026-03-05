import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SERVICE_ROLE!);
async function main() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  console.log("PROFILES SCHEMA:", data, error);
}
main();
