import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/layout/SiteShell";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Webz" },
      { name: "description", content: "Field notes on product, design, engineering, and AI from the Webz team." },
      { property: "og:title", content: "Blog — Webz" },
      { property: "og:description", content: "Field notes on product, design, engineering, and AI." },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogPage,
});

function BlogPage() {
  const { data: posts = [] } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts").select("*").eq("published", true).order("published_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <SiteShell>
      <section className="container mx-auto px-4 md:px-6 pt-20 pb-12">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Blog</span>
          <h1 className="mt-2 font-display text-5xl md:text-6xl font-semibold">Field notes</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">What we're learning, shipping, and thinking about.</p>
        </Reveal>
      </section>

      <section className="container mx-auto px-4 md:px-6 pb-24">
        {posts.length === 0 ? (
          <p className="text-center py-20 text-muted-foreground">No posts yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 0.05}>
                <Card className="overflow-hidden bg-card border-border h-full flex flex-col hover:border-primary/40 transition">
                  {p.cover_image && (
                    <div className="aspect-[16/10] overflow-hidden bg-secondary">
                      <img src={p.cover_image} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(p.tags ?? []).slice(0, 2).map((t: string) => <Badge key={t} variant="secondary">{t}</Badge>)}
                    </div>
                    <h3 className="font-display text-xl font-semibold">{p.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">{p.excerpt}</p>
                    <div className="mt-5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {p.published_at ? new Date(p.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
