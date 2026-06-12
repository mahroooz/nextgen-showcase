import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send, Instagram, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FIELDS: { key: string; label: string; placeholder: string; icon: React.ComponentType<{ className?: string }>; help: string }[] = [
  { key: "whatsapp_number", label: "WhatsApp number", placeholder: "15551234567", icon: MessageCircle, help: "Country code + number, digits only (no + or spaces)." },
  { key: "telegram_username", label: "Telegram username", placeholder: "webz", icon: Send, help: "Without the @ symbol." },
  { key: "instagram_username", label: "Instagram username", placeholder: "webz", icon: Instagram, help: "Without the @ symbol." },
];

export function SettingsTab() {
  const qc = useQueryClient();
  const { data: rows = [], isLoading } = useQuery<{ key: string; value: string | null }[]>({
    queryKey: ["admin-site_settings"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).from("site_settings").select("key,value");
      if (error) throw error;
      return data ?? [];
    },
  });

  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const next: Record<string, string> = {};
    for (const f of FIELDS) {
      const found = rows.find((r) => r.key === f.key);
      next[f.key] = found?.value ?? "";
    }
    setValues(next);
  }, [rows]);

  const save = useMutation({
    mutationFn: async (v: Record<string, string>) => {
      const payload = FIELDS.map((f) => ({ key: f.key, value: v[f.key]?.trim() || null, updated_at: new Date().toISOString() }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("site_settings").upsert(payload, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-site_settings"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Settings saved");
    },
    onError: (e: any) => toast.error(e.message ?? "Save failed"),
  });

  const wa = values.whatsapp_number?.replace(/\D/g, "");
  const tg = values.telegram_username?.replace(/^@/, "");
  const ig = values.instagram_username?.replace(/^@/, "");

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-primary/80 font-semibold">Webz · Settings</div>
        <h2 className="mt-1 font-display text-3xl font-semibold">Contact & Social</h2>
        <p className="text-sm text-muted-foreground mt-1">These values power the WhatsApp button and social links across the site.</p>
      </div>

      <Card className="p-6 bg-card border-border space-y-5">
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-2">
            <Label htmlFor={f.key} className="flex items-center gap-2">
              <f.icon className="h-4 w-4 text-primary" />
              {f.label}
            </Label>
            <Input
              id={f.key}
              placeholder={f.placeholder}
              disabled={isLoading}
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">{f.help}</p>
          </div>
        ))}

        <div className="flex justify-end pt-2">
          <Button onClick={() => save.mutate(values)} disabled={save.isPending}>
            <Save className="h-4 w-4 mr-1" />
            {save.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-card border-border">
        <h3 className="font-display text-lg font-semibold mb-3">Live preview</h3>
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <a
            href={wa ? `https://wa.me/${wa}` : "#"}
            target="_blank" rel="noopener noreferrer"
            className="rounded-lg border border-border p-3 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</div>
            <div className="mt-1 font-medium truncate">{wa ? `+${wa}` : "—"}</div>
          </a>
          <a
            href={tg ? `https://t.me/${tg}` : "#"}
            target="_blank" rel="noopener noreferrer"
            className="rounded-lg border border-border p-3 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider"><Send className="h-3.5 w-3.5" /> Telegram</div>
            <div className="mt-1 font-medium truncate">{tg ? `@${tg}` : "—"}</div>
          </a>
          <a
            href={ig ? `https://instagram.com/${ig}` : "#"}
            target="_blank" rel="noopener noreferrer"
            className="rounded-lg border border-border p-3 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider"><Instagram className="h-3.5 w-3.5" /> Instagram</div>
            <div className="mt-1 font-medium truncate">{ig ? `@${ig}` : "—"}</div>
          </a>
        </div>
      </Card>
    </div>
  );
}
