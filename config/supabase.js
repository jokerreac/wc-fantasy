import { SUPABASE_URL, SUPABASE_SECRET_KEY } from "./env.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

export default supabase;