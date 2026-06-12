import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Upload, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SiteShell } from "@/components/layout/SiteShell";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { submitOrder } from "@/lib/orders.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/order")({
  head: () => ({
    meta: [
      { title: "Start a project — Webz" },
      { name: "description", content: "Tell us about your project. We respond within one business day with a scope and estimate." },
      { property: "og:title", content: "Start a project — Webz" },
      { property: "og:description", content: "Tell us about your project and we'll get back within one business day." },
      { property: "og:url", content: "/order" },
    ],
    links: [{ rel: "canonical", href: "/order" }],
  }),
  component: OrderPage,
});

const BUDGETS = ["< $5k", "$5k – $15k", "$15k – $50k", "$50k – $150k", "$150k+"];

const formSchema = z.object({
  name: z.string().trim().min(1, "Required").max(120),
  email: z.string().trim().email("Invalid email").max(254),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  service_id: z.string().optional().or(z.literal("")),
  budget: z.string().min(1, "Pick a budget"),
  deadline: z.string().max(60).optional().or(z.literal("")),
  message: z.string().max(4000).optional().or(z.literal("")),
});

function OrderPage() {
  const submit = useServerFn(submitOrder);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "",
    service_id: "", budget: "", deadline: "", message: "",
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services-options"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("id,title").eq("active", true).order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function uploadFile(): Promise<string | null> {
    if (!file) return null;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return null;
    }
    const path = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("order-files").upload(path, file, { contentType: file.type });
    if (error) {
      toast.error("Upload failed: " + error.message);
      return null;
    }
    return path;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const filePath = await uploadFile();
      const serviceName = services.find((s) => s.id === form.service_id)?.title;
      await submit({
        data: {
          name: form.name,
          email: form.email,
          phone: form.phone || "",
          company: form.company || "",
          service_id: form.service_id || null,
          service_name: serviceName || "",
          budget: form.budget,
          deadline: form.deadline || "",
          message: form.message || "",
          file_url: filePath || "",
        },
      });
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit order");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <SiteShell>
        <section className="container mx-auto px-4 md:px-6 py-32 text-center max-w-xl">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold">Thank you</h1>
          <p className="mt-3 text-muted-foreground">Your project request is in. Expect a reply from our team within one business day.</p>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="container mx-auto px-4 md:px-6 pt-20 pb-12">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Get started</span>
          <h1 className="mt-2 font-display text-5xl md:text-6xl font-semibold">Start a project</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">Tell us what you're building. The more detail you share, the more useful our first reply will be.</p>
        </Reveal>
      </section>

      <section className="container mx-auto px-4 md:px-6 pb-32 max-w-3xl">
        <Card className="p-6 md:p-10 bg-card border-border">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your name *</Label>
                <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} required maxLength={120} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required maxLength={254} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} maxLength={40} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" value={form.company} onChange={(e) => update("company", e.target.value)} maxLength={200} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Service of interest</Label>
              <Select value={form.service_id} onValueChange={(v) => update("service_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Budget *</Label>
              <RadioGroup value={form.budget} onValueChange={(v) => update("budget", v)} className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {BUDGETS.map((b) => (
                  <label key={b} className="flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2.5 text-sm cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                    <RadioGroupItem value={b} />
                    {b}
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Ideal deadline</Label>
              <Input id="deadline" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} placeholder="e.g. Launch by Q4 2026" maxLength={60} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Project details</Label>
              <Textarea id="message" rows={6} value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Goals, audience, must-have features, references..." maxLength={4000} />
            </div>

            <div className="space-y-2">
              <Label>Attach a brief (optional, max 10MB)</Label>
              <label className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-secondary/30 p-6 cursor-pointer hover:border-primary/50 transition">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{file ? file.name : "Click to upload PDF, DOC, image..."}</span>
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.fig,.zip" />
              </label>
            </div>

            <Button type="submit" disabled={loading} size="lg" className="w-full bg-[image:var(--gradient-hero)] text-primary-foreground border-0 hover:opacity-90 hover:bg-[image:var(--gradient-hero)]">
              {loading ? "Sending..." : <>Send request <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>
        </Card>
      </section>
    </SiteShell>
  );
}
