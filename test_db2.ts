import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SERVICE_ROLE!);
async function main() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(3);
  console.log("RECENT PROFILES:", data, error);
}
main();
