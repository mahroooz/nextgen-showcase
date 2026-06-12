import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [orders, contacts, projects, posts, services, testimonials, subs] = await Promise.all([
      supabaseAdmin.from("orders").select("id,status,created_at,budget"),
      supabaseAdmin.from("contacts").select("id,status,created_at"),
      supabaseAdmin.from("projects").select("id"),
      supabaseAdmin.from("blog_posts").select("id,published"),
      supabaseAdmin.from("services").select("id"),
      supabaseAdmin.from("testimonials").select("id,approved"),
      supabaseAdmin.from("newsletter_subscribers").select("id"),
    ]);
    return {
      ordersCount: orders.data?.length ?? 0,
      pendingOrders: orders.data?.filter((o) => o.status === "pending").length ?? 0,
      contactsCount: contacts.data?.length ?? 0,
      newContacts: contacts.data?.filter((c) => c.status === "new").length ?? 0,
      projectsCount: projects.data?.length ?? 0,
      postsCount: posts.data?.length ?? 0,
      publishedPosts: posts.data?.filter((p) => p.published).length ?? 0,
      servicesCount: services.data?.length ?? 0,
      testimonialsCount: testimonials.data?.length ?? 0,
      pendingTestimonials: testimonials.data?.filter((t) => !t.approved).length ?? 0,
      subscribersCount: subs.data?.length ?? 0,
      ordersByMonth: groupByMonth(orders.data ?? []),
    };
  });

function groupByMonth(rows: Array<{ created_at: string }>) {
  const buckets: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const k = d.toLocaleString("en-US", { month: "short" });
    buckets[k] = 0;
  }
  for (const r of rows) {
    const d = new Date(r.created_at);
    const k = d.toLocaleString("en-US", { month: "short" });
    if (k in buckets) buckets[k]++;
  }
  return Object.entries(buckets).map(([month, count]) => ({ month, count }));
}

const updateOrderSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
});
export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateOrderSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const deleteSchema = z.object({ table: z.enum(["projects", "services", "testimonials", "blog_posts", "orders", "contacts"]), id: z.string().uuid() });
export const deleteRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => deleteSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from(data.table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const approveTestimonialSchema = z.object({ id: z.string().uuid(), approved: z.boolean() });
export const setTestimonialApproved = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => approveTestimonialSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("testimonials")
      .update({ approved: data.approved })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const publishPostSchema = z.object({ id: z.string().uuid(), published: z.boolean() });
export const setPostPublished = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => publishPostSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("blog_posts")
      .update({ published: data.published, published_at: data.published ? new Date().toISOString() : null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
