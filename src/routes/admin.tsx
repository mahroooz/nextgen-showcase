import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  LayoutDashboard, FolderKanban, Briefcase, MessageSquare, ShoppingCart,
  FileText, Star, LogOut, Trash2, Mail, Shield, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import {
  getDashboardStats, updateOrderStatus, deleteRow,
  setTestimonialApproved, setPostPublished,
} from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — NextGen Digital Solutions" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  ssr: false,
  component: AdminPage,
});

type Section =
  | "overview" | "orders" | "contacts" | "projects"
  | "services" | "testimonials" | "blog" | "newsletter";

const NAV: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "contacts", label: "Contacts", icon: MessageSquare },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "services", label: "Services", icon: Briefcase },
  { id: "testimonials", label: "Testimonials", icon: Star },
  { id: "blog", label: "Blog", icon: FileText },
  { id: "newsletter", label: "Newsletter", icon: Mail },
];

function AdminPage() {
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin(user?.id);
  const navigate = useNavigate();

  if (loading || roleLoading) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  }
  if (!user) {
    navigate({ to: "/auth" });
    return null;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <div className="text-center max-w-md">
          <Shield className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 font-display text-3xl font-semibold">Not authorized</h1>
          <p className="mt-3 text-sm text-muted-foreground">Your account ({user.email}) isn't an admin.</p>
          <Button className="mt-6" variant="outline" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); }}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }
  return <AdminShell email={user.email ?? ""} />;
}

function AdminShell({ email }: { email: string }) {
  const [section, setSection] = useState<Section>("overview");
  const navigate = useNavigate();
  const active = NAV.find((n) => n.id === section)!;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b border-sidebar-border">
            <div className="flex items-center gap-2 px-2 py-3">
              <div className="h-8 w-8 rounded-md bg-primary/15 grid place-items-center text-primary">
                <Shield className="h-4 w-4" />
              </div>
              <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold">NextGen Admin</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Control panel</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Manage</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={section === item.id}
                        onClick={() => setSection(item.id)}
                        tooltip={item.label}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Shortcuts</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate({ to: "/" })} tooltip="Back to site">
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to site</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border">
            <div className="px-2 py-2 text-xs text-muted-foreground truncate group-data-[collapsible=icon]:hidden">
              {email}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2"
              onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); }}
            >
              <LogOut className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border px-4 sticky top-0 bg-background/80 backdrop-blur z-10">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <active.icon className="h-4 w-4 text-primary" />
              <h1 className="text-sm font-semibold">{active.label}</h1>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
            {section === "overview" && <Overview />}
            {section === "orders" && <OrdersTab />}
            {section === "contacts" && <ContactsTab />}
            {section === "projects" && <ProjectsTab />}
            {section === "services" && <ServicesTab />}
            {section === "testimonials" && <TestimonialsTab />}
            {section === "blog" && <BlogTab />}
            {section === "newsletter" && <NewsletterTab />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Overview() {
  const fetchStats = useServerFn(getDashboardStats);
  const { data } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fetchStats() });

  const cards = [
    { label: "Orders", value: data?.ordersCount ?? 0, sub: `${data?.pendingOrders ?? 0} pending` },
    { label: "Contacts", value: data?.contactsCount ?? 0, sub: `${data?.newContacts ?? 0} new` },
    { label: "Projects", value: data?.projectsCount ?? 0 },
    { label: "Services", value: data?.servicesCount ?? 0 },
    { label: "Posts", value: data?.postsCount ?? 0, sub: `${data?.publishedPosts ?? 0} published` },
    { label: "Testimonials", value: data?.testimonialsCount ?? 0, sub: `${data?.pendingTestimonials ?? 0} pending` },
    { label: "Subscribers", value: data?.subscribersCount ?? 0 },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="font-display text-3xl font-semibold">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">A quick snapshot of activity across the platform.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5 bg-card border-border">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
            <div className="mt-2 font-display text-3xl font-semibold">{c.value}</div>
            {c.sub && <div className="mt-1 text-xs text-muted-foreground">{c.sub}</div>}
          </Card>
        ))}
      </div>
      <Card className="p-6 bg-card border-border">
        <h3 className="font-display text-lg font-semibold mb-4">Orders — last 6 months</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.ordersByMonth ?? []}>
              <XAxis dataKey="month" stroke="currentColor" className="text-muted-foreground" fontSize={12} />
              <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function useTable<T>(table: string, order: string = "created_at", asc = false) {
  return useQuery<T[]>({
    queryKey: [`admin-${table}`],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).from(table).select("*").order(order, { ascending: asc });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

function OrdersTab() {
  const qc = useQueryClient();
  const { data: orders = [] } = useTable<any>("orders");
  const setStatus = useServerFn(updateOrderStatus);
  const del = useServerFn(deleteRow);
  const update = useMutation({
    mutationFn: (vars: { id: string; status: string }) =>
      setStatus({ data: vars as any }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-orders"] }); toast.success("Updated"); },
  });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { table: "orders", id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-orders"] }); toast.success("Deleted"); },
  });

  return (
    <Card className="bg-card border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No orders yet</TableCell></TableRow>}
          {orders.map((o) => (
            <TableRow key={o.id}>
              <TableCell>
                <div className="font-medium">{o.name}</div>
                <div className="text-xs text-muted-foreground">{o.email}</div>
              </TableCell>
              <TableCell>{o.service_name || "—"}</TableCell>
              <TableCell>{o.budget}</TableCell>
              <TableCell>
                <Select value={o.status} onValueChange={(v) => update.mutate({ id: o.id, status: v })}>
                  <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</TableCell>
              <TableCell><Button size="icon" variant="ghost" onClick={() => remove.mutate(o.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function ContactsTab() {
  const qc = useQueryClient();
  const { data: rows = [] } = useTable<any>("contacts");
  const del = useServerFn(deleteRow);
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { table: "contacts", id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-contacts"] }); toast.success("Deleted"); },
  });
  return (
    <Card className="bg-card border-border overflow-hidden">
      <Table>
        <TableHeader><TableRow>
          <TableHead>From</TableHead><TableHead>Subject</TableHead><TableHead>Message</TableHead><TableHead>Date</TableHead><TableHead></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {rows.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10">No messages</TableCell></TableRow>}
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell><div className="font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{r.email}</div></TableCell>
              <TableCell>{r.subject || "—"}</TableCell>
              <TableCell className="max-w-md truncate text-sm text-muted-foreground">{r.message}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
              <TableCell><Button size="icon" variant="ghost" onClick={() => remove.mutate(r.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

import { ResourceManager, type Field } from "@/components/admin/ResourceManager";

const projectFields: Field[] = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true, placeholder: "url-friendly-name" },
  { name: "category", label: "Category", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "image_url", label: "Cover image URL", type: "url" },
  { name: "tags", label: "Tags", type: "tags" },
  { name: "client", label: "Client", type: "text" },
  { name: "year", label: "Year", type: "number" },
  { name: "url", label: "Live URL", type: "url" },
  { name: "featured", label: "Featured", type: "boolean", default: false },
  { name: "sort_order", label: "Sort order", type: "number", default: 0 },
];

function ProjectsTab() {
  return (
    <ResourceManager
      table="projects"
      title="Projects"
      fields={projectFields}
      renderRow={(r) => (
        <div className="flex items-center gap-3">
          {r.image_url && <img src={r.image_url} alt="" className="h-12 w-16 object-cover rounded" />}
          <div>
            <div className="font-medium">{r.title}</div>
            <div className="text-xs text-muted-foreground">
              {r.category} · {r.year ?? ""} {r.featured && "· Featured"}
            </div>
          </div>
        </div>
      )}
    />
  );
}

const serviceFields: Field[] = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "icon", label: "Icon name", type: "text", placeholder: "e.g. sparkles" },
  { name: "price_from", label: "Price from", type: "number" },
  { name: "features", label: "Features", type: "tags", placeholder: "feature 1, feature 2" },
  { name: "active", label: "Active", type: "boolean", default: true },
  { name: "sort_order", label: "Sort order", type: "number", default: 0 },
];

function ServicesTab() {
  return (
    <ResourceManager
      table="services"
      title="Services"
      fields={serviceFields}
      renderRow={(r) => (
        <div>
          <div className="font-medium">{r.title}</div>
          <div className="text-xs text-muted-foreground">
            {r.price_from != null ? `From $${Number(r.price_from).toLocaleString()} · ` : ""}
            {r.active ? "Active" : "Inactive"}
          </div>
        </div>
      )}
    />
  );
}

const testimonialFields: Field[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "role", label: "Role", type: "text" },
  { name: "company", label: "Company", type: "text" },
  { name: "content", label: "Quote", type: "textarea", required: true },
  { name: "rating", label: "Rating (1-5)", type: "number", default: 5 },
  { name: "avatar_url", label: "Avatar URL", type: "url" },
  { name: "approved", label: "Approved", type: "boolean", default: false },
];

function TestimonialsTab() {
  const qc = useQueryClient();
  const approve = useServerFn(setTestimonialApproved);
  const setApproval = useMutation({
    mutationFn: (vars: { id: string; approved: boolean }) => approve({ data: vars }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-testimonials"] }); toast.success("Updated"); },
  });
  return (
    <ResourceManager
      table="testimonials"
      title="Testimonials"
      fields={testimonialFields}
      renderRow={(r) => (
        <div className="flex-1 flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="font-medium">{r.name}</div>
              <Badge variant={r.approved ? "default" : "secondary"}>{r.approved ? "Approved" : "Pending"}</Badge>
              <span className="text-xs text-muted-foreground">★ {r.rating}</span>
            </div>
            <div className="text-xs text-muted-foreground">{[r.role, r.company].filter(Boolean).join(" · ")}</div>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">"{r.content}"</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.stopPropagation(); setApproval.mutate({ id: r.id, approved: !r.approved }); }}
          >
            {r.approved ? "Unapprove" : "Approve"}
          </Button>
        </div>
      )}
    />
  );
}

const blogFields: Field[] = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true },
  { name: "excerpt", label: "Excerpt", type: "textarea" },
  { name: "content", label: "Content (markdown)", type: "textarea" },
  { name: "cover_image", label: "Cover image URL", type: "url" },
  { name: "tags", label: "Tags", type: "tags" },
  { name: "author", label: "Author", type: "text", default: "NextGen Team" },
  { name: "published", label: "Published", type: "boolean", default: false },
];

function BlogTab() {
  const qc = useQueryClient();
  const publish = useServerFn(setPostPublished);
  const setPub = useMutation({
    mutationFn: (vars: { id: string; published: boolean }) => publish({ data: vars }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-blog_posts"] }); toast.success("Updated"); },
  });
  return (
    <ResourceManager
      table="blog_posts"
      title="Blog posts"
      fields={blogFields}
      renderRow={(r) => (
        <div className="flex-1 flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="font-medium">{r.title}</div>
              <Badge variant={r.published ? "default" : "secondary"}>{r.published ? "Published" : "Draft"}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{r.excerpt}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.stopPropagation(); setPub.mutate({ id: r.id, published: !r.published }); }}
          >
            {r.published ? "Unpublish" : "Publish"}
          </Button>
        </div>
      )}
    />
  );
}


function NewsletterTab() {
  const { data: rows = [] } = useTable<any>("newsletter_subscribers");
  return (
    <Card className="bg-card border-border divide-y divide-border">
      {rows.length === 0 && <div className="p-10 text-center text-muted-foreground">No subscribers</div>}
      {rows.map((r) => (
        <div key={r.id} className="p-4 flex items-center justify-between">
          <div className="font-medium text-sm">{r.email}</div>
          <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
        </div>
      ))}
    </Card>
  );
}
