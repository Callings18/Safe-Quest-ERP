import { supabase } from "@/integrations/supabase/client";

export async function nextDocumentNumber(prefix: string) {
  const { data, error } = await supabase.rpc("next_document_number", { p_prefix: prefix });
  if (error || !data) {
    return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
  }
  return data;
}
