// src/services/supabase.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sem as variáveis no .env o site continua funcionando com o cardápio local
// (src/data/produtos.js), mas a área de administração fica indisponível.
export const supabaseConfigurado = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = supabaseConfigurado
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
