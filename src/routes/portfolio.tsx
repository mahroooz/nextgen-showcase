import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, X, ExternalLink, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SiteShell } from "@/components/layout/SiteShell";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Webz" },
      { name: "description", content: "Selected projects from Webz across web, mobile, AI, fintech, healthcare, and IoT." },
      { property: "og:title", content: "Portfolio — Webz" },
      { property: "og:description", content: "Selected projects across web, mobile, AI, fintech, healthcare, and IoT." },
      { property: "og:url", content: "/portfolio" },
    ],
    links: [{ rel: "canonical", href: "/portfolio" }],
  }),
  component: Portfolio,
});

type Project = {
  id: string; title: string; slug: string; category: string; description: string;
  image_url: string | null; tags: string[]; client: string | null; year: number | null; url: string | null;
};

function Portfolio() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [active, setActive] = useState<Project | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>(); projects.forEach((p) => set.add(p.category));
    return ["All", ...Array.from(set)];
  }, [projects]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return projects.filter((p) => {
      const matchesCat = cat === "All" || p.category === cat;
      const matchesQ =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesQ;
    });
  }, [projects, query, cat]);

  return (
    <SiteShell>
      <section className="container mx-auto px-4 md:px-6 pt-20 pb-12">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Portfolio</span>
          <h1 className="mt-2 font-display text-5xl md:text-6xl font-semibold">Selected work</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">A few projects we've helped bring into the world.</p>
        </Reveal>

        <div className="mt-10 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, tags, clients..."
              className="pl-10 bg-card border-border"
              maxLength={120}
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Clear">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                  c === cat ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 pb-24">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-card animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-20 text-muted-foreground">No projects match your search.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 0.05}>
                <button onClick={() => setActive(p)} className="group block text-left w-full">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary">
                    {p.image_url && (
                      <img src={p.image_url} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
                    <Badge className="absolute top-3 left-3 bg-background/80 text-foreground border border-border backdrop-blur">{p.category}</Badge>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="font-display text-xl font-semibold">{p.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                    </div>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-3xl bg-card border-border">
          {active && (
            <>
              <DialogHeader>
                <Badge className="w-fit mb-2 bg-secondary text-primary">{active.category}</Badge>
                <DialogTitle className="font-display text-3xl">{active.title}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {active.client && <>For <span className="text-foreground">{active.client}</span> · </>}
                  {active.year}
                </DialogDescription>
              </DialogHeader>
              {active.image_url && (
                <img src={active.image_url} alt={active.title} className="w-full aspect-[16/10] object-cover rounded-lg" loading="lazy" />
              )}
              <p className="text-sm text-foreground leading-relaxed">{active.description}</p>
              <div className="flex flex-wrap gap-2">
                {active.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
              </div>
              {active.url && (
                <Button asChild className="w-fit">
                  <a href={active.url} target="_blank" rel="noopener noreferrer">Visit project <ExternalLink className="h-4 w-4" /></a>
                </Button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </SiteShell>
  );
}
