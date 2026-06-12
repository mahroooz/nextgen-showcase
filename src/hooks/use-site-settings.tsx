import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  whatsapp_number?: string;
  telegram_username?: string;
  instagram_username?: string;
  [k: string]: string | undefined;
};

export function useSiteSettings() {
  return useQuery<SiteSettings>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).from("site_settings").select("key,value");
      if (error) throw error;
      const out: SiteSettings = {};
      for (const r of data ?? []) out[r.key] = r.value ?? undefined;
      return out;
    },
    staleTime: 60_000,
  });
}
