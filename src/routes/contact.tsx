import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/layout/SiteShell";
import { Reveal } from "@/components/Reveal";
import { submitContact } from "@/lib/contacts.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Webz" },
      { name: "description", content: "Talk to Webz. We answer within one business day." },
      { property: "og:title", content: "Contact Webz" },
      { property: "og:description", content: "We answer within one business day." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(1).max(4000),
});

function ContactPage() {
  const submit = useServerFn(submitContact);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await submit({ data: parsed.data });
      setSent(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteShell>
      <section className="container mx-auto px-4 md:px-6 pt-20 pb-12">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Contact</span>
          <h1 className="mt-2 font-display text-5xl md:text-6xl font-semibold">Let's talk</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">We respond within one business day.</p>
        </Reveal>
      </section>

      <section className="container mx-auto px-4 md:px-6 pb-24">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="space-y-5 lg:col-span-1">
            <Card className="p-6 bg-card border-border">
              <Mail className="h-5 w-5 text-primary" />
              <div className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Email</div>
              <a href="mailto:hello@webz.io" className="mt-1 block font-medium hover:text-primary">hello@webz.io</a>
            </Card>
            <Card className="p-6 bg-card border-border">
              <Phone className="h-5 w-5 text-primary" />
              <div className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Phone</div>
              <a href="tel:+15551234567" className="mt-1 block font-medium hover:text-primary">+1 (555) 123-4567</a>
            </Card>
            <Card className="p-6 bg-card border-border">
              <MapPin className="h-5 w-5 text-primary" />
              <div className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Office</div>
              <div className="mt-1 font-medium">350 Mission Street<br />San Francisco, CA 94105</div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-6 md:p-8 bg-card border-border">
              {sent ? (
                <div className="text-center py-12">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h2 className="mt-5 font-display text-2xl font-semibold">Message received</h2>
                  <p className="mt-2 text-sm text-muted-foreground">We'll be in touch shortly.</p>
                  <Button className="mt-6" variant="outline" onClick={() => setSent(false)}>Send another</Button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cname">Name *</Label>
                      <Input id="cname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={120} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cemail">Email *</Label>
                      <Input id="cemail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={254} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cphone">Phone</Label>
                      <Input id="cphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={40} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="csubject">Subject</Label>
                      <Input id="csubject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} maxLength={200} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cmessage">Message *</Label>
                    <Textarea id="cmessage" rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required maxLength={4000} />
                  </div>
                  <Button type="submit" disabled={loading} size="lg" className="w-full bg-[image:var(--gradient-hero)] text-primary-foreground border-0 hover:opacity-90 hover:bg-[image:var(--gradient-hero)]">
                    {loading ? "Sending..." : <>Send message <Send className="h-4 w-4" /></>}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 pb-24">
        <Reveal>
          <div className="overflow-hidden rounded-3xl border border-border aspect-[16/7]">
            <iframe
              title="Webz office location"
              src="https://www.google.com/maps?q=350+Mission+Street+San+Francisco&output=embed"
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="border-0 grayscale contrast-110"
            />
          </div>
        </Reveal>
      </section>
    </SiteShell>
  );
}
