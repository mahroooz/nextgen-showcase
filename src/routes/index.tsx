import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight, Code, Smartphone, Palette, Cloud, Sparkles, PenTool, Star, Zap, Shield, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/layout/SiteShell";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero.jpg";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Code, Smartphone, Palette, Cloud, Sparkles, PenTool,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Webz — Strategy, design & engineering" },
      { name: "description", content: "We design and build digital products that move companies forward. Web, mobile, AI, cloud, and design — under one roof." },
      { property: "og:title", content: "Webz" },
      { property: "og:description", content: "We build what's next — web, mobile, AI, cloud, design." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const services = useQuery({
    queryKey: ["services-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services").select("*").eq("active", true).order("sort_order").limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  const featured = useQuery({
    queryKey: ["projects-featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects").select("*").eq("featured", true).order("sort_order").limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  const testimonials = useQuery({
    queryKey: ["testimonials-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials").select("*").eq("approved", true).order("created_at", { ascending: false }).limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="" className="h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background" />
          <div className="absolute inset-0 bg-grid opacity-50" />
        </div>
        <div className="container mx-auto px-4 md:px-6 pt-24 pb-32 md:pt-32 md:pb-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 backdrop-blur px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Now booking Q3 2026 engagements
            </span>
            <h1 className="mt-6 font-display text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight">
              We build <span className="text-gradient">what's next</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Webz is a product studio that designs, engineers, and scales digital products
              for ambitious companies. From first sketch to millions of users.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-[image:var(--gradient-hero)] text-primary-foreground border-0 hover:opacity-90 hover:bg-[image:var(--gradient-hero)] shadow-[var(--shadow-glow)]">
                <Link to="/order">Start a project <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/portfolio">View our work</Link>
              </Button>
            </div>
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl">
              {[
                { v: "120+", l: "Products shipped" },
                { v: "48", l: "Engineers & designers" },
                { v: "14", l: "Countries served" },
                { v: "4.9", l: "Avg client rating" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-3xl font-semibold">{s.v}</div>
                  <div className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="container mx-auto px-4 md:px-6 py-24">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Services</span>
              <h2 className="mt-2 font-display text-4xl md:text-5xl font-semibold">What we do best</h2>
            </div>
            <p className="max-w-md text-muted-foreground">Full-stack capability across product strategy, design, and engineering — wherever your bottleneck is, we can plug in.</p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(services.data ?? []).map((s, i) => {
            const Icon = ICONS[s.icon ?? "Code"] ?? Code;
            return (
              <Reveal key={s.id} delay={i * 0.05}>
                <Card className="group relative h-full p-6 bg-card border-border hover:border-primary/40 hover:shadow-[var(--shadow-glow)] transition-all">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-primary group-hover:bg-[image:var(--gradient-hero)] group-hover:text-primary-foreground transition">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                  <Link to="/services" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all">
                    Learn more <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Featured Portfolio */}
      <section className="container mx-auto px-4 md:px-6 py-24">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Selected work</span>
              <h2 className="mt-2 font-display text-4xl md:text-5xl font-semibold">Featured projects</h2>
            </div>
            <Button asChild variant="outline"><Link to="/portfolio">All projects <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(featured.data ?? []).slice(0, 4).map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <Link to="/portfolio" className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-90" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="text-xs font-medium text-primary mb-2">{p.category}</div>
                    <h3 className="font-display text-2xl font-semibold">{p.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="container mx-auto px-4 md:px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Why Webz</span>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-semibold">A studio built for outcomes</h2>
            <p className="mt-4 text-muted-foreground">We don't sell deliverables. We ship products that perform — measured by your users, your revenue, your reliability.</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { icon: Zap, title: "Ship in weeks", desc: "Vertical-slice delivery from week one." },
              { icon: Shield, title: "Built to scale", desc: "Production-grade from day one — not later." },
              { icon: Users, title: "Embedded team", desc: "Senior people. No handoffs." },
              { icon: Star, title: "Proven track", desc: "120+ products, 4.9 avg client rating." },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.05}>
                <Card className="h-full p-5 bg-card border-border">
                  <f.icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 font-display text-base font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 md:px-6 py-24">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Clients</span>
          <h2 className="mt-2 font-display text-4xl md:text-5xl font-semibold mb-12">Trusted by ambitious teams</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(testimonials.data ?? []).map((t, i) => (
            <Reveal key={t.id} delay={i * 0.05}>
              <Card className="h-full p-6 bg-card border-border">
                <div className="flex gap-0.5 text-primary">
                  {Array.from({ length: t.rating }).map((_, k) => <Star key={k} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="mt-4 text-sm text-foreground leading-relaxed">"{t.content}"</p>
                <div className="mt-5 flex items-center gap-3">
                  {t.avatar_url && <img src={t.avatar_url} alt={t.name} className="h-10 w-10 rounded-full object-cover" loading="lazy" />}
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{[t.role, t.company].filter(Boolean).join(" · ")}</div>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 md:px-6 py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 md:p-16 text-center">
            <div className="absolute inset-0 -z-10 bg-grid opacity-40" />
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[36rem] rounded-full bg-[image:var(--gradient-hero)] opacity-30 blur-3xl" />
            <h2 className="font-display text-3xl md:text-5xl font-semibold max-w-3xl mx-auto">Have something ambitious to build?</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Tell us about it. We'll respond within one business day.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="bg-[image:var(--gradient-hero)] text-primary-foreground border-0 hover:opacity-90 hover:bg-[image:var(--gradient-hero)]"><Link to="/order">Start a project</Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/contact">Get in touch</Link></Button>
            </div>
          </div>
        </Reveal>
      </section>
    </SiteShell>
  );
}
