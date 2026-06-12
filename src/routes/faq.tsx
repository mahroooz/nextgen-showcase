import { createFileRoute, Link } from "@tanstack/react-router";
import { HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/layout/SiteShell";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Webz" },
      { name: "description", content: "Common questions about working with Webz — pricing, process, timelines." },
      { property: "og:title", content: "FAQ — Webz" },
      { property: "og:description", content: "Common questions about working with Webz — pricing, process, timelines." },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }),
    }],
  }),
  component: FAQPage,
});

const FAQS = [
  { q: "How quickly can you start?", a: "Typically within 2–3 weeks of contract signing. Urgent work can sometimes be accommodated — ask us." },
  { q: "What does a typical engagement look like?", a: "Most engagements range from 6–24 weeks. We work in 2-week sprints with weekly stakeholder reviews and clear deliverables at the end of each sprint." },
  { q: "Do you work fixed-price or time-and-materials?", a: "Both. Discovery and prototypes are usually fixed-price. Build engagements default to time-and-materials with a not-to-exceed budget." },
  { q: "Will I own the code and IP?", a: "Yes. All IP transfers to you upon final payment. We hand over clean repos, documentation, and a knowledge transfer session." },
  { q: "Can you embed with our existing team?", a: "Yes — we frequently augment in-house teams. Our engineers slot into your tooling and ceremonies." },
  { q: "What tech stacks do you use?", a: "We're polyglot. Most projects land on TypeScript + React/Next/TanStack + Postgres + cloud-native infra, but we'll pick the right tool for your problem." },
  { q: "Do you sign NDAs?", a: "Always, before discussing project specifics. Mutual NDAs available on request." },
  { q: "What about ongoing maintenance?", a: "We offer retainer-based support after launch — typically 20–80 hours/month for monitoring, bug fixes, and incremental features." },
];

function FAQPage() {
  return (
    <SiteShell>
      <section className="container mx-auto px-4 md:px-6 pt-20 pb-12 max-w-3xl">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">FAQ</span>
          <h1 className="mt-2 font-display text-5xl md:text-6xl font-semibold">Questions, answered</h1>
          <p className="mt-4 text-muted-foreground">Everything you wanted to know before reaching out. If something isn't here, ask us directly.</p>
        </Reveal>
      </section>

      <section className="container mx-auto px-4 md:px-6 pb-16 max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="text-left text-base font-medium hover:text-primary hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="container mx-auto px-4 md:px-6 pb-24 max-w-3xl">
        <div className="rounded-3xl border border-border bg-card p-10 text-center">
          <HelpCircle className="h-7 w-7 mx-auto text-primary" />
          <h2 className="mt-4 font-display text-2xl font-semibold">Still curious?</h2>
          <p className="mt-2 text-muted-foreground">We're an email away.</p>
          <Button asChild className="mt-5"><Link to="/contact">Contact us</Link></Button>
        </div>
      </section>
    </SiteShell>
  );
}
