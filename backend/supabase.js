import { createClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseKey } from './supabaseConfig.js'


// let supabase;

// if (!supabase) {
//     supabase = createClient(supabaseUrl, supabaseKey);
// }

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;