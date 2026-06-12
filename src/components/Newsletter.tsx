import { useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeNewsletter } from "@/lib/contacts.functions";
import { toast } from "sonner";

const schema = z.object({ email: z.string().email() });

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const subscribe = useServerFn(subscribeNewsletter);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      toast.error("Please enter a valid email");
      return;
    }
    setLoading(true);
    try {
      await subscribe({ data: { email: parsed.data.email } });
      toast.success("Subscribed! Welcome aboard.");
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        required
        maxLength={254}
        className="bg-secondary border-border"
      />
      <Button type="submit" disabled={loading} size="sm">
        {loading ? "..." : "Join"}
      </Button>
    </form>
  );
}
