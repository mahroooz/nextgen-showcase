import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Code, Smartphone, Palette, Cloud, Sparkles, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/layout/SiteShell";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Code, Smartphone, Palette, Cloud, Sparkles, PenTool,
};

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services & Pricing — Webz" },
      { name: "description", content: "Web, mobile, UI/UX, cloud, AI, and branding services. Transparent starting prices and clear deliverables." },
      { property: "og:title", content: "Services & Pricing — Webz" },
      { property: "og:description", content: "Web, mobile, UI/UX, cloud, AI, and branding services." },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: services = [] } = useQuery({
    queryKey: ["services-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").eq("active", true).order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <SiteShell>
      <section className="container mx-auto px-4 md:px-6 pt-20 pb-12">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Services</span>
          <h1 className="mt-2 font-display text-5xl md:text-6xl font-semibold">Capabilities that scale with you</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">From discovery to launch and beyond — pick a service or combine them into an end-to-end engagement.</p>
        </Reveal>
      </section>

      <section className="container mx-auto px-4 md:px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => {
            const Icon = ICONS[s.icon ?? "Code"] ?? Code;
            return (
              <Reveal key={s.id} delay={(i % 3) * 0.05}>
                <Card className="h-full p-7 bg-card border-border hover:border-primary/40 transition-colors flex flex-col">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                  <ul className="mt-5 space-y-2.5 flex-1">
                    {(s.features ?? []).map((f: string) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7 flex items-baseline gap-2">
                    <span className="text-xs text-muted-foreground">starts at</span>
                    <span className="font-display text-3xl font-semibold">${Number(s.price_from).toLocaleString()}</span>
                  </div>
                  <Button asChild className="mt-5 w-full">
                    <Link to="/order" search={{}}>
                      Order this service <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 py-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 md:p-16">
            <div className="absolute -right-32 top-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
            <div className="grid md:grid-cols-2 gap-8 items-center relative">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-semibold">Not sure where to start?</h2>
                <p className="mt-3 text-muted-foreground">Book a free 30-minute discovery call. We'll scope, estimate, and recommend a plan with no obligation.</p>
              </div>
              <div className="flex md:justify-end gap-3">
                <Button asChild size="lg" className="bg-[image:var(--gradient-hero)] text-primary-foreground border-0 hover:opacity-90 hover:bg-[image:var(--gradient-hero)]"><Link to="/contact">Talk to us</Link></Button>
                <Button asChild size="lg" variant="outline"><Link to="/order">Start order</Link></Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </SiteShell>
  );
}
