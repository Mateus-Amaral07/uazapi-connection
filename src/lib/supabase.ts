import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Em Server Actions, usamos a SERVICE ROLE KEY para poder ler/escrever na tabela contornando as regras de RLS (já que o admin dashboard não tem auth)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
