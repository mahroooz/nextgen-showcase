import { createFileRoute, Link } from "@tanstack/react-router";
import { Target, Eye, Heart, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/layout/SiteShell";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — NextGen Digital Solutions" },
      { name: "description", content: "The people, history, mission, and vision behind NextGen Digital Solutions." },
      { property: "og:title", content: "About — NextGen Digital Solutions" },
      { property: "og:description", content: "The people, history, mission, and vision behind NextGen Digital Solutions." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const TEAM = [
  { name: "Alex Morrow", role: "Founder & CEO", avatar: "https://i.pravatar.cc/300?img=11" },
  { name: "Lena Park", role: "Head of Design", avatar: "https://i.pravatar.cc/300?img=49" },
  { name: "Jamal Reyes", role: "VP Engineering", avatar: "https://i.pravatar.cc/300?img=14" },
  { name: "Naomi Lindqvist", role: "Director, AI", avatar: "https://i.pravatar.cc/300?img=44" },
  { name: "Ravi Suresh", role: "Principal Engineer", avatar: "https://i.pravatar.cc/300?img=13" },
  { name: "Mia Okonkwo", role: "Product Lead", avatar: "https://i.pravatar.cc/300?img=48" },
];

const HISTORY = [
  { year: "2017", title: "Founded in San Francisco", desc: "Started as a 3-person studio for early-stage startups." },
  { year: "2019", title: "First Fortune 500 engagement", desc: "Shipped a flagship product for a major financial institution." },
  { year: "2021", title: "Opened London & Singapore", desc: "Grew to 24 across three continents." },
  { year: "2023", title: "AI practice launched", desc: "Dedicated team for ML/AI integration and applied research." },
  { year: "2025", title: "48 people, 14 countries served", desc: "120+ products shipped, NPS 78." },
];

function AboutPage() {
  return (
    <SiteShell>
      <section className="container mx-auto px-4 md:px-6 pt-20 pb-12">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">About</span>
          <h1 className="mt-2 font-display text-5xl md:text-6xl font-semibold">Builders, not vendors</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">We started NextGen because we kept seeing great ideas held back by mediocre execution. We're a studio of senior people who actually ship.</p>
        </Reveal>
      </section>

      <section className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Target, label: "Mission", body: "Help ambitious teams ship better products, faster, without compromise." },
            { icon: Eye, label: "Vision", body: "A world where great software is the default, not the exception." },
            { icon: Heart, label: "Values", body: "Craft. Honesty. Outcomes. We say no to work we can't be proud of." },
          ].map((b, i) => (
            <Reveal key={b.label} delay={i * 0.05}>
              <Card className="h-full p-7 bg-card border-border">
                <b.icon className="h-6 w-6 text-primary" />
                <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">{b.label}</div>
                <p className="mt-2 font-display text-2xl font-semibold">{b.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 py-16">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">History</span>
          <h2 className="mt-2 font-display text-4xl md:text-5xl font-semibold mb-10">A short history</h2>
        </Reveal>
        <div className="relative pl-8 border-l border-border space-y-10">
          {HISTORY.map((h, i) => (
            <Reveal key={h.year} delay={i * 0.05}>
              <div className="relative">
                <span className="absolute -left-[37px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                <div className="font-display text-xl font-semibold text-primary">{h.year}</div>
                <div className="mt-1 text-lg font-medium">{h.title}</div>
                <p className="text-sm text-muted-foreground">{h.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 py-16">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Team</span>
          <h2 className="mt-2 font-display text-4xl md:text-5xl font-semibold mb-10">The people behind the work</h2>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {TEAM.map((p, i) => (
            <Reveal key={p.name} delay={(i % 6) * 0.04}>
              <div className="group">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
                  <img src={p.avatar} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                </div>
                <div className="mt-3 font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.role}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 py-16">
        <Reveal>
          <Card className="p-10 md:p-14 bg-card border-border text-center">
            <Trophy className="h-8 w-8 mx-auto text-primary" />
            <h2 className="mt-4 font-display text-3xl md:text-4xl font-semibold">Want to build with us?</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">We take on a limited number of engagements each quarter.</p>
            <Button asChild size="lg" className="mt-6 bg-[image:var(--gradient-hero)] text-primary-foreground border-0 hover:opacity-90 hover:bg-[image:var(--gradient-hero)]">
              <Link to="/order">Start a project</Link>
            </Button>
          </Card>
        </Reveal>
      </section>
    </SiteShell>
  );
}
