import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  LayoutDashboard, FolderKanban, Briefcase, MessageSquare, ShoppingCart,
  FileText, Star, LogOut, Trash2, Check, X, Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import { SiteShell } from "@/components/layout/SiteShell";
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

function AdminPage() {
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin(user?.id);
  const navigate = useNavigate();

  if (loading || roleLoading) {
    return <SiteShell><div className="container mx-auto py-32 text-center text-muted-foreground">Loading...</div></SiteShell>;
  }
  if (!user) {
    navigate({ to: "/auth" });
    return null;
  }
  if (!isAdmin) {
    return (
      <SiteShell>
        <div className="container mx-auto py-32 text-center max-w-md">
          <h1 className="font-display text-3xl font-semibold">Not authorized</h1>
          <p className="mt-3 text-sm text-muted-foreground">Your account ({user.email}) isn't an admin.</p>
          <p className="mt-2 text-xs text-muted-foreground">First user wanting access? Ask the project owner to grant the admin role in the database.</p>
          <Button className="mt-6" variant="outline" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); }}>Sign out</Button>
        </div>
      </SiteShell>
    );
  }

  return <Dashboard email={user.email ?? ""} />;
}

function Dashboard({ email }: { email: string }) {
  const navigate = useNavigate();
  return (
    <SiteShell>
      <section className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Admin</span>
            <h1 className="mt-2 font-display text-4xl font-semibold">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Signed in as {email}</p>
          </div>
          <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); }}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="overview"><LayoutDashboard className="h-3.5 w-3.5"/> Overview</TabsTrigger>
            <TabsTrigger value="orders"><ShoppingCart className="h-3.5 w-3.5"/> Orders</TabsTrigger>
            <TabsTrigger value="contacts"><MessageSquare className="h-3.5 w-3.5"/> Contacts</TabsTrigger>
            <TabsTrigger value="projects"><FolderKanban className="h-3.5 w-3.5"/> Projects</TabsTrigger>
            <TabsTrigger value="services"><Briefcase className="h-3.5 w-3.5"/> Services</TabsTrigger>
            <TabsTrigger value="testimonials"><Star className="h-3.5 w-3.5"/> Testimonials</TabsTrigger>
            <TabsTrigger value="blog"><FileText className="h-3.5 w-3.5"/> Blog</TabsTrigger>
            <TabsTrigger value="newsletter"><Mail className="h-3.5 w-3.5"/> Newsletter</TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><Overview /></TabsContent>
          <TabsContent value="orders"><OrdersTab /></TabsContent>
          <TabsContent value="contacts"><ContactsTab /></TabsContent>
          <TabsContent value="projects"><ProjectsTab /></TabsContent>
          <TabsContent value="services"><ServicesTab /></TabsContent>
          <TabsContent value="testimonials"><TestimonialsTab /></TabsContent>
          <TabsContent value="blog"><BlogTab /></TabsContent>
          <TabsContent value="newsletter"><NewsletterTab /></TabsContent>
        </Tabs>
      </section>
    </SiteShell>
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
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
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
      const { data, error } = await supabase.from(table).select("*").order(order, { ascending: asc });
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

function GenericList({ table, columns }: { table: string; columns: (r: any) => React.ReactNode }) {
  const qc = useQueryClient();
  const { data: rows = [] } = useTable<any>(table);
  const del = useServerFn(deleteRow);
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { table: table as any, id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`admin-${table}`] }); toast.success("Deleted"); },
  });
  return (
    <Card className="bg-card border-border divide-y divide-border">
      {rows.length === 0 && <div className="p-10 text-center text-muted-foreground">Nothing here yet</div>}
      {rows.map((r) => (
        <div key={r.id} className="p-5 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">{columns(r)}</div>
          <Button size="icon" variant="ghost" onClick={() => remove.mutate(r.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}
    </Card>
  );
}

function ProjectsTab() {
  return <GenericList table="projects" columns={(r) => (
    <div className="flex items-center gap-3">
      {r.image_url && <img src={r.image_url} alt="" className="h-12 w-16 object-cover rounded" />}
      <div>
        <div className="font-medium">{r.title}</div>
        <div className="text-xs text-muted-foreground">{r.category} · {r.year ?? ""} {r.featured && "· Featured"}</div>
      </div>
    </div>
  )} />;
}

function ServicesTab() {
  return <GenericList table="services" columns={(r) => (
    <div>
      <div className="font-medium">{r.title}</div>
      <div className="text-xs text-muted-foreground">From ${Number(r.price_from).toLocaleString()} · {r.active ? "Active" : "Inactive"}</div>
    </div>
  )} />;
}

function TestimonialsTab() {
  const qc = useQueryClient();
  const { data: rows = [] } = useTable<any>("testimonials");
  const approve = useServerFn(setTestimonialApproved);
  const del = useServerFn(deleteRow);
  const setApproval = useMutation({
    mutationFn: (vars: { id: string; approved: boolean }) => approve({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-testimonials"] }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { table: "testimonials", id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-testimonials"] }),
  });
  return (
    <Card className="bg-card border-border divide-y divide-border">
      {rows.length === 0 && <div className="p-10 text-center text-muted-foreground">No testimonials</div>}
      {rows.map((r) => (
        <div key={r.id} className="p-5 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="font-medium">{r.name}</div>
              <Badge variant={r.approved ? "default" : "secondary"}>{r.approved ? "Approved" : "Pending"}</Badge>
            </div>
            <div className="text-xs text-muted-foreground">{[r.role, r.company].filter(Boolean).join(" · ")}</div>
            <p className="mt-2 text-sm text-muted-foreground">"{r.content}"</p>
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={() => setApproval.mutate({ id: r.id, approved: !r.approved })}>
              {r.approved ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={() => remove.mutate(r.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      ))}
    </Card>
  );
}

function BlogTab() {
  const qc = useQueryClient();
  const { data: rows = [] } = useTable<any>("blog_posts");
  const publish = useServerFn(setPostPublished);
  const del = useServerFn(deleteRow);
  const setPub = useMutation({
    mutationFn: (vars: { id: string; published: boolean }) => publish({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-blog_posts"] }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { table: "blog_posts", id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-blog_posts"] }),
  });
  return (
    <Card className="bg-card border-border divide-y divide-border">
      {rows.length === 0 && <div className="p-10 text-center text-muted-foreground">No posts</div>}
      {rows.map((r) => (
        <div key={r.id} className="p-5 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="font-medium">{r.title}</div>
              <Badge variant={r.published ? "default" : "secondary"}>{r.published ? "Published" : "Draft"}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{r.excerpt}</p>
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={() => setPub.mutate({ id: r.id, published: !r.published })}>
              {r.published ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={() => remove.mutate(r.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      ))}
    </Card>
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
