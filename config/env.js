import 'dotenv/config';

export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_SECRET_KEY=process.env.SUPABASE_SECRET_KEY;
export const SUPABASE_PUBLISHABLE_KEY=process.env.SUPABASE_PUBLISHABLE_KEY;

export const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;

console.log(process.env.FOOTBALL_API_KEY);
